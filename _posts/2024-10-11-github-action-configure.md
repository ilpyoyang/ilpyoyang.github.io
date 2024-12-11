---
title: Github Action Configure 설정하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [DevOps]
tags: [Github Action]
pin: false
math: true
mermaid: true
---

배포용 shell 스크립트까지 작성하고 나서 보니 빌드가 성공했다고 나왔는데 API 확인을 해보니 동작하지 않았습니다. ```ps -ef | grep java```로 확인해보니 .jar 파일이 구동되고 있지 않다는 것을 알았습니다.  
정확한 내용을 확인하기 위해 CodeDeploy 이벤트 로그를 확인했습니다.
> CodeDeploy agent was not able to receive the lifecycle event. Check the CodeDeploy agent logs on your host and make sure the agent is running and can connect to the CodeDeploy server.

일단 S3 버킷에는 객체가 zip 파일 형태로 잘 만들어져 있었습니다. 그리고 CodeDeploy agent 상태(```sudo service codedeploy-agent status```)는 이상이 없었습니다.  
그렇다면, CodeDeploy에서 배포에 문제가 있는 것 같아 agent log과 shell 스크립트를 확인했습니다.
> 2023-08-08T03:17:15 INFO  [codedeploy-agent(24653)]: On Premises config file does not exist or not readable

직접 해결하기 위해서 CLI로 Github action에 등록한 Code Deploy를 진행해봤습니다. (run 내용에 변수 대입해서 진행)
```yml
- name: Code Deploy
  run: aws deploy create-deployment --application-name $CODE_DEPLOY_APP_NAME --deployment-config-name CodeDeployDefault.OneAtATime --deployment-group-name $DEPLOYMENT_GROUP_NAME --s3-location bucket=$BUCKET_NAME,bundleType=zip,key=$PROJECT_NAME/$GITHUB_SHA.zip
```
```aws configure```에 리전을 설정해야 해서 설정했습니다. 이 부분은 Github action .yml 조건과의 일치여부 때문에 발생하는 문제입니다.
```
You must specify a region. You can also configure your region by running "aws configure".
ubuntu@ip-172-31-34-122:~$ aws configure
AWS Access Key ID [****************XGTY]: 
AWS Secret Access Key [****************LL3f]: 
Default region name [None]: ap-northeast-2
```
```yml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-2
```

이번에는 다른 배포 실패 이벤트 로그가 발생했습니다.
> The overall deployment failed because too many individual instances failed deployment, too few healthy instances are available for deployment, or some instances in your deployment group are experiencing problems.  
> The specified key does not exist.

이벤트 로그 상세를 보니 S3 .zip 파일의 키값이 달라 인식하지 못하는 문제인 것 같아 전역변수로 ```GITHUB_SHA```를 등록해주었습니다. ```CodeDeploy```에서 DownloadBundle 상태가 진행이 되는 것을 볼 수 있었습니다.
```
env:
  GITHUB_SHA: ${{ github.sha }}
```

<br><br>

## Proxy Server
프록시라는 단어는 '대리하여 무엇인가를 하는 것'을 의미합니다. 즉, 프록시 서버는 자신을 통해 다른 네트워크 서비스에 간접적으로 접속할 수 있게 해주는 컴퓨터 시스템이나 응용 프로그램을 말합니다. 프록시 서버를 통해 client가 직접적으로 인터넷 리소스에 접근하는 것을 방지할 수 있습니다. 또한 다른 서버에서 client의 IP를 식별하는 것을 방지합니다.  
프록시 서버를 이용하므로 얻는 이점이 여러 가지가 있습니다. <span style="background-color:#fff5b1">일부 캐시를 저장해두어 원격 서버에 접속할 필요가 없기 때문에 전송시간을 절약할 수 있습니다.(Web Caches)</span> 만약 client가 요청한 내용의 cache file이 프록시 서버에 없다면 origin server의 데이터를 받아옵니다. 따라서 request 분산효과가 생기기 때문에 traffic이 감소합니다. 그리고 <span style="background-color:#fff5b1">외부와의 트래픽을 줄이므로 네트워크 병목현상을 방지할 수 있습니다.</span> 또한 보안과 필터링 기능을 제공합니다.   
무료 프록시 서버는 성능이슈와 보안상의 이슈가 있을 수 있어 사용에 주의해야 합니다. 그리고 암호화가 어디까지 진행되는지도 확인해 Full Encryption이 가능하게 해야 합니다. 프록시 서버는 original IP와 request 정보를 암호하지 않은 형식으로 저장하기 때문에 로그와 저장된 데이터를 확인할 필요가 있습니다.

<span style="background-color:#DCFFE4">그럼 프록시 서버와 로드밸런싱의 차이는 무엇일까?</span>  
둘 다 네트워크와 서버를 관리하는 도구입니다. 로드밸런서는 서버의 부하를 분산시켜 성능향상에 초점을 두고 있는 반면, 프록시 서버는 보안성을 높이는데 초점을 두고 있습니다. <span style="background-color:#fff5b1">AWS ELB</span>의 경우 기본적으로 로드밸런서 역할을 수행하며, HTTP/HTTPS 요청의 전달 및 분산, 자동 확장 등의 기능을 제공합니다. 따라서 경우에 따라서는 ELB가 두 가지 기능을 모두 수행하기 때문에 별도의 프록시 서버를 구축하지 않아도 됩니다. 하지만 특정 보안 요구사항이 있는 경우 직접 프록시 서버를 배포하는 것이 적절할 수도 있습니다.

다음은 대표적인 프록시 서버의 종류에 대한 설명입니다.

**Forward Proxy**  
클라이언트가 인터넷에 직접 접근하는게 아니라 포워드 프록시 서버가 요청을 받고 인터넷에 연결하여 결과를 클라이언트에 전달해줍니다.

**Reverse Proxy**  
클라이언트가 인터넷에 직접 접근하는게 아니라 포워드 프록시 서버가 요청을 받고 인터넷에 연결하여 결과를 클라이언트에 전달해줍니다.

<hr/>

[What is Proxy Server?](https://www.geeksforgeeks.org/what-is-proxy-server/)

<br><br>

## IIS 웹서버에서 Spring Boot 배포
자바 애플리케이션은 IIS에서 바로 배포하는 것이 아닌 Reverse Proxy를 이용한 배포를 권장하고 있습니다. Reverse Proxy가 가지는 장점을 적용할 수 있으며 자바 뿐만 아니라 PHP, Python, Ruby 등 동적 애플리케이션을 배포하는 경우에서도 동일합니다. 스프링 부트 프로젝트는 내장 톰캣을 WAS로 제공하고 있기 때문에 웹 서버 연동으로 포트를 변경해서 연동해 줄 수 있습니다. 여기서 IIS 관리자의 URL 재작성 페이지에서 규칙 추가를 해서 ARR 활성 상태에서 Reverse Proxy 설정을 할 수 있습니다. 필요 모듈이 없을 경우에는 아래 URL에서 필요한 모듈을 설치할 수 있습니다.
+ [URL Rewrite](https://iis-umbraco.azurewebsites.net/downloads/microsoft/url-rewrite)
+ [Microsoft Application Request Routing 3.0 (x64)](https://www.microsoft.com/en-us/download/details.aspx?id=47333)

![iis_reverse_proxy.png](/assets/post_images/server/iis_reverse_proxy.png)

그럼 IIS에서 **각 모듈이 어떻게 작동하는지** 알아보겠습니다.  
<span style="background-color:#fff5b1">Reverse Proxy</span>는 공용 네트워크에서 들어오는 client의 요청과 사설 네트워크에서 들어오는 백엔드 웹서버 통신이 가능하도록 하는 중간 역할을 하는 도구입니다. 그리고 IIS 서버에서 <span style="background-color:#fff5b1">ARR(Application Request Routing)</span>은 프록시 기반 라우팅 모듈로 로드밸런싱 기능과 백엔드 시스템과의 통합으로 애플리케이션 성능 개선을 지원합니다. ARR 활성상태에서 URL 재작성 및 리디렉션, SSL 역방향 프록시, 사용자 정의 로드밸런싱 규칙 등 다양한 기능을 제공합니다.

<hr/>

[Reverse Proxy with URL Rewrite v2 and Application Request Routing](https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing)
[Setup IIS with URL Rewrite as a reverse proxy for real world apps](https://techcommunity.microsoft.com/t5/iis-support-blog/setup-iis-with-url-rewrite-as-a-reverse-proxy-for-real-world/ba-p/846222)


  

---
title: Github Action Configure 설정하기
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [DevOps]
tags: [Github Action]
pin: false
math: true
mermaid: true
---

### .jar 파일이 구동 안되는 이슈
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

#### 해결방안
```aws configure```에 리전을 설정해야 해서 설정했습니다. 이 부분은 Github action .yml 조건과의 일치여부 때문에 발생하는 문제입니다.
```
You must specify a region. You can also configure your region by running "aws configure".
ubuntu@ip-172-31-34-122:~$ aws configure
AWS Access Key ID [------------XGTY]: 
AWS Secret Access Key [------------LL3f]: 
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

### The specified key does not exist.
이번에는 다른 배포 실패 이벤트 로그가 발생했습니다.
> The overall deployment failed because too many individual instances failed deployment, too few healthy instances are available for deployment, or some instances in your deployment group are experiencing problems.  
> The specified key does not exist.

#### 해결방안
이벤트 로그 상세를 보니 S3 .zip 파일의 키값이 달라 인식하지 못하는 문제인 것 같아 전역변수로 ```GITHUB_SHA```를 등록해주었습니다. ```CodeDeploy```에서 DownloadBundle 상태가 진행이 되는 것을 볼 수 있었습니다.
```
env:
  GITHUB_SHA: ${{ github.sha }}
```


  

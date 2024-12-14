---
title: IIS 웹서버에서 Spring Boot 배포
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [DevOps]
tags: [Github Action, 이슈]
pin: false
math: true
mermaid: true
---

자바 애플리케이션은 IIS에서 바로 배포하는 것이 아닌 Reverse Proxy를 이용한 배포를 권장하고 있습니다. Reverse Proxy가 가지는 장점을 적용할 수 있으며 자바 뿐만 아니라 PHP, Python, Ruby 등 동적 애플리케이션을 배포하는 경우에서도 동일합니다. 스프링 부트 프로젝트는 내장 톰캣을 WAS로 제공하고 있기 때문에 웹 서버 연동으로 포트를 변경해서 연동해 줄 수 있습니다. 여기서 IIS 관리자의 URL 재작성 페이지에서 규칙 추가를 해서 ARR 활성 상태에서 Reverse Proxy 설정을 할 수 있습니다. 필요 모듈이 없을 경우에는 아래 URL에서 필요한 모듈을 설치할 수 있습니다.
+ [URL Rewrite](https://iis-umbraco.azurewebsites.net/downloads/microsoft/url-rewrite)
+ [Microsoft Application Request Routing 3.0 (x64)](https://www.microsoft.com/en-us/download/details.aspx?id=47333)

![iis_reverse_proxy.png](/assets/post_images/server/iis_reverse_proxy.png)

그럼 IIS에서 **각 모듈이 어떻게 작동하는지** 알아보겠습니다.  
<span style="background-color:#fff5b1">Reverse Proxy</span>는 공용 네트워크에서 들어오는 client의 요청과 사설 네트워크에서 들어오는 백엔드 웹서버 통신이 가능하도록 하는 중간 역할을 하는 도구입니다. 그리고 IIS 서버에서 <span style="background-color:#fff5b1">ARR(Application Request Routing)</span>은 프록시 기반 라우팅 모듈로 로드밸런싱 기능과 백엔드 시스템과의 통합으로 애플리케이션 성능 개선을 지원합니다. ARR 활성상태에서 URL 재작성 및 리디렉션, SSL 역방향 프록시, 사용자 정의 로드밸런싱 규칙 등 다양한 기능을 제공합니다.

<hr/>

[Reverse Proxy with URL Rewrite v2 and Application Request Routing](https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing)
[Setup IIS with URL Rewrite as a reverse proxy for real world apps](https://techcommunity.microsoft.com/t5/iis-support-blog/setup-iis-with-url-rewrite-as-a-reverse-proxy-for-real-world/ba-p/846222)


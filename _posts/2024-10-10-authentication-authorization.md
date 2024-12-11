---
title: 인증과 인가 
description: 인증과 인가, OAuth에 대해 알아보자.
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [CS, Basic]
tags: [인증, 인가, OAuth]
pin: false
math: true
mermaid: true
---

### 인증과 인가
<span style="background-color:#fff5b1">Authentication 인증</span>은 접근 자격이 있는지 ```신원을 검증```하는 단계이고,  
<span style="background-color:#fff5b1">Authorization 인가</span>는 특정 자원에 접근할 ```권한을 부여```하는 것을 말합니다. 인가가 완료되면 access token이 클라이언트에 부여됩니다.  
<span style="background-color:#DCFFE4">OAuth와 로그인은 분리해서 생각해야 한다구?</span>  
OAuth를 이용한 인증은 허가의 의미도 포함하고 있으며, 제3자가 사용자의 권한으로 접근하는 것을 허용해주는 방식입니다. 따라서 그 서비스에 직접 로그인한 사용자와 달리 '방문증'을 가지고 있는 것이라고 생각하면 이해하기 쉽습니다. 그래서 우리는 흔히 일반적으로 회원가입 후 OAuth 인증을하는 방식으로 계정을 연동하는 것을 볼 수 있습니다.  
<span style="background-color:#DCFFE4">OpenID도 있는데 어떻게 다른걸까?</span>  
OpenID의 주요 목적은 인증(Authentication)이지만, OAuth의 주요 목적은 허가(Authorization)입니다. OAuth도 인증과정이 있지만 근본 목적은 API를 호출할 수 있는 권한이 있는 사용자인지를 확인하는 것입니다.

### OAuth
> Open Authorization

<span style="background-color:#fff5b1">타사 애플리케이션 계정 정보를 공유해 비밀번호 없이 토큰으로 접근권한을 위임하는 개방형 표준</span> 입니다. 만약 사용자가 구글 계정으로 로그인을 하게 되면 로그인 정보를 가지고 계정과 연결된 구글의 API를 가지고 Google Calendar와 같은 정보를 가지고 와서 사용할 수 있습니다. 이렇게 사용자를 인증을 하는 과정을 ```OAuth Dance```라고 합니다.

#### OAuth와 OAuth 2.0  
OAuth 1.0이 나온 때는 2007년이며, 이후 보안 문제를 해결한 수정 버전인 OAuth 1.0 revision A가 2008년에 나왔습니다.  
이후 나온 OAuth 2.0은 기능적으로도 규모적으로 확장된 형태로 다양한 인증방식을 제공합니다. OAuth 2.0은 OAuth과 호환되지 않지만 인증절차가 간단합니다. access token도 기존에는 계속 사용이 가능했으나, 2.0이 되면서 보안 강화를 위해 ```Life-time```을 설정해두고 있습니다.  
그리고 별도의 암호화가 필요없고 HTTPS를 사용하기 때문에 데이터는 SSL/TLS 프로토콜을 사용해 암호화됩니다.  
기존 OAuth에서는 Signature 단순화 정렬과 URL 인코딩하는 과정이 있었지만, 2.0에서는 필요없어졌습니다. 대신 클라이언트 인증방식으로 Authorization Code Grant, Implicit Grant, Client Credentials Grant, Resource Owner Password Credentials Grant 등을 제공하고 있기 때문입니다.  
따라서 기존 1.0에서 사용된 HMAC(SHA-1)도 사용하지 않습니다. 이는 클라이언트 인증과 서명 메시지 생성에 사용됐었던 알고리즘입니다.

<span style="background-color:#fff5b1">OAuth의 작동방식</span>
> User - Consumer - Service Provider

1. Consumer는 ```Request Token``` 요청하고 Service Provider가 발급
2. 사용자 인증페이지에서 사용자 로그인
3. 사용자 권한 요청 및 수락
4. ```Access Token```이 발급 및 API 서비스 정보 요청

<span style="background-color:#fff5b1">OAuth 2.0의 작동방식</span>
> User(Resource Owner) - Client Server - Resource Server

1. User가 소셜 로그인을 하면 연동 서비스 로그인 페이지에서 로그인을 하고 접근권한 제공여부를 확인
2. 동의를 한 경우, Resource Server에서 Client ID, Secret과 Redirect URL이 일치하는지 검사
3. Resource Server는 ```Authorization Code``` 제공
4. Client는 다시 3번의 토큰과 정보를 넘기고 ```Access Token``` 발급요청
5. Resource Server는 ```Access Token``` 발급
6. API 호출시 유효한 ```Access Token```인 경우 Resource 제공

****
+ [OAuth와 춤을](https://d2.naver.com/helloworld/24942)

---
title: 11부. 한 번에 알아보는 AWS - API Gateway
author: ilpyo
date: 2025-01-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## API Gateway
API Gateway를 통해 사용자들이 접근할 수 있도록 할 수 있습니다. API에 특화된 기능을 제공하며, 인증 및 권한을 부여하거나 API 버전을 관리하고 서버리스(ex. Lambda)를 지원합니다. 배포하는 방식은 여러가지가 있는데 Endpoint를 하나의 리전에 두고 Edge-Optimized를 사용해 전 세계에서 접근이 가능하게 하거나 하나의 지역에서 CloudFront를 이용하는 방식 또는 VPC에서 ENI를 이용해서 접근하게 하는 방식들이 있습니다. 보안으로는 IAM, Cognito, Custom authorizer를 사용하는 방식들이 있습니다.
- Open API spec 사용이 가능합니다. (aka. Swagger) validation check에 사용이 가능합니다.
- 헤더에 `x-api-key`를 사용해서 사용량을 제한하거나 모니터링할 수 있습니다. 특정 usage plan에 연결된 API를 사용하도록 연결되기 때문입니다.
- CloudWatchLog(`CacheHitCount`, `CacheMissCount`), X-Ray를 이용한 로깅 및 추적이 가능합니다.

### APIs
> Rest API, HTTP API, WebSocket API

#### Rest API vs HTTP API
Rest API는 OAuth 2.0이나 OpenID를 이용한 연결이 불가능합니다. HTTP API는 지연시간이 적고, 비용이 저렴합니다. 하지만 usage plan에 따른 API key는 제공하지 않습니다.

#### WebSocket API
양방향 소통이 가능하며 실시간 작동이 필요한 채팅과 같은 애플리케이션 개발에 필요합니다. 메시지를 반대로 클라이언트에 보낼 때 `ConnectionID`를 사용하게 되는데 이 연결 아이디를 이용합니다. 

```
wss://abcdefg123.execute-api.us-east-1.amazonaws.com/dev
wss://abcdefg123.execute-api.us-east-1.amazonaws.com/dev/@connections/{connectionId}
```

### Stage
- Stage Variables에 따라 특정 람다를 호출해서 관리할 수 있습니다.
- Canary Deployment
  - 소량의 트래픽 테스트를 위해서 사용됩니다. 
  - Canary Setting에서 Canary와 Current stage의 트래픽 비율을 정해서 메트릭과 로그를 분리할 수 있습니다.
  - Promote canary를 하면 업데이트로 새로운 버전으로 현재 Stage로 promote할 수 있습니다.

### Mapping Template
매핑될 입력데이터나 출력데이터를 변환하는데 사용합니다. 백엔드로 요청을 보내거나 백엔드에서 받은 응답을 변환하는데 사용됩니다. VTL(Velocity Template Language)를 이용해서 작성됩니다. SOAP API는 XML, REST API는 JSON을 기반으로 합니다.
```
{
    "id": "$input.json('$.userId')",
    "name": "$input.json('$.userName')"
}
```

### Caching
백엔드 호출을 줄일 수 있는 방식으로 TTL은 300초를 기본값으로 갖습니다. Stage별로 캐시 설정이 가능하며 용량은 0.5GB에서 237GB 사이의 값을 갖습니다. 
- 헤더에 `Cache-Control: max-age=0`으로 설정해서 클라이언트에서 캐시를 무효화할 수 있습니다.

### Errors
#### 4xx: 클라이언트 오류 (Client Errors)
- `400` Bad Request: 잘못된 요청 형식.
- `401` Unauthorized: 인증 실패 (API Key 없음 등).
- `403` Forbidden: 권한 부족.
- `404` Not Found: 요청한 리소스 없음.
- `405` Method Not Allowed: 허용되지 않은 HTTP 메서드 사용.
- `406` Not Acceptable: 요청한 형식을 지원하지 않음.
- `408` Request Timeout: 요청 시간이 초과됨.
- `429` Too Many Requests: 호출 횟수 초과 (Rate Limiting).
#### 5xx: 서버 오류 (Server Errors)
- `500` Internal Server Error: 서버 내부 오류.
- `502` Bad Gateway: 백엔드 서비스에서 잘못된 응답.
- `503` Service Unavailable: 서비스가 일시적으로 사용 불가.
- `504` Gateway Timeout: 백엔드 서비스 타임아웃.

### Routing
클라이언트가 보내는 메시지를 서버에서 처리할 때 특정 엔드포인트나 Lambda 함수로 메시지를 전달하는 과정입니다. 다음과 같이 JSON 메시지에서 라우팅할 표현식을 사용할 수 있는데 WebSocket 기반 API의 경우 표현식은 `$request.body.{path_to_body_element}` 형식이어야 합니다. 아래 표현식에서 `$request.body.action`이라고 하면 `join`이라는 변수가 매핑됩니다.
```
{
    "service" : "chat",
    "action" : "join",
    "data" : {
        "room" : "room1234"
   }
}
```
- [API Gateway에서 WebSocket API에 대한 라우팅 생성](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/websocket-api-develop-routes.html)

<span style="background-color:#fff5b1">매핑 템플릿과 달리 메시지가 어떤 경로로 갈지를 지정하는 것으로 매핑 템플릿처럼 그 요청과 응답을 변경하는 것과는 차이가 있습니다.</span>

---

## CodeCommit

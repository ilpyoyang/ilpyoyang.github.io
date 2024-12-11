---
title: API 버저닝 방법 정하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [CS, Architecture]
tags: []
pin: false
math: true
mermaid: true
---

프로젝트를 하면서 백엔드 API 개발시 필요한 버저닝에 대한 고민을 하게 되었습니다. 사실 버저닝은 개인 프로젝트라서 편한대로 하면 된다고 생각했지만 좀 더 일반적인 방법을 적용하고 싶다는 생각이 들어서 어떤 방법들을 사용하는지 찾아봤습니다.

#### HTTP Rest API 성숙도 모델
Leonard Richardson의 [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)에서 보면 HTTP Rest API 성숙도 모델을 레벨 4개로 나누어 사용했습니다.
- Level 0 : HTTP 사용
   - RPC(Remote Precedure Call) 형태로 리소스 구분 없이 설계된 HTTP API입니다.
   - 하나의 endpoint에서 여러 매개변수에 따라 다른 동작을 하게 합니다.
- Level 1 : 개별 리소스 개념 도입
   - 리소스별로 고유한 URI를 사용해서 식별하고 HTTP method는 GET과 POST만 사용합니다.
   - HTTP headers에 Content-Type이나 Cache 관련 정보를 제공하지 않습니다.
- Level 2 : HTTP 메소드 원칙 준수
   - GET, POST, PUT, DELETE HTTP method를 사용해 CRUD를 나타내고 메시지에 Status Code도 반환합니다.
   - URI에는 행위(Action)가 포함되지 않고 HTTP Method로 표현한다. GET은 매번 같은 결과를 반환하고, 헤더에 Content-Type을 제공하며 멱등성을 보장하는 GET의 경우 캐시가 적용됩니다.
- Level 3 : HATEOAS 원칙 준수
   - Hypermedia(링크)를 통해서 다음 가능한 행동(action)에 대한 정보를 응답 본문에 넣어주어야 합니다.

사내에서 업무를 하면서 백엔드 서버와 프론트 서버가 확실하게 분리되어 있어서 HATEOAS 원칙에 따라 응답에 유형에 따라 다음 행동을 위한 링크를 리턴할 일은 많지 않았습니다. 기본적으로 `Level 2`에 해당하는 방식으로 적용하되 다음 액션이 필요한 경우는 링크를 제공하기로 했습니다.

#### API 컨벤션의 종류
API의 형식은 `api.example.com/v1/orders` 형태의 버저닝을 따르기로 했습니다. 백엔드 서버만 개발하고 추후 프론트 개발을 할지에 대해 고민 중이였기 때문입니다. 이전에는 도메인에 `/api/v1/orders`와 같은 방식을 사용했지만 도메인 분리를 한다면 처음 언급한 방식을 사용하는 것이 적합하다고 생각했습니다.  
버저닝을 API에 표기하는 방식에 대해서 별로 찬성하는 편은 아니지만 이번에는 간단한 개인 프로젝트이므로 버저닝을 API에 담기로 했습니다. 실운영할 상용 프로젝트에서는 body에 적용하거나 서버에서 처리하는 방법을 사용할 것 같습니다. 개인적으로 파라미터에 담는 방식은 불필요하고 다른 매개변수 적용도 해야하는 호출부에선 적절하지 않을 것 같다는 생각이 들었습니다.  
`{orderId}`는 아이디를 API에 담는 방식이지만 이번 프로젝트에서는 사용하지 않을 예정입니다. API가 깔끔하지 않습니다. 그리고 주요 정보를 유추해 낼 수 있고 보안관리에 좋지 않습니다. 그리고 2개 이상의 변수를 Path에 담지 않는 것으로 합니다.

#### 결론
이번 개인 프로젝트에서는 다음의 API 컨벤션을 따르기로 했습니다.
- HTTP Rest API 성숙도 모델 `Level 2`에 해당하는 방식으로 적용하되 다음 액션이 필요한 링크는 제공
- 백엔드 API 서버를 위한 `api.example.com/v1/orders` 방식 적용
- Path에 `ID` 정보는 되도록 담지 않기

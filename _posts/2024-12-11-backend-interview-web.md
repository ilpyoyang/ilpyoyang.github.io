---
title: 백엔드 개발자 면접대비 질문정리 - Web
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

## Web
### 인터넷의 동작원리
+ 인터넷은 <span style="background-color:#fff5b1">네트워크 인프라</span>, 웹은 인터넷 위에서 동작하는 <span style="background-color:#fff5b1">서비스</span>
  + 인터넷 위에서 동작하는 서비스는 그 외에도 이메일, 파일공유 서비스, 스트리밍 서비스, 클라우딩 컴퓨팅 서비스, 온라인 게임 서비스 등이 있습니다.
  + 웹 말고도 이메일을 소프트웨어로도 보낼 수 있으니까 SMTP, POP3 등..
+ <span style="background-color:#fff5b1">컴퓨터 - 라우터 - ISP - ISP - 라우터 - 컴퓨터</span>
+ 인터넷 서비스 제공업체(Internet Service Provider, ISP)는 연결되는 라우터를 관리하고 다른 ISP 라우터에 엑세스할 수 있도록 합니다.
+ 컴퓨터에서 IP주소 or 도메인 이름을 통해 메시지를 맏을 특정 컴퓨터를 지정

### 웹의 동작원리
+ 클라이언트는 웹 사용자의 인터넷이 연결된 장치, 서버는 웹사이트, 앱 등을 저장하는 컴퓨터
+ <span style="background-color:#fff5b1">브라우저 주소 입력 - DNS 서버 - IP주소 서버에 HTTP 요청 (TCP/IP 연결로 전송) - 응답과 웹사이트 파일인 데이터 패킷을 브라우저로 전송 - 브라우저에서 웹 사이트로 조립해서 보여줌</span>

### HTTP(HyperText Transfer Protocol)
+ <span style="background-color:#fff5b1">웹 데이터를 전송하기 위해 사용되는 프로토콜</span>
+ HTTPS(secure version of HTTP)는 <span style="background-color:#fff5b1">SSL/TLS 프로토콜</span>을 사용하여 데이터 전송을 암호화하고 보안을 제공합니다.
  + SSL(secure sockets layer)와 TLS(transport layer security)는 네트워크에서 데이터를 안전하게 전송하기 위해 설계된 암호화 프로토콜입니다. SSL은 원래 넷스케이프에서 개발되었으며, TLS는 그 이후에 IETF(Internet Engineering Task Force)에 의해 SSL의 표준화된 버전으로 개발되었습니다.

### Restful API란
+ <span style="background-color:#fff5b1">HTTP 기반의 웹 서비스의 아키텍처 스타일, 리소스를 표현하고 상태 전달을 위한 웹 API 디자인 원칙</span>
+ 클라이언트-서버 통신의 일관성
+ GET, POST, PUT, DELETE
  + <span style="background-color:#fff5b1">클라이언트가 서버에 정보를 요청하거나 전송하는 방법으로 HTTP 메서드 종류</span>
  + <span style="background-color:#fff5b1">GET</span>은 주로 서버에서 정보를 검색하는데 사용되고 서버의 상태를 변경하지 않습니다.
  + <span style="background-color:#fff5b1">POST</span>는 서버에 데이터를 제출하거나 저장하는데 사용하고, 서버의 상태를 변경할 수 있습니다.

```protobuf
// User 생성 (POST 요청)
POST /users
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com"
}

// 응답
{
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
}

// User 조회 (GET 요청)
GET /users/1

// 응답
{
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
}
```

### gRPC(google remote procedure cell)
+ google 사에서 개발한 오픈소스 RPC 프레임워크
+ HTTP/2를 사용하고, <span style="background-color:#fff5b1">프로토콜 버퍼</span>로 데이터를 전달한다는 점에 차이
  + 프로토콜 버퍼는 이진 데이터 포맷을 사용하여 데이터를 직렬화합니다. 이는 <span style="background-color:#fff5b1">더 작은 메시지 크기와 더 높은 직렬화 및 역직렬화 속도를 제공</span>합니다.
  + HTTP/1.1은 가장 널리 사용되는 버전이며, HTTP/2는 성능 향상을 제공하고, HTTP/3은 새로운 전송 프로토콜 QUIC를 사용하여 더 나은 성능과 보안을 제공합니다.
+ <span style="background-color:#fff5b1">Restful API는 리소스 중심, gRPC는 서비스 중심의 API 디자인을 채택</span>
  + 리소스는 데이터의 개체 또는 서비스에서 조작할 수 있는 항목을 의미합니다. 예를 들어, 사용자, 상품, 주문 등이 리소스가 될 수 있습니다.
  + <span style="background-color:#fff5b1">서비스의 메서드 호출을 중심</span>으로 하며, 각 메서드는 특정 작업을 수행하고 결과를 반환합니다.

```protobuf
syntax = "proto3";

service UserService {
    rpc CreateUser(CreateUserRequest) returns (User);
    rpc GetUser(GetUserRequest) returns (User);
}

message CreateUserRequest {
    string name = 1;
    string email = 2;
}

message GetUserRequest {
    int32 id = 1;
}

message User {
    int32 id = 1;
    string name = 2;
    string email = 3;
}
```

### Web Server와 WAS의 차이
+ 웹 서버(아파치, niginx, iis)는 정적 웹 페이지, 이미지, css 등 콘텐츠 처리
+ WAS 웹 애플리케이션 서버는 동적 콘텐츠 처리 생성 및 처리, 데이터베이스 액세스, 비지니스 로직 실행 등 담당

### XML과 JSON의 차이 및 장단점
+ <span style="background-color:#fff5b1">둘 다 데이터를 구조화하고 전송하기 위한 포멧</span>
+ ```XML(eXtensible Markup Language)```은 태그 기반의 구조를 가지고 <span style="background-color:#fff5b1">사용자 정의 태그</span>로 데이터를 표현, 파싱이 복잡하고 느립니다. 하지만 사용자 정의 태그를 사용해서 확장성이 좋고 많은 시스템과 언어에서 지원됩니다.
+ ```JSON(JavaScript Object Notation)```은 데이터를 교환하거나 저장하기 위한 가벼운 데이터 포맷으로 파싱이 빠르고 효율적입니다.

### XML에서 node, element, attribute의 차이 및 용도
+ 전체 문서는 하나의 node이고 element는 노드 중 하나로 각 태그를 나타냅니다.
+ attribute는 태그에 속성 노드로 엘리먼트 내에 추가정보를 제공하고 시작 태그 내 이름과 값 쌍으로 표시

```xml
<!-- This entire document is a Node -->
<bookstore>  <!-- 'bookstore' is an Element Node -->
  <book category="fiction">  <!-- 'book' is an Element Node, 'category' is an Attribute Node -->
    <title lang="en">The Great Gatsby</title>  <!-- 'title' is an Element Node, 'lang' is an Attribute Node -->
    <author>F. Scott Fitzgerald</author>  <!-- 'author' is an Element Node -->
    <year>1925</year>  <!-- 'year' is an Element Node -->
    <price>10.99</price>  <!-- 'price' is an Element Node -->
  </book>
</bookstore>
```

### JSON에서 {}와 []의 용도
+ <span style="background-color:#fff5b1">중괄호는 JSON 객체를 대괄호는 JSON 배열을 의미합니다.</span>
+ 중괄호는 키-값 쌍의 컬렉션으로 구성


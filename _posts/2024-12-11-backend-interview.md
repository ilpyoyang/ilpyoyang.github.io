---
title: 백엔드 개발자 면접대비 질문정리
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

## CS
### 스레드와 트랜잭션
+ 스레드는 프로세스에서 실행되는 독립적인 실행 단위
  + 하나의 프로세스에는 여러 개의 스레드
  + 동시성 지원을 위한 독립적으로 실행 가능한 단위
  + 병렬처리는 복수의 CPU 코어 또는 프로세서를 활용해서 여러 작업을 동시에 처리하는 것을 말합니다.
+ 트랜잭션은 데이터베이스 관련 작업을 ACID 에 맞게 원자적, 일관적, 격리적, 지속적으로 처리하기 위한 개념
  + 여러 데이터베이스 작업을 하나의 논리적인 작업 단위로 처리

### 멀티프로세스와 멀티스레드
+ 프로그램는 코드의 집합, 그 프로그램이 ```RAM```에서 동작하는 상태가 프로세스
+ <span style="background-color:#fff5b1">하드에 저장된 리소스 및 코드로 구성된 프로그램을 실행하면, 메모리에서 프로세스로 동작하게 됩니다. 스레드는 한 프로세스 내에서 실행되는 동작의 흐름을 의미합니다.</span>
+ 컴퓨터의 멀티작업을 위해 프로세스만을 이용한 경우 컴퓨터 리소스를 너무 많이 차지하게 되는데, 스레드는 한 프로세스에서 heap 자원을 공유하면서 stack을 할당받는 형태이기 때문에 메모리 사용량이 상대적으로 작습니다.
+ 멀티 프로세스는 프로세스 여러 개로 동작하는 것, 메모리를 더 많이 소요하고 동작 시간이 많이 든다. 하지만 프로세스가 여러 개로 동작하기 때문에 보완이 가능하다.
+ 멀티 스레드는 한 프로세스 안에 여러 스레드가 동작하는 것
+ 어떤 프로그램이 멀티 프로세스인지 멀티 스레드로 도는 건지에 대해
  + 멀티스레드 언어: Java, C#
  + 멀티스레드 & 멀티프로세스 언어: Python, C, C++

### 로컬변수, 멤버변수, 전역변수
+ 세 가지 변수는 변수의 범위와 생명 주기를 통해 구별되면, 코드의 구조와 동작에 중요한 영향을 미칩니다.
+ 로컬변수는 <span style="background-color:#fff5b1">함수 내부</span>에서 선언하고 함수 실행도중에만 접근이 가능합니다.
+ 멤버변수는 <span style="background-color:#fff5b1">클래스 내부</span>에서 선언되며, 해당 클래스 객체가 존재하는 동안 접근이 가능합니다. 일반적인 객체의 속성을 의미합니다.
+ 전역변수는 <span style="background-color:#fff5b1">프로그램 전체 영역</span>에서 접근할 수 있는 변수입니다.

### 객체지향 프로그래밍
+ <span style="background-color:#fff5b1">데이터를 추상화하고 상태와 행위를 가진 객체로 만들어 객체 간 상호작용으로 프로그래밍하는 방법</span>
+ 객체는 데이터 또는 식별자에 의해 참조되는 공간
+ 객체지향 프로그램의 3대 요소: 캡슐화, 다형성, 상속
  + ~~4가지 특징과 달리 3요소에는 추상화가 빠지는데 왜 이런겨...~~
+ <span style="background-color:#fff5b1">추상화, 캡슐화, 상속, 다형성</span>
  + 추상화: 객체에서 공통된 속성과 행위를 추출
  + 캡슐화: 데이터 구조화 데이터를 다루는 방법을 결합시켜 묶는 것, class
  + 다형성: 하나의 변수명, 함수명이 상황에 따른 다른 의미로 해석될 수 있는 것
  
### class, instance의 차이
+ 클래스는 객체의 구조와 행동을 정의하고, 변수와 메서드로 구성되어 있습니다.
+ 인스턴스는 클래스를 기반으로 생성된 실제 객체! <span style="background-color:#fff5b1">클래스의 실체화된 형태</span>

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(f"{self.name} is barking!")

# 객체(인스턴스) 생성
my_dog = Dog(name="Buddy")
```

### 객체지향 디자인 패턴
> 생성패턴: Singleton, Factory Method, Abstract Factory, Builder, Prototype  
> 구조패턴: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy  
> 행위패턴: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor

+ Singleton 패턴
  + <span style="background-color:#fff5b1">특정 클래스의 인스턴스가 프로그램 전체에 하나만 생성되도록 보장하는 패턴</span>
  + 전역변수의 문제를 해결하고 리소스의 접근 제어나 중복 생성을 방지하는데 유용합니다.

```java
public static Singleton getInstance() {
    if (uniqueInstance == null) {
        uniqueInstance = new Singleton();
    }
    return uniqueInstance;
}
```

### Stateful와 Stateless의 차이점
+ <span style="background-color:#fff5b1">Stateless 시스템은 이전의 상호작용에 대한 정보를 저장하지 않습니다. 예, HTTP 프로토콜</span>
+ Stateful은 상태유지로 이전의 상호작용 정보를 저장하고 유지하는 웹 애플리케이션의 로그인 세션을 예로 들 수 있습니다.



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



## Algorithm & Data Structure
### Stack, Queue, List, Tree, Hash Table
+ ```Stack```이란 LIFO 선형데이터 구조, push 추가, pop 제거, 후위표기법 계산에 사용
+ ```Queue```란 FIFO 선형데이터 구조로 enqueue 추가, dequeue 제거, 스케줄링, 이벤트 처리에 사용
+ ```List```는 순서를 유지하는 동시에 항목의 빠른 추가와 제거를 가능하게 하는 선형 데이터 구조
  + 배열 또는 연결 리스트로 구현
+ ```Tree```는 계층적 구조를 가진 비선형 데이터 구조, 노드와 엣지로 구성
  + 이진 검색 트리, AVL 트리, B-트리 등
+ ```Hash Table```은 키를 값에 매핑하는 효율적인 데이터 구조로, 빠른 검색, 삽입, 삭제를 지원
  + <span style="background-color:#fff5b1">해시함수를 사용하여 키를 해시 값으로 변환하고 이 해시 값이 저장되는 배열의 인덱스로 사용</span>

### 정렬 알고리즘
+ <span style="background-color:#fff5b1">주어진 데이터를 특정 순서로 재배열하는 알고리즘</span>
+ 버블정렬, 선택정렬, 삽입정렬, 병합정렬, 퀵정렬
  + ```버블정렬```은 인접 항목을 비교해 교환 정렬하는 것
  + ```선택정렬```은 배열의 각 위치에 대해 나머지 배열에서 최솟값을 찾아 해당 위치에 놓는 알고리즘
  + ```삽입정렬```은 각 요소를 이미 정렬된 부분 배열의 올바른 위치에 삽입하여 정렬합니다.
  + ```병합정렬```은 배열을 두 개의 균등한 크기의 부분 배열로 분할하고, 각 부분 배열을 재귀적으로 정렬한 다음 병합합니다. 
  + ```퀵정렬```은 피벗을 선택하고 피벗보다 작은 요소들을 왼쪽에, 큰 요소들을 오른쪽에 위치시킨 후, 각 부분 배열에 대해 재귀적으로 정렬합니다.



## Database
### 각 데이터 베이스별 종류
+ MSSQL
  + Window 생태계에서 좋은데 특정 운영 체제 종속될 수 있다는 단점
+ MariaDB
  + MySQL 오픈소스 포크로 일부 스토리지엔진 Aria, TokuDB와 같은 스토리지 엔진 추가
  + 빠른 쿼리 지원
  + 보안 강화
  + NoSQL 지원
+ MySQL
  + InnoDB 로우레벨 락으로 트랜잭션 동시성 향상과 데드락 이슈를 줄여줌
  + 데이터 압축을 지원하여 디스크 공간을 줄이고 I/O 성능향상
+ Redis
  + Remote Dictionary Server
  + SSD, HDD가 아닌 RAM을 사용하기 때문에 속도가 빠르다.

### 데이터베이스의 정규화
+ <span style="background-color:#fff5b1">관계형 데이터베이스에서 설계 중복을 막기 위한 프로세스</span>
+ 데이터 무결성과 효율성, 복잡성을 줄이는데 사용
+ 1정규형: 데이터 원자값
+ 2정규형: 부분 함수 종속성이 제거
+ 3정규형: 이행 함수 종속성이 제거
+ 보이스-코드 정규형(BNCF): 모든 비 기본키 속성이 기본 키에 대해 이행적 종속
+ 4정규형: 다치 종속성 제거
+ 5정규형: 조인 종속성 제거

### Outer join이란?
+ <span style="background-color:#fff5b1">두 테이블 결합에서 일치하는 값이 없는 경우(null)에도 레코드를 반환</span>
+ left outer join, right outer join, full outer join

### View란?
+ DBMS에서 하나 이상의 테이블에서 파생된 가상 테이블을 의미
+ 기본 테이블의 데이터를 참조하지만 실제로 데이터를 저장하지 않습니다.

```sql
CREATE VIEW EmployeeView AS
SELECT EmployeeName, EmployeeDepartment
FROM EmployeeTable;
```

### Index란?
+ 데이터베이스 검색 속도를 높이기 위한 책의 색인과 같은 존재
+ 잘못 설정시 오히려 성능 저하가 발생하기 때문에 설정이 중요
  + 빈번한 조회가 발생하는 열
  + 고유값이 많은 열
  + 인덱스 크기 최소화
  + 복합 인덱스
    + page lock 걸림, 성능 저하될 수도 있음

### Stored procedure란?
+ 저장 프로시저
+ <span style="background-color:#fff5b1">데이터베이스에서 실행할 수 있는 저장된 코드 블록</span>
+ <span style="background-color:#fff5b1">캐시 저장</span> 후 실행하므로 성능을 높일 수 있고, 특정 권한을 부여해서 보안관리에도 좋습니다.

### Transaction이란?
+ <span style="background-color:#fff5b1">데이터베이스에서 일련의 연산들을 하나의 논리적 작업 단위로 묶은 것</span>
+ ```ACID``` 속성 만족
  + 원자성, 일관성, 고립성, 영구성
  + ```read uncommitted```에서는 고립성 성립 안 됨.
    + ```dirty read```, ```non-repeatable read```, ```phantom read``` 발생 가능성



## Spring
### Spring을 사용하는 이유
+ 의존성이 편리하고 라이브러리 기타 참고 자료가 많으며, 자바의 대표적인 프레임워크로 사용되기 때문에
+ DI, Bean, IoC
  + Bean은 Spring 컨테이너가 관리하는 객체
  + DI는 Bean을 이용해서 의존성 주입에 사용하는데 이로 인해 의존성을 줄일 수 있습니다.
  + 직접 객체를 생성하는 것이 아니라 의존성이 줄어듭니다.
  + IoC는 제어의 역전으로 객체 생성 및 관리를 개발자가 아닌 프레임워크 또는 컨테이너에 위임하는 개념

### 라이브러리와 프레임워크의 차이
+ ~~라이브러리는 내 자율적인 권한이 더 많으며 필요한 부분을 가져다 사용하기에 용이하다. 건설용 책자~~
+ ~~프레임워크는 주어진 권한에 맞춰 제한적이지만 사용하기에 편리한 툴을 제공한다. 집을 짓는 뼈대~~
+ 라이브러리는 특정 작업을 하기 위한 기능을 제공하며, 프레임워크는 애플리케이션의 구조나 템플릿을 제공, 특정 규칙이나 인터페이스를 준수하여 구축

### AOP, DI, Interceptor, Filter
+ AOP는 관심사의 분리를 통해 특정 코드를 여러 위치에서 재사용할 수 있도록 합니다.
  + @Aspect
  + 애플리케이션 전반에 필요한 관심사로 로깅, 트랜잭션 관리, 보안, 예외처리
  + 런타임에서 프록시를 사용해서 적용
  + Aspect 관점
  + Join Point 조인 포인트
  + Advice 어드바이스 - 조인포인트에서 실행될 실제 코드
  + Pointcut 어드바이스가 실행될 조인 포인트를 지정하는 표현식 또는 패턴
    + 여러 조인 포인트 중에서 실제로 어드바이스가 적용될 지점들을 필터링하는 역할
+ Interceptor는 스프링 MVC의 웹 요청 처리 중 특정 단계 작업을 수행하기 위해 설계
  + HandlerInterceptor
  + 즉 웹 요청에만 국한된다는게 AOP 와의 차이
  + 특정 레이어에 국한된 작업
  + 로그인 검사, 로깅, 권한 검사
+ DI 의존성 주입
  + 객체간 의존성을 외부에서 주입
  + 객체 생성과 의존성 관리를 스프링 컨테이너에 위임
  + @Autowired, @Inject
+ Filter 서블릿 컨테이너 수준에서 요청과 응답을 가로채서 처리
  + 자바 서블릿에서 제공하는 기능으로 DispatcherServlet에 의해 컨트롤러에 매핑되는데 Filter는 그 전 후 동작
  + FilterChain에 의해 연쇄적으로 동작
  + 토큰 인증 등 확인을 위해 사용
  + init(), doFilter(), destory()
+ Filter - Intercepter - AOP - Intercepter - Filter 순으로 처리

### 스프링에서의 reqeust 처리순서
+ DispatcherServlet 요청을 가로채서
+ @Controller에서 @RequestMapping에 따른 request를 찾아서 메서드에 도달
+ Controller - Service - DB - Entity - Service - Controller - DispatcherServlet - ViewResolver - DispatcherServlet
+ DispatcherServlet은 응답할 view에게 render를 지시하고 view 응답 로직을 처리

### PSA portable service abstraction 추상화 서비스
+ aop, ioc와 함께 spring triagle 중 하나
+ spring cache
+ 하나의 추상화로 여러 기능을 묶어둔
  + @Transactional >> PlatformTransactionManager

### Spring vs Spring boot
+ 둘 다 자바 기반 애플리케이션 개발을 위한 프레임워크이지만, Boot에서는 기본값을 제공하고 개발자가 의존성 구성을 관리할 필요가 없습니다.
  + Spring Boot는 내장 Tomcat, Jetty와 같은 서버를 제공하고, 애플리케이션을 더 쉽게 실행 배포할 수 있습니다.
  + Spring Boot Starter로 의존성을 그룹화하고 Spring Boot Dependency Management를 통해 의존성 버전을 관리합니다.
  + 둘 다 DispatcherServlet을 포함하고 있습니다.



## Java
### 자바의 스레딩
+ synchronized, java.util.concurrent 동시성 제어를 위한 유틸리티와 클래스 제공
+ Thread 클래스, Runnable 인터페이스로 메서드 구현

### Hibernate
+ ORM, JPA 지원
  + JPA는 자바 ORM 표준 명세이고, Hibernate는 JPA 명세의 구현체 중 하나
  + QueryDSL은 타입 세이프 쿼리 작성을 가능하게 합니다.

```java
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">

<hibernate-configuration>

    <session-factory>
        <!-- JDBC Database connection settings -->
        <property name="hibernate.connection.driver_class">com.mysql.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/your_db</property>
        <property name="hibernate.connection.username">your_username</property>
        <property name="hibernate.connection.password">your_password</property>

        <!-- JDBC connection pool settings -->
        <property name="hibernate.c3p0.idle_test_period">3000</property>

        // ...

        <!-- Mention annotated class -->
        <mapping class="com.example.Student"/>
    </session-factory>

</hibernate-configuration>
```

### 자바와 파이썬 차이, 장단점
+ Java
  + <span style="background-color:#fff5b1">자바는 컴파일 언어로 실행시간이 빠르고 큰 규모 애플리케이션에 적합, 다양한 플랫폼에서 실행가능</span>
  + 복잡해 보이거나 보일러 플레이트코드 사용으로 작성 시간이 오래 걸릴 수 있습니다.
+ Python
  + 간결하고 읽기 쉬운 문법이고, 빠른 개발 속도
  + 다양한 라이브러리를 제공하고 웹, 데이터 분석, 인공지능, 과학 연산 등 다양한 분야에 활용가능
  + 인터프리터 언어이며, 컴파일 언어에 비해 상대적으로 느린 실행 속도
    + <span style="background-color:#fff5b1">컴파일 언어는 소스 코드를 기계코드로 변환하는 컴파일 과정을 거치고, 컴파일러에 의해 수행됩니다.</span>
    + 인터프리터 언어는 소스 코드를 라인별로 해석하고 실행하고, 코드를 직접 실행합니다. 런타임에 오류를 발경하며 오류가 발생한 시점에서 프로그램이 중단됩니다. 
  + 동시성 처리에 제한적, 멀티스레딩과 멀티 프로세싱이 상대적으로 더 복잡할 수 있습니다.

### class, abstract class, interface
+ 모두 다 객체 지향 프로그래밍의 핵심 구성 요소
+ ```class```는 객체를 생성하기 위한 틀 똔느 설계도. 데이터(필드)와 메서드를 포함함
+ ```abstract class```는 추상 클래스로 완전하지 않은 추상 메서드를 포함해 하위 클래스에서 추상 메서드를 구현하게 하는 클래스
+ ```interface```는 메서드의 시그니처만 정의하고 구현은 제공하지 않는 틀로 메서드 구현 자체가 불가능(java 8 이후 default, static 메서드 구현을 포함 가능)
  + 대부분 언어에서 인터페이스의 다중 구현은 가능하나 추상 클래스는 단일 상속만 허용
  + 추상 클래스와 인터페이스는 인스턴스화 할 수 없습니다.

### public, protected, private
+ ```public``` 어디서든 자유롭게 접근 가능
+ ```protected``` 같은 패키지 내의 클래스 또는 서브 클래스에서 접근할 수 있음
+ ```default``` 접근제한자 별도 지정 안한 경우에 해당하며, 같은 패키지 내의 클래스만 접근가능, <span style="background-color:#fff5b1">서브 클래스에서 접근 불가</span>
+ ```private``` 해당 클래스에서만 접근 가능

### this, super
+ ```this``` 현재 클래스를 참조
+ ```super``` 부모 클래스를 참조

### static, final
+ ```static``` 
  + static 변수는 클래스 로드시 한 번만 메모리에 할당
  + static 메서드는 클래스 이름으로 호출가능
  + static 멤버는 클래스 로더에 의한 메모리 로드시 초기화
    + 클래스 레벨에서 동작하므로 클래스 인스턴스를 생성하지 않고도 접근이 가능
    + ```int field = ExampleClass.staticField;```
+ ```final``` 
  + final 변수는 값 변경 불가능
  + final 메서드는 하위 클래스 오버라이딩 불가능
  + final 클래스는 상속 불가
+ ```static fianl```
  + 필드에 사용되는 경우, 변하지 않는 상수로 모든 인스턴스가 공유
  + 메서드에 사용하는 경우, 오버라이딩 할 수 없는 정적 메서드 선언시 사용
+ <span style="background-color:#fff5b1">```final``` 필드가 클래스의 모든 인스턴스에 대해 동일한 값을 가져야 하는 경우 ```static final```을 사용하는 것이 좋습니다. 그러나 ```final``` 필드가 인스턴스별로 다른 값을 가져야 하는 경우에는 ```static final```을 사용하면 안 됩니다.</span>
+ **Java best practice**
  + 변수 설정시
    + 값이 변경되지 않아야 하면 ```final```, 모든 인스턴스가 공유해야 하는 경우 ```static```, 모든 인스턴스 공유하면서 값 변경이 안 되어야 하면 ```static final```
  + 메서드 설정시
    + 오버라이딩 불가하게 하려면 ```fianl```, 인스턴스 생성하지 않고도 호출해야 하는 메서드에서 ```static```
  + 클래스 설정시
    + 상속 불가시 ```final```

### 데이터 타입 중 primitive type, reference type
+ primitive type 기본타입
  + ```byte```, ```short```, ```int```, ```long```, ```float```, ```double```, ```char```, ```boolean```
+ reference type 참조타입
  + 객체의 메모리 주소를 저장하는 타입 (실제 데이터 X)
  + 클래스, 인터페이스, 열거, 배열 등

### process와 thread 차이 및 용도, 그리고 어떻게 만들 수 있는지
+ [멀티프로세스와 멀티스레드](/study/2023/10/25/Interview.html#멀티프로세스와-멀티스레드) 참조
+ 프로세스는 프로그램의 인스턴스이며 하나 이상의 스레드를 갖습니다.
+ 스레드는 프로세스 내에서 실행되는 독립적인 실행경로, 프로세스의 메모리와 자원을 공유
+ ```Thread``` 클래스를 확장하거나 ```Runnable``` 인터페이스를 구현하여 스레드를 생성할 수 있습니다.

### 직렬화란?
+ 객체의 상태를 바이트 스트림으로 변환하는 프로세스
+ 데이터 영속성을 유지하며 다시 객체 상태로 사용할 수 있도록 합니다.
+ ```Serializable``` 

```java
import java.io.*;

class Person implements Serializable {
    String name;
    int age;
    
    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

public class SerializationExample {
    public static void main(String[] args) {
        Person p1 = new Person("John Doe", 25);
        
        // 직렬화
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("person.ser"))) {
            out.writeObject(p1);
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // 역직렬화
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("person.ser"))) {
            Person p2 = (Person) in.readObject();
            System.out.println(p2.name + ", " + p2.age);  // 출력: John Doe, 25
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

### @Override
+ 자바에서의 오버라이딩 명시로 <span style="background-color:#fff5b1">컴파일 시점</span>에서 오류를 잡을 수 있게 합니다.
+ 오버라이딩(Overriding)은 객체 지향 프로그래밍에서 사용되는 개념으로, 하위 클래스가 상위 클래스의 메서드를 자신의 클래스 내에서 재정의할 수 있게 하는 것을 의미합니다.
+ <span style="background-color:#fff5b1">동적 바인딩 지원</span>

### 배열과 ArrayList의 차이
+ 배열은 선언시 <span style="background-color:#fff5b1">크기고정, 기본 데이터와 객체 모두 저장 가능</span>, 인덱스 접근이 빠르나 확장성이 떨어집니다.
+ ArrayList는 크기를 동적으로 조정하며, 객체 타입으로 저장합니다. 다양한 메서드를 기본적으로 제공

### try, catch, finally의 개념 및 용도
+ 예외 발생할 수 있는 코드를 ```try``` 처리하고, ```catch```로 예외 처리를 진행하고, ```finally```로 ```try```, ```catch``` 실행 후 항상 처리할 작업을 수행합니다.

  

---
title: 아키텍처의 종류
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [CS, Architecture]
tags: []
pin: false
math: true
mermaid: true
---

<span style="background-color:#DCFFE4">애플리케이션 아키텍처는 왜 필요할까?</span>  
<span style="background-color:#fff5b1">아키텍처는 애플리케이션의 구조와 구성요소의 조직화 방식을 정한 것</span>으로 개발자가 애플리케이션을 만들 때, 어떤 기준으로 애플리케이션을 만들지를 알 수 있는 청사진을 제공합니다. 아키텍처는 일반적으로 UI, 비즈니스 로직, 데이터 액세스 계층, 인프라구조로 구성됩니다.  
좋은 아키텍처를 구축한다는 것은 구조를 잡고, 도메인을 통해 애플리케이션 핵심 기능을 파악하기 용이한 아키텍처를 말합니다. 그리고 팀원들과 공통의 룰을 가지고 유지보수 및 코드의 통일성을 만들어줍니다.

### 아키텍처의 종류
크게 모놀리식 아키텍처와 분산형 아키텍처로 나눌 수 있습니다.

**Monolithic Architecture, 모놀리식 아키텍처**  
<span style="background-color:#fff5b1">하나의 코드 베이스를 갖춘 대규모의 단일 컴퓨팅 네트워크입니다.</span> 주로 작은 애플리케이션 개발시에 코드 관리, 배포에 유용합니다. 하지만 전체 스택을 업데이트해야 한다는 단점이 있습니다. 종류로는 Layered Architecture, Clean Architecture, Hexagonal Architecture가 있습니다.

**Distributed Architecture, 분산형 아키텍처**
> The microservice architectural style is an approach to developing a single application as a suite of small services, each running in its own process and communicating with lightweight mechanisms, often an HTTP resource API.
> These services are built around business capabilities and independently deployable by fully automated deployment machinery. [Martin Fowler]

<span style="background-color:#fff5b1">소프트웨어 시스템을 여러 독립적인 구성 요소로 분할하고, 이러한 구성 요소들이 분산된 환경에서 동작하며 서로 통신하도록 설계된 아키텍처입니다.</span> Service Oriented Architecture, Event-based Architecture, MicroService Architecture(MSA)가 분산형 아키텍처에 해당됩니다.

#### 폰 노이만 아키텍처
컴퓨터는 폰 노이만 구조를 근간으로 발전했으며, 이를 통해 CPU, 메모리, 프로그램 구조를 갖는 범용 컴퓨터 구조를 확립했습니다. 컴퓨터 시스템의 전통적인 아키텍처 형태로, 기본적으로는 모놀리식 아키텍처에 해당합니다. 분산시스템에서도 적용될 수 있는 아키텍처로 확장성과 가용성을 향상시킬 수 있습니다.

**작동원리**  
사용자가 컴퓨터에 값을 입력하거나 프로그램을 실행할 경우 그 정보를 먼저 메모리에 저장시키고 CPU가 순차적으로 그 정보를 해석하고 계산해 사용자에게 결과값을 전달합니다.

  

##### Layered Architecture, 계층형 아키텍처
> Presentation 계층, Domain(Business or Service) 계층, Data Access(Persistence or Infrastructure) 계층

계층형 아키텍처는 단일 소프르퉤어 단위로 함께 작동하는 여러 개의 개별 수평 계층으로 구성된 아키텍처 패턴을 말합니다. 그 계층의 수는 소프트웨어에 따라 다양하게 나눌 수 있습니다.

##### 계층구조
**Presentation 계층**  
사용자와의 상호작용을 처리하는 계층으로 Model, View, Controller 그리고 HTTP 요청 처리 및 HTML 랜더링에 대해 알고 있는 웹 계층에 해당합니다.

**Domain 계층**  
시스템의 핵심로직을 담고 있는 계층으로 유효성 검사 및 계산들과 도메인 관련 작업들을 담당합니다. 토비의 스프링에서는 서비스 계층과 기반 서비스 계층으로 나누는데, [이동욱님 블로그](https://jojoldu.tistory.com/603)를 보면, 이를 도메인 계층과 서비스 계층으로 분류해서 명확히 한 것을 볼 수 있었습니다. 도메인 계층을 Rich Domain 모델을 기반으로 문제 도메인 해결에 순수하게 집중하는 계층으로 표현했고, 서비스 계층은 트랜잭션, 메일&SMS 발송 등 다른 인프라와의 통신을 담당하는 역할을 하는 계층으로 분리해서 설명했습니다.  
<span style="background-color:#DCFFE4">Rich Domain Model은 무엇인가</span>  
Anemic Domain Model은 객체가 데이터만을 갖고 있고 동작을 수행하는 데 필요한 비즈니스 로직이 다른 객체에 의해 처리되는 모델을 의미합니다. 이는 비즈니스 로직이 외부 서비스나 관리 객체에 의해 조작되는 형태를 말합니다. <span style="background-color:#fff5b1">반면, Rich Domain Model은 객체 자체가 비즈니스 로직을 포함하고 있으며, 데이터와 로직이 함께 동작합니다. 그러므로 Anemic Domain Model에 비해 비즈니스 중복 로직을 줄이고 객체 간 응집도를 높일 수 있는 장점이 있습니다.</span>

1. Anemic Domain Model의 예
```java
public class Order {
    private int orderId;
    private Date orderDate;
    private List<OrderItem> orderItems;

    // Getter and Setter methods for data fields

    public double calculateTotalPrice() {
        double totalPrice = 0;
        for (OrderItem item : orderItems) {
            totalPrice += item.getPrice();
        }
        return totalPrice;
    }
}
```

2. Rich Domain Model 예  
   Anemic Domain Model의 예와 달리 ```addOrderItem```, ```removeOrderItem```와 같이 동작을 수행하는 메서드도 포함되어 있고, ```OrderItem``` 객체에 ```calculatePrice()``` 메서드를 사용하여 각 주문 항목의 가격을 계산합니다. Rich Domain Model은 객체가 스스로 상태를 관리할 수 있도록 데이터와 데이터를 조작하는 로직이 함께 존재합니다.
```java
public class Order {
    private int orderId;
    private Date orderDate;
    private List<OrderItem> orderItems;

    // Getter and Setter methods for data fields

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
    }

    public double calculateTotalPrice() {
        double totalPrice = 0;
        for (OrderItem item : orderItems) {
            totalPrice += item.calculatePrice();
        }
        return totalPrice;
    }
}
```

**Data Access 계층**  
데이터베이스, Message Queue, 외부 API 통신 등을 처리하는 계층입니다.

 

##### 계층형 아키텍처의 문제점
<span style="background-color:#fff5b1">데이터베이스 주도 설계를 유도합니다.</span>  
도메인 중심이 아닌 영속성 계층에 의존하는 데이터베이스 중심으로 도메인이 만들어집니다. 이는 ORM 프레임워크에 따라 의존성의 방향이 보통 엔티티들이 속한 영속성 계층에 있기 때문입니다. 결과적으로 도메인 모델에 대한 상태 변경이 아닌 행동 중심으로 모델링이 된다는 단점이 있습니다. 뿐만 아니라 도메인 계층에서 즉시로딩/지연로딩, 트랜잭션 등을 담당하기 때문에 영속성 계층과의 강한 결합이 생기도록 한다는 문제가 있습니다.  
<span style="background-color:#fff5b1">지름길을 택하기 쉬워집니다.</span>  
계층형 아키텍처는 하위 계층에서 상위 계층으로의 접근이 어렵다는 문제가 있습니다. 그래서 ```지름길```로써 상위 컴포넌트를 하위 계층으로 내려서 접근이 편하도록 하는 잘못된 방법을 택해 영속성 계층을 비대하게 만드는 방법을 채택할 수 있습니다. 이를 ```깨진 창문 이론```이라는 심리적 효과로 표현하기도 합니다. 결국 하나의 계층에서 다양한 역할을 수행하게 되면서 관심사의 분리가 제대로 이뤄지지 않는다는 단점이 있습니다.  
<span style="background-color:#fff5b1">테스트하기 어려워집니다.</span>  
이렇게 프로젝트를 만든 적은 없지만, 웹 계층에서 바로 영속성 계층으로 접근하는 경우가 발생할 수 있습니다. 그 경우 도메인이 해야할 역할이 웹 계층에서 수행되는 등 계층 분리가 모호해지고 그에 따른 유닛테스트 수행이 어려워집니다.   
<span style="background-color:#fff5b1">유스케이스를 숨깁니다.</span>  
위 문제와 연장선 상에서 볼 수 있습니다. 계층의 모호한 분리는 유스케이스를 추가하려고 할 때, 정확히 어디에 기능을 추가할지 어려워집니다.  
<span style="background-color:#fff5b1">동시 작업이 어려워집니다.</span>  
영속성 계층을 중심으로 하기 때문에 협업이 어렵습니다. 도메인 또는 영속성 계층이 비대해지면 그 과정에서 동시에 편집해야 하는 경우가 발생하게 되고, merge하면서 코드 충돌이 발생할 수 있기 때문입니다.

 

**문제를 해결하기 위한 방법**  
위와 같은 계층형 아키텍처의 문제를 해결하기 위해서는 <span style="background-color:#fff5b1">객체지향 개발 원칙인 SOLID 윈칙을 따르고, 단위 테스트를 적용</span>해서 부적절하게 넓은 계층이 만들어지거나 불필요한 영속성 계층으로의 의존도를 줄일 필요가 있습니다.

---
[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)  
[Layered Architecture](https://www.baeldung.com/cs/layered-architecture)  
[계층형 아키텍처](https://jojoldu.tistory.com/603)  
[Anemic Domain Model vs. Rich Domain Model](https://medium.com/@inzuael/anemic-domain-model-vs-rich-domain-model-78752b46098f)  
[Rich vs Anemic Domain Model](https://stackoverflow.com/questions/23314330/rich-vs-anemic-domain-model)
[Microservice Principles: Decentralized Governance](https://nathanpeck.com/microservice-principles-decentralized-governance/)  
[Monolithic Architecture Is Still Worth at 2021 ?](https://medium.com/design-microservices-architecture-with-patterns/monolithic-architecture-is-still-worth-at-2021-98bfc112dc24)  
[마이크로서비스와 모놀리식 아키텍처 비교](https://www.atlassian.com/ko/microservices/microservices-architecture/microservices-vs-monolith)

  

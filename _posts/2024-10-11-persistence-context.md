---
title: 영속성 컨텍스트(persistence context)
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, JPA]
tags: [Spring, JPA]
pin: false
math: true
mermaid: true
---

### JPA의 모든 기능은 Transaction 안에서 수행해야 합니다.  
이는 JPA가 영속성 컨텍스트(persistence context)를 사용하여 엔티티의 상태를 추적하고, 데이터베이스와의 일관성을 유지하기 위해 필요합니다. <span style="background-color:#fff5b1">영속성 컨텍스트는 JPA에서 엔티티 객체를 관리하는 메모리 영역</span>이며, 엔티티의 상태를 추적하고 변경사항을 데이터베이스에 반영합니다. 트랜잭션을 사용하지 않으면 영속성 컨텍스트가 데이터베이스와의 일관성을 유지할 수 없게 되어, 데이터 불일치 문제가 발생할 수 있습니다.  
영속성 컨텍스트를 사용하므로써 <span style="background-color:#fff5b1">1차 캐시</span>에서 조회한 뒤, 없으면 DB 조회하고 1차 캐시에 반영합니다. 그리고 요청값을 반환합니다. 즉, 1차 캐시로 ```Repeatable Read``` 등급의 트랜잭션 격리수준을 애플리케이션 차원에서 한 트랜잭션 안에 수행하며, 매번 사용되는 것이 아니라 큰 성능상의 이점은 없지만, 한 트랜잭션이 길고 반복조회가 많다면 1차 캐시를 이용한 영속성 컨텍스트의 효과를 볼 수 있습니다.  
(참고로 모든 고객이 같은 캐시로 성능적 효과를 보는 것은 이와 별개로 2차 캐시라고 합니다.)
```java
EntityManager em = emf.createEntityManager();
EntityTransaction transaction = em.getTransaction();
transaction.begin();

em.persist(memberA);
em.persist(memberB);

transaction.commit();   

// em.persist(memberA); 첫 번째 SQL만 생성되서 조회하는 것을 확인할 수 있습니다.
// 이후 내용은 1차 캐시에서 조회하기 때문

em.detach(member);  // 준영속, 영속성 컨테스트에서 분리
em.remove(member);  // 객체를 삭제한 상태
```  
### 준영속 상태란?
JPA가 관리하는 상태인 1차 캐시에 있는 상태는 영속성 상태라고 할 수 있습니다. 반면, 준영속 상태는 영속성 컨텍스트에서 분리된 것으로 JPA가 관리하는 상태가 아닙니다. 따라서 항상 변경 감지를 사용해서 entity를 관리할 필요가 있습니다. 실무에서는 데이터베이스의 특정 테이블에 대한 일시적인 변경이 필요한 경우, 준영속 상태를 사용하여 일시적 변경 후 되돌리는 경우가 있습니다.

### 영속성 컨텍스트의 이점
1차 캐시만을 사용하며, 영속성 컨텍스트는 조회시 같은 객체를 불러온다는 점에서 <span style="background-color:#fff5b1">동일성을 보장</span>해줍니다. <span style="background-color:#fff5b1">트랜잭션을 지원하는 쓰기지연으로 영속성 컨텍스트를 플러시하기 전까지 데이터베이스 락이 걸리는 시간을 최소화</span>합니다. 지연로딩을 이용해서 연관관계를 <span style="background-color:#fff5b1">패러다임 불일치를 감소</span>시킵니다. 그리고 <span style="background-color:#fff5b1">변경감지(dirty check)</span>를 하기 때문에 스냅샷 정보와 바뀐 entity 정보를 비교해서 변경 부분을 커밋시에 업데이트해줍니다.

<span style="background-color:#DCFFE4">쓰기 지연 SQL 저장소는 왜 필요할까?</span>  
쓰기 지연은 한 트랜잭션에서 일어나는 update, save 쿼리를 가지고 있다가 최종적으로 commit이 일어나는 시점에 한 번에 DB에 반영하는 것을 말합니다. <span style="background-color:#fff5b1">Persistance Storage</span>는 이런 쓰기 지원 기능을 가지고 있습니다. 따라서 Persistance Context 하에 관리되고 있던 entity의 변화들을 감지, 추적하고 이를 Persistance Storage에 반영한 뒤 최종적으로 DB에 반영할 수 있도록 합니다.

<span style="background-color:#DCFFE4">플러시가 뭘까?</span>  
영속성 컨텍스트의 변경내용을 데이터베이스에 반영하는 것을 말합니다. 커밋이나 쿼리 실행시 자동으로 플러시가 발생하며(```FlushModeType.AUTO```, 기본값), 쓰기 지연 SQL 저장소의 쿼리를 데이터베이스에 전송합니다. 직접 호출하는 경우에는 ```em.flush()```를 이용할 수 있습니다. 플러시 자체는 영속성 컨텍스트를 비우지 않고 변경내용을 데이터베이스에 동기화합니다.   
참고로 JPA는 기본적으로 데이터를 맞추거나 동시성 관련된 것을 데이터베이스 트랜잭션에 위임합니다.

---
[자바 ORM 표준 JPA 프로그래밍 - 기본편](https://www.inflearn.com/course/ORM-JPA-Basic/dashboard)  
[Object Persistence with JPA](https://thistechnologylife.com/object-persistence-with-jpa/)  
[[JPA] 준영속 상태와 변경 감지](https://velog.io/@wogud7587/JPA-%EC%A4%80%EC%98%81%EC%86%8D-%EC%83%81%ED%83%9C%EC%99%80-%EB%B3%80%EA%B2%BD-%EA%B0%90%EC%A7%80)

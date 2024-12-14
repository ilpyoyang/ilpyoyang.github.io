---
title: 엔티티 설계시 주의점
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Spring]
tags: []
pin: false
math: true
mermaid: true
---

### 여기저기 ```@Setter``` 금지  
엔티티에서는 가급적 ```Setter```를 사용하지 말고 필요한 부분에는 따로 메서드를 생성해주는 것이 좋습니다. 실제 서비스를 운영할 때는 값을 ```set```할 수 있는 곳이 너무 많으면 유지보수에 어려움을 겪을 수 있기 때문입니다.

### 지연전략을 사용하기  
모든 연관관계는 지연로딩으로 설정해서 한 번 조회에 연관된 테이블들이 모두 조회돼서 메모리에 로드될 수 있기 때문입니다. 이 경우 성능의 저하, 불필요한 데이터 쿼리까지 발생하게 됩니다. 따라서 ```@ManyToOne``` 또는 ```@OneToOne```에서는 즉시로딩이 기본값이므로 반드시 ```fetch``` 전략을 지연로딩으로 설정하는 것이 좋습니다.  
만약에 즉시로딩일 필요한 로직이 생기는 경우 fetch 조인을 이용하거나 객체 그래프 탐색을 사용해서 문제를 해결할 수 있습니다. (객체지향 쿼리 언어 참조)

### 컬렉션에서 필드 초기화  
entity 설정시 연관관계 매핑으로 NPE 방지 차원에서 아래 코드처럼 초기화한 속성들이 있습니다. NPE 외에도 하이버네이트에서 제공하는 내장 컬렉션으로 관리가 들어가기 때문에 임의로 변경하지 않도록 주의해야 합니다.
```java
@OneToMany(mappedBy = "member")
private List<Orders> orders = new ArrayList<>();
```

<span style="background-color:#DCFFE4">하이버네이트에서 컬렉션을 어떻게 관리를 한다는 말인가</span>  
강의만 듣고는 이해가 가지 않았는데, 저와 같은 고민을 한 글을 발견했습니다. 하이버네이트가 엔티티를 영속화할 때 내부에 컬렉션이 있으면 하이버네이트가 특별하게 조작한 컬렉션으로 변경한다고 합니다. 그래서 임의 수정시 하이버네이트가 인식을 하지 못해 제대로 동작할 수 없는 문제가 발생한다고 합니다.  
그럼 하이버네이트는 컬렉션을 어떻게 관리하는 걸까요?  
하이버네이트는 컬렉션을 효율적으로 관리하기 위해 엔티티를 영속 상태로 만들때 원본 컬렉션을 감싸고 있는 내장 컬렉션을 생성해서 내장 컬렉션을 사용하도록 참조를 변경합니다. ```PersistentBag```, ```PersistentList```, ```PersistentSet``` 등의 컬렉션 래퍼를 사용합니다. 이러한 컬렉션들은 일반적인 자바 컬렉션과 달리 데이터베이스와의 연동을 위한 추가적인 기능을 제공합니다. 예를 들어, ```PersistentBag```은 중복된 값을 허용하면서도 순서를 유지할 수 있도록 구현되어 있습니다. 또한, ```PersistentBag```은 데이터베이스와의 동기화를 위해 데이터베이스에서 필요한 데이터만 로딩하여 메모리를 효율적으로 사용할 수 있도록 최적화되어 있습니다.

### 변경감지  
변경감지를 이용하면, ```find()```로 entity를 가져오는 과정에서 영속성 컨텍스트에서 관리대상이 되기 때문에 별도의 ```save()``` 로직이 없어도 트랜잭션이 끝나는 시점에 ```Dirty Checking```을 진행합니다.
```java
private final EntityManager em;
Member m = em.find(Member.class, 1);
m.setName("John");
m.setAge(30);
```
```merge()```로 병합처리를 하는 경우에는 기존 값에서 변경된 값이 있을 때, 구분해서 들어가는 것이 아니라 모두 병합처리되어 ```null```로 받는 값이 있는 경우 ```null``` 처리되기 때문에 사용에 유의하는 것이 좋다.

### 객체지향 설계를 위한 엔티티 연관 메서드 작성  
엔티티와 연관된 메서드는 관리를 위해 엔티티와 같이 작성해둡니다. 예를 들어, 엔티티의 생성, 삭제, 엔티티의 속성만을 가지고 계산하는 메서드 등이 해당됩니다. 이는 객체지향 설계 관점에서도 필요하고, 불필요한 엔티티 조작을 방지하 수 있습니다. 예를 들어, ```Member```라는 객체 자체를 외부에서 막 수정할 수 없도록 생성자를 ```protect```처리하고 생성 메서드를 직접 작성하는 것들이 해당됩니다.
```java
protected Stock(){}

public void addStock(int quantity){
    this.stockQuantity += quantity;
}

public void removeStock(int quantity){
    int restStock = this.stockQuantity -= quantity;
    if(restStock<0){
        throw new NotEnoughStockException("need more stock");
    }
    this.stockQuantity = restStock;
}
```

---
[실전! 스프링 부트와 JPA 활용1 - 웹 애플리케이션 개발](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-JPA-%ED%99%9C%EC%9A%A9-1)  
[실전! 스프링 부트와 JPA 활용2 - API 개발과 성능 최적화](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-JPA-API%EA%B0%9C%EB%B0%9C-%EC%84%B1%EB%8A%A5%EC%B5%9C%EC%A0%81%ED%99%94)  
[필드에 있는 컬렉션을 초기화 시키는 이유가 뭔가요?](https://www.inflearn.com/questions/258175/%ED%95%84%EB%93%9C%EC%97%90-%EC%9E%88%EB%8A%94-%EC%BB%AC%EB%A0%89%EC%85%98%EC%9D%84-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%8B%9C%ED%82%A4%EB%8A%94-%EC%9D%B4%EC%9C%A0%EA%B0%80-%EB%AD%94%EA%B0%80%EC%9A%94)  
[PersistentBag](https://docs.jboss.org/hibernate/orm/3.5/javadocs/org/hibernate/collection/PersistentBag.html)





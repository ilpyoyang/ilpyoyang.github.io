---
title: 데이터베이스 스키마 자동생성
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, JPA]
tags: [Spring, JPA]
pin: false
math: true
mermaid: true
---

## 데이터베이스 스키마 자동생성
JPA는 데이터베이스를 자동으로 생성해주도록 ```ddl-auto``` 옵션을 설정할 수 있습니다. 옵션의 종류는 ```create```, ```create-drop```, ```update```, ```none```, ```validate``` 종류가 있습니다. 주로 개발환경이나 테스트 서버에서는 ```update```를 사용해야 하고 실서버에서는 절대 사용하면 안됩니다. 주로 운영서버에서는 ```validate```나 ```none```을 사용합니다. ```validate```는 엔티티와 테이블이 정상 매핑되었는지만 확인합니다. ```none```이라는 개념은 실제 없고, 주석처리하는 것과 동일한 효과를 갖습니다.
```yml
jpa:
  hibernate:
    ddl-auto: create
```
<span style="background-color:#DCFFE4">DDL 생성기능은 DDL을 자동 생성할 때만 사용되고 JPA의 실행로직에는 영향을 주지 않습니다.</span> 즉 ```validation``` 용도로 사용하기에 좋습니다.

<br><br>

## 엔티티 매핑
**@Entity, @Table**
```java  
@Entity
@Table(name="TABLE", schema="NAME", 
        uniqueConstraints={@UniqueConstraint(name="unique_pid", columnNames="PersonalId")})
public class Table {
    // Entity 속성 생략    
}
``` 
**@Column**  
```@Column(name="location", length=20, nullable=false)```  
unique 제약여부도 걸 수 있지만, unique 제약의 이름을 설정하기 어렵기 때문에 ```@Table``` 위에 코드처럼 직접 설정해주는 것을 권장합니다.  
name을 설정할 때는 별도 지정이 없이도 스프링부트에서는 자바의 ```Carmel Case``` 이름을 ```Snake Case```로 변경해서 자동 매핑할 수 있는데, 직접 코드로 설정도 가능합니다. ```spring.jpa.hibernate.naming.physical-strategy``` 속성을 ```org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl``` 클래스로 설정하고, ```spring.jpa.hibernate.naming.physical-strategy``` 속성을 오버라이드하여 스네이크 케이스로 변환하는 클래스를 작성해야 합니다.
```properties
# 직접 구현시 -> 오버라이드
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
# 자동 구현시 설정
spring.jpa.properties.hibernate.physical_naming_strategy=com.example.SnakeCaseNamingStrategy
```

**@Enumerated**  
```@Enumerated(value = EnumType.STRING)```  
기본값인 EnumType.ORDINAL을 사용하면 enum 순서를 저장합니다.

**@Temporal**  
날짜 타입을 매핑할 때 사용되며, TemporalType은 date, time, timestamp로 나뉩니다. Date, Calendar 매핑에 사용하며, ```LocalDateTime```, ```LocatlDate```의 경우에는 생략이 가능합니다.

**@Transient**  
특정 필드를 컬럼에 매핑하지 않을 경우로 메모리 상에 어떤 값을 임시로 저장하고 싶은 경우에 사용됩니다.

**@Lob**  
Large Object의 줄임말로 스프링이 추론하여 어떤 타입으로 저장할지를 판단할 때 사용하며, 문자는 ```BLOB```으로 나머지는 ```CLOB``` 타입과 매핑합니다.

**@Id**  
기본키를 직접 매핑하는 경우에 사용됩니다.

**@GeneratedValue**  
기본키를 자동으로 생성해주는 어노테이션으로 ```GenerationType``` 전략은 4가지가 있습니다.
+ ```IDENTITY```
  + 기본키 생성을 데이터베이스에 위임하는 전략입니다. ```em.persist()``` 시점에 즉시 insert하고 db 식별자를 조회해옵니다.
  + MySQL은 ```AUTO_INCREMENT``` 값을 저장하고 나서 기본키를 구할 수 있을 때 사용됩니다.
  + <span style="background-color:#fff5b1">이 전략에서는 트랜잭션을 지원하는 쓰기 지연이 동작하지 않습니다.</span>
+ ```SEQUENCE```
  + ```@SequenceGenerator``` 시퀀스를 이용해서 기본키를 생성하는데, 시퀀스를 지원하는 데이터베이스에서 사용이 가능합니다.
+ ```TABLE```
  + 키 생성용 테이블을 사용하는 경우입니다.
+ ```AUTO```
  + 방언에 따라 자동지정되며, 기본값입니다.

```GenerationType``` 전략을 사용할 때는 주의가 필요합니다. Hibernate 버전별 전략에 따라 기본키 자동 생성이 설정 값과 다르게 적용될 수 있다는 문제를 실제 겪은 적이 있는데 잘 정리된 [블로그 글](https://jojoldu.tistory.com/295)이 있어서 추가합니다.

****
[[JPA] 기본 키(Primary Key)매핑](https://ttl-blog.tistory.com/123)  
[Spring Boot Data JPA 2.0 에서 id Auto_increment 문제 해결](https://jojoldu.tistory.com/295)

<br><br>

## 🚴🏽 JPAQueryFactory 설정 이슈
> Spring boot 3.x, Querydsl 5.0.0, Java 17

<br>

**이슈사항**  
Spring Boot 3.x 버전에서는 javax가 아닌 ```jakarta persistence dependency```를 사용해야 합니다. 그래서 ```build.gradle```을 변경하고 EntityManager import를 변경 후에 ```JPAQueryFactory```에 등록했음에도 제대로 작동하지 않는 모습을 보게 되었습니다.  
여전히 ```JPAQueryFactory```는 javax entity만을 요구하는 이슈가 발생했습니다.

![20230612_192728.png](/assets/post_images/issue/20230612_192728.png)

<span style="background-color:#DCFFE4; margin-right:5px">왜 jakarta를 사용해야 하는지에 대하여</span>  
오라클 재단에서 이클립스로 ```JavaEE``` 기술 이전과 함께 기존에 사용하던 ```javax.*``` 대신 다른 명칭인 ```jakarta.*```를 사용하는 ```JakartaEE```가 반영된 Spring boot가 릴리즈되었기 때문입니다.

<br>

**해결방법**  
먼저 Querydsl 사용을 위한 설정 부분을 보면, 변경된 jakarta로 되어 있습니다. 그리고 implementaion에도 jakarta를 명시해두었습니다. 이 부분은 문제가 없고 빌드나 Q class 생성에도 이상이 없었습니다.  
에러를 살펴보면 EntityManager 인식문제가 제일 컸기 때문에 [JPAQueryFactory](https://github.com/querydsl/querydsl/blob/master/querydsl-jpa/src/main/java/com/querydsl/jpa/impl/JPAQueryFactory.java)가 왜 인텔리제이에서 의존성 주입이 제대로 되지 않았는지 알아봤습니다.
```yml
// querydsl
implementation "com.querydsl:querydsl-jpa:${queryDslVersion}:jakarta"
annotationProcessor "com.querydsl:querydsl-apt:${queryDslVersion}:jakarta"
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
```
위의 코드와 같이 ```classifier```로 버전 뒤에 ```:jakarta``` 설정을 해주지 않아 생긴 문제였습니다. 이전 코드에 ```classifier```를 추가해주었지만, 인식을 제대로 하지 못했습니다. gradle 빌드, clean, import 재작성, cache 삭제 등 방법을 사용했지만 해결되지 않았습니다.
<span style="background-color:#fff5b1; margin-right:5px">결국 build.gradle 파일을 삭제하고 다시 생성</span>하는 것으로 해결했습니다.

[인텔리제이 문의](https://youtrack.jetbrains.com/issue/IDEA-255594/Intellij-keeps-old-dependencies)에서도 알 수 있듯이 꾸준히 같은 이슈가 발생하고 있다는 것을 알게 되었습니다. 이전 dependency가 프로젝트 내에 어떤 source에 영향을 미치고 있기 때문인 걸로 추측됩니다.
> Facing issue with dependency ,as when removed/updated a dependency it still persisted with older version . Even Settings>Maven> Always update snapshots did not work here.
Had to delete .idea and .iml files and reimport the project. Quite a lot of time and effort went into getting a workaround for this.
This is a very basic use case where developers need to keep updating the maven dependencies.
Having to spend time and money on ultimate edition seems wasteful at the moment.

이렇다 할 뚜렷한 대안은 없지만 IntelliJ를 뛰어넘는 툴도 없기에 여러 가능성을 두고 살펴보는 것이 제일 좋은 방법인 것 같습니다.

<br>

**결과**  
```jakarta.persistence.EntityManager```로도 ```JPAQueryFactory``` 빈 주입 및 생성에 문제가 없음을 확인했습니다. InitDB test도 통과했습니다!
정상적인 작동을 확인한 뒤에 코드를 살펴보면 java 파일은 ```javax```를 여전히 요구하고 있지만 class 파일 생성시에 ```jakarta``` 타입의 EntityManager로 받는 것을 알 수 있습니다.

![20230613_150127.png](/assets/post_images/issue/20230613_150127.png)

****
[스프링 부트 3.0 으로 전환](https://post.dooray.io/we-dooray/tech-insight-ko/back-end/4173/)  
[spring boot 3.0](https://github.com/querydsl/querydsl/issues/3493)  
[Intellij keeps old dependencies](https://youtrack.jetbrains.com/issue/IDEA-255594/Intellij-keeps-old-dependencies)

<br><br>

  

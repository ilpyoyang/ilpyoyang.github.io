---
title: 엔티티 매핑
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, JPA]
tags: [Spring, JPA]
pin: false
math: true
mermaid: true
---

### @Entity, @Table### 
```java  
@Entity
@Table(name="TABLE", schema="NAME", 
        uniqueConstraints={@UniqueConstraint(name="unique_pid", columnNames="PersonalId")})
public class Table {
    // Entity 속성 생략    
}
``` 
### @Column 
```@Column(name="location", length=20, nullable=false)```  
unique 제약여부도 걸 수 있지만, unique 제약의 이름을 설정하기 어렵기 때문에 ```@Table``` 위에 코드처럼 직접 설정해주는 것을 권장합니다.  
name을 설정할 때는 별도 지정이 없이도 스프링부트에서는 자바의 ```Carmel Case``` 이름을 ```Snake Case```로 변경해서 자동 매핑할 수 있는데, 직접 코드로 설정도 가능합니다. ```spring.jpa.hibernate.naming.physical-strategy``` 속성을 ```org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl``` 클래스로 설정하고, ```spring.jpa.hibernate.naming.physical-strategy``` 속성을 오버라이드하여 스네이크 케이스로 변환하는 클래스를 작성해야 합니다.
```properties
# 직접 구현시 -> 오버라이드
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
# 자동 구현시 설정
spring.jpa.properties.hibernate.physical_naming_strategy=com.example.SnakeCaseNamingStrategy
```

### @Enumerated 
```@Enumerated(value = EnumType.STRING)```  
기본값인 EnumType.ORDINAL을 사용하면 enum 순서를 저장합니다.

### @Temporal 
날짜 타입을 매핑할 때 사용되며, TemporalType은 date, time, timestamp로 나뉩니다. Date, Calendar 매핑에 사용하며, ```LocalDateTime```, ```LocatlDate```의 경우에는 생략이 가능합니다.

### @Transient 
특정 필드를 컬럼에 매핑하지 않을 경우로 메모리 상에 어떤 값을 임시로 저장하고 싶은 경우에 사용됩니다.

### @Lob 
Large Object의 줄임말로 스프링이 추론하여 어떤 타입으로 저장할지를 판단할 때 사용하며, 문자는 ```BLOB```으로 나머지는 ```CLOB``` 타입과 매핑합니다.

### @Id 
기본키를 직접 매핑하는 경우에 사용됩니다.

### @GeneratedValue 
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

---

[[JPA] 기본 키(Primary Key)매핑](https://ttl-blog.tistory.com/123)  
[Spring Boot Data JPA 2.0 에서 id Auto_increment 문제 해결](https://jojoldu.tistory.com/295)

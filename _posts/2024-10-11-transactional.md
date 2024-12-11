---
title: Transactional 어노테이션
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Spring]
tags: [Transactional]
pin: false
math: true
mermaid: true
---

트랜잭션 관리를 위해 Spring Framework 2.0 이상의 버전에서 지원되는 어노테이션입니다. 메서드 레벨 또는 클래스 레벨에서 사용할 수 있으며, 해당 메서드 또는 클래스의 모든 public 메서드에 트랜잭션을 적용합니다.

<br>

### @Transactional의 작동방식 
<span style="background-color:#fff5b1">Spring boot 애플리케이션을 실행하는 시점</span>에 proxy 를 생성에 필요한 TransactionAutoConfiguration 등 클래스들이 자동으로 활성화됩니다. 따라서 클라이언트 request를 보내면 @Transactional이 적용된 메서드에 대한 트랜잭션 처리가 가능해집니다.
```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(PlatformTransactionManager.class)
@AutoConfigureAfter({ JtaAutoConfiguration.class, HibernateJpaAutoConfiguration.class,
  DataSourceTransactionManagerAutoConfiguration.class, Neo4jDataAutoConfiguration.class })
@EnableConfigurationProperties(TransactionProperties.class)
public class TransactionAutoConfiguration {

   @Configuration(proxyBeanMethods = false)
   @ConditionalOnBean(TransactionManager.class)
   @ConditionalOnMissingBean(AbstractTransactionManagementConfiguration.class)
   public static class EnableTransactionManagementConfiguration {

      @Configuration(proxyBeanMethods = false)
      @EnableTransactionManagement(proxyTargetClass = false)
      @ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "false")
      public static class JdkDynamicAutoProxyConfiguration {}

      @Configuration(proxyBeanMethods = false)
      @EnableTransactionManagement(proxyTargetClass = true)
      @ConditionalOnProperty(prefix = "spring.aop", name = "proxy-target-class", havingValue = "true",
        matchIfMissing = true)
      public static class CglibAutoProxyConfiguration {}

   }
}
```
위 코드에서 알 수 있듯이 TransactionAutoConfiguration으로 ProxyConfiguration 구성을 활성화하기 위해서는 @ConditionalOnClass에 따른 선행조건으로 PlatformTransactionManager()가 있어야합니다.  
일반적으로 ```spring-jdbc```나 ```spring-data-jpa``` 등의 의존성을 포함시키면DataSourceTransactionManage나 JpaTransactionManager 등과 같은 클래스가 PlatformTransactionManager 구현체로 사용됩니다. 이렇게 구성된 TransactionManager는 connection 객체를 생성하고, 트랜잭션의 commit 또는 rollback을 가능하게 합니다.  
이렇게 TransactionManager가 선정되면 @EnableTransactionManagement가 선언된 ProxyConfiguration 클래스를 통해 트랜잭션 관리 기능을 활성화합니다. ProxyConfiguration 클래스로 두 가지를 제시하고 있는데 바로 JDK Dynamic Proxy와 CGLIB 방식입니다. JDK Dynamic Proxy는 인터페이스를 기반으로 프록시 객체를 생성하며, CGLIB은 바이트 코드 조작을 통해 원본 객체의 서브클래스를 생성한다는 차이점이 있습니다.  
Spring은 AOP 프레임워크를 이용하여 프록시를 생성하고, 특정 메소드 호출을 가로채서 추가 동작을 수행합니다.

<br>

### @Transactional의 속성
+ propagation(전파방식)
  + REQUIRED, REQUIRES_NEW, NESTED, SUPPORTS, MANDATORY, NOT_SUPPORTED, NEVER
+ isolation(격리수준)
  + READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
+ readonly(읽기 전용 여부)
+ timeout

<br>

### 사용할 때 이것만큼은 고려하자!

<span style="background-color:#fff5b1">1. 트랜잭션을 적용하려는 메서드는 반드시 public으로 선언되어야 합니다.</span>  
프록시 객체로 외부에서 접근 가능한 인터페이스를 제공해야 하기 때문입니다. 만약 해당 메서드가 private이나 protected로 선언되어 있다면, 프록시 객체가 생성될 때 해당 메서드에 접근할 수 없으므로 @Transactional 어노테이션을 사용한 트랜잭션 관리가 불가능합니다.

<span style="background-color:#fff5b1">2. 다른 AOP 기능과의 충돌을 고려해야 합니다.</span>
예를 들어 @Secured를 통해 권한이 있는 사용자 여부를 확인하는데 @Transactional이 먼저 수행된다면 권한 검사가 무의미해집니다.  
이를 방지하기 위해서는 @Order를 이용해 적용 순서를 정하거나 적용범위를 조정해서 해결할 수 있습니다. 이외에도 @Transactional proxyTargetClass 속성을 true로 설정하여 강제로 클래스를 대상으로 프록시를 사용하도록 지정할 수도 있습니다. 하지만 성능저하가 발생할 수 있다는 단점이 있습니다.

<span style="background-color:#fff5b1">3. Service 계층에서 사용하자.</span>  
Service 계층에서 @Transactional을 사용하므로써 여러 데이터베이스 작업들을 원자적으로 처리할 수 있습니다. 그리고 Spring에서 단일 책임원칙에 따라 Database 계층에서 비즈니스 로직과 관련 없는 역할을 담당해 코드의 유지보수와 확장성이 높이기 위함입니다.  
<span style="background-color:#DCFFE4">그럼 JPA에서는 왜 SimpleJpaRepository에 @Transactional을 사용할까요?</span>  
Spring Data JPA에서 제공하는 SimpleJpaRepository는 일반적인 레포지토리 구현체와는 조금 다릅니다. SimpleJpaRepository는 JPA에서 제공하는 기능들을 활용하여, 일부 비즈니스 로직을 처리합니다. 예를 들면, save() 메소드를 사용하여 엔티티를 저장할 때 새로운 것인지 아니면 이미 저장된 것인지를 판단하여 동작을 수행합니다. 그리고 Mixed Transaction이 발생해도 일반적으로 Service 계층의 @Transactional이 우선순위를 갖습니다.

<span style="background-color:#fff5b1">4. Exception을 고려하자.</span>  
트랜잭션은 RuntimeException과 Error에서는 롤백되지만, Checked exceptions에서는 롤백되지 않습니다. Checked exceptions는 예측가능한 에러를 말하는데, 아래와 같이 @Transactional에 rollbackFor 속성을 두어 롤백처리가 되도록 할 수도 있습니다.
```java
@Transactional(rollbackFor={Exception.class})
```
<span style="background-color:#fff5b1">5. 트랜잭션 Checked exception이 발생했을 때 Java와 Kotlin</span>  
Java에서는 롤백되지 않고 Checked exception을 try-catch, throw 방식으로 처리하고 있지만 Kotlin에서는 트랜잭션이 롤백되는 것을 볼 수 있습니다. 하지만 Java에서처럼 롤백이 되지 않도록 @Throws를 사용해서 처리할 수도 있습니다.
따라서 개발자는 어떤 언어를 스프링과 사용하는지 그리고 Custom Exception 설정을 어떻게 하는지에 따라 다양한 Exception 처리방법을 고려해야 합니다.

<span style="background-color:#fff5b1">6. 트랜잭션과 DeadLock</span>  
실제로 DeadLock 이슈가 발생해서 리펙토링을 하면서 가장 유심히 본 부분 중 하나입니다. Service 계층에서 설정한 메서드들이 데이터베이스에서 어떤 방향으로 리소스를 점유하는지는 매우 중요합니다.

---
[@Transactional 바르게 알고 사용하기](https://medium.com/gdgsongdo/transactional-%EB%B0%94%EB%A5%B4%EA%B2%8C-%EC%95%8C%EA%B3%A0-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-7b0105eb5ed6)
[Spring Transaction Management: @Transactional In-Depth](https://www.marcobehler.com/guides/spring-transaction-management-transactional-in-depth)

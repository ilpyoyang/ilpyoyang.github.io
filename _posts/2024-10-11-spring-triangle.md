---
title: Spring Triangle
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Spring]
tags: [IoC, AOP, PSA]
pin: false
math: true
mermaid: true
---

Spring Triangle은 IoC, AOP, PSA로 나눌 수 있습니다.

### 의존성 주입과 제어역전, IoC(Inversion of Control)
```java
// 사용할 의존성을 외부에서 만들어주는 개념이 바로 IoC이다.
class OwnerController {
   private OwnerRepository repository = new OwnerRepository();
}
```
<span style="background-color:#fff5b1">의존성을 주입해주는 일을 외부에서 해주는 것을 IoC 라고 합니다.</span> IoC 컨테이너는 ```Application Context```와 ```BeanFactory``` 인터페이스를 이용해 빈을 만들고 빈들 사이의 의존성을 제공해줍니다. 빈의 생성은 컨테이너가 만들어질 때 ```component scanning``` 과정으로 ```@Component``` 이하 값들을 빈으로 등록해줍니다.  
여기서 ```빈(Bean)```이란 스프링 IoC 컨테이너가 관리하는 객체를 말합니다. ```applicationContext.getBean()``` 메서드를 사용하면 스프링에 등록된 모든 빈의 이름들을 찾을 수 있습니다.  
<span style="background-color:#DCFFE4">그럼 @Autowired, @Inject 차이점은 무엇일까?</span>  
등록된 빈들을 사용하기 위해 사용되며, 서로 대체가 가능합니다. 이 어노테이션들을 사용할 때는 <span style="background-color:#fff5b1">생성자에 사용하는 것이 권장</span>됩니다. <span style="background-color:#fff5b1">@Autowired는 Spring</span>에서 지원하는 프레임워크에 종속적인 어노테이션이고, <span style="background-color:#fff5b1">@Inject는 Java</span>에서 지원하는 것이며, nullable하지 않기 때문에 반드시 주입받을 빈이 필요합니다.

<br>

### 관점 지향 프로그래밍, AOP(Aspect Oriented Programming)  
<span style="background-color:#fff5b1">관심사를 중점으로 중복된 코드를 모아서 횡단 관심사의 처리를 하는 프로그래밍 기법</span>을 말합니다. 예를 들어, 메서드별 성능을 재기 위해서 사용하는 ```org.springframework.util.StopWatch``` 스프링 프레임워크에서 제공하는 유틸을 사용할 수 있는데, 이런 공통기능들을 모든 메서드 실행 전 수행하고 시간을 측정하는 방식으로 AOP를 구성할 수 있습니다.    
AOP를 구현하는 방법은 AspectJ를 이용한 컴파일을 이용하거나 바이트 코드를 조작하거나 프록시 패턴을 이용하는 방법들이 있습니다. 그 중에서도 스프링은 프록시 패턴을 이용해서 AOP를 지원하고 있습니다. 이는 실제 디자인패턴에서 말하는 프록시 패턴과 조금 상이한데, 리플렉션과 바이트코드 조작을 이용해 실제 타겟 기능을 대리 수행하며, 기능을 확장하거나 추가할 수 있는 <span style="background-color:#fff5b1">다이나믹 프록시 객체</span>를 의미합니다.
```java
// 스프링 AOP 처리 예제 코드
@Component
@Aspect
public class LogAspect {
  Logger logger = LoggerFactory.getLogger(LogAspect.class);

  @Around("@annotation(LogExecutionTime)")
  public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable{
    StopWatch stopWatch = new StopWatch();
    stopWatch.start();

    Object proceed = joinPoint.proceed();

    stopWatch.stop();
    logger.info(stopWatch.prettyPrint());

    return proceed;
  }
}
```


<details>
<summary><span style="background-color:#f0f0f0; cursor:pointer;">🔍 AspectJ를 이용한 컴파일과 바이트 코드 조작 방식으로 구현하는 AOP</span></summary>  

컴파일 방식 <br>
A.java - (AOP) - A.class(AspectJ)  <br>
바이트코드 조작 <br>
A.java - A.class - (AOP) - 메모리(AspectJ)

</details>

<br>

### 추상화 서비스, PSA(Portable Service Abstraction)  
잘 만든 인터페이스. <span style="background-color:#fff5b1">환경 변화와 관계없이 일관된 방식의 기술로의 접근 환경을 제공하는 추상화 구조</span>를 말합니다. Spring에서는 Spring Web MVC, Spring Transaction, Spring Cache 등 다양한 PSA를 제공합니다. Spring MVC를 사용하면 @Controller, @RequestMapping 등의 기능을 기존 코드 변동없이 간단하게 코드 변경이 가능한 것을 알 수 있습니다. 이렇게 일관성 있는 서비스 추상화(Service Abstraction)을 만들 수 있습니다.
+ 프로젝트의 ```spring-boot-starter-web``` 의존성 대신 ```spring-boot-starter-webflux``` 의존성을 받도록 바꿔주기만 하면 ```Tomcat```이 아닌 ```netty``` 기반으로 실행하게 할 수 있습니다.

---

[예제로 배우는 스프링 입문](https://www.inflearn.com/course/spring_revised_edition#)  
[Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
[Proxy](https://refactoring.guru/design-patterns/proxy)





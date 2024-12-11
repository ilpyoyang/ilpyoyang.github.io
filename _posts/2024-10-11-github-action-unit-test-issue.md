---
title: contextLoads() FAILED
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring]
tags: [이슈]
pin: false
math: true
mermaid: true
---

**문제발생**  
로컬에서는 문제가 없었는데 Github Action pr test를 통과하지 못하는 상황이 발생했습니다. 당시 pr에 많은 기능의 commit이 있어서 하나씩 살펴봤지만 test가 성공하지 못하는 이유를 알지 못해서 팀원들과 같이 논의하면서 해결하게 되었습니다. 

![20231003_150719.png](/assets/post_images/spring/20231003_150719.png)

<br>

**문제원인 파악하기**  
properties가 잘 매핑되지 않았기 때문에 나는 에러였고 ```.env```, ```application.yml``` 등 mapping 파일들을 살펴보게 되었습니다.
```
DevMingleApplicationTest > contextLoads() FAILED
    java.lang.IllegalStateException at DefaultCacheAwareContextLoaderDelegate.java:143
        Caused by: org.springframework.beans.factory.BeanCreationException at AutowiredAnnotationBeanPostProcessor.java:489
            Caused by: java.lang.IllegalArgumentException at PropertyPlaceholderHelper.java:18***
OpenJDK 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
2***23-1***-***3T***4:55:***5.188Z  INFO 192*** --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
```

<br>

**해결방안**  
팀 회의 때 같이 살펴본 결과 test에 있는 ```application.yml```에 ```include```처리로 다른 mapping 파일을 추가하지 않아 발생한 문제였습니다.  
결과적으로 새로 이번에 commit하면서 생성된 ```valid``` mapping을 추가하므로서 해결할 수 있었습니다.
```yml
spring:
  profiles:
    include: auth, valid
```

<br>

**추가 고찰하기**  
Github action에 test를 통과하는지 살펴보기 위해서는 test 코드 빌드여부를 확인해야 하고, 그 과정에서 속성값 매핑이 제대로 되는지 확인해야 합니다.
알고보니 사실 간단한 솔루션이었지만 이 글을 남기는 이유는 간단해도 기억하지 못하거나 경험하지 않았을 때, 간과할 수 있는 부분이라 생각이 들었기 때문입니다.
그리고 저 혼자 보이지 않던 부분을 팀원들과 해결할 수 있어서 뿌듯했습니다 :)

<br><br>

## 🚴🏽 @Password 사용자 정의 어노테이션 생성과 yml 속성 mapping error 해결하기

**문제발생**  
유효성 검증을 위해 어노테이션을 생성하고 에러메세지와 pattern을 mapping하는 과정에서 yml 값이 제대로 연결되지 않는 문제가 발생했습니다.
```
10:35:32.622 [restartedMain] ERROR org.springframework.boot.SpringApplication -- Application run failed java.lang.NullPointerException: Cannot invoke "Object.toString()" because "key" is null at org.springframework.beans.factory.config.YamlProcessor.lambda$asMap$0(YamlProcessor.java:248) at java.base/java.util.LinkedHashMap.forEach(LinkedHashMap.java:721) at org.springframework.beans.factory.config.YamlProcessor.asMap(YamlProcessor.java:239) at org.springframework.beans.factory.config.YamlProcessor.lambda$asMap$0(YamlProcessor.java:241) at java.base/java.util.LinkedHashMap.forEach(LinkedHashMap.java:721) at org.springframework.beans.factory.config.YamlProcessor.asMap(YamlProcessor.java:239) at org.springframework.beans.factory.config.YamlProcessor.lambda$asMap$0(YamlProcessor.java:241) at java.base/java.util.LinkedHashMap.forEach(LinkedHashMap.java:721)
```

application-valid.yml
```yml
valid:  
  password:  
    pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$
    message:
      null: 비밀번호는 공백일 수 없습니다.  
      err: 비밀번호는 최소 8자 이상, 영문 대소문자, 숫자, 특수 문자 포함해야 합니다.
```

PasswordValidator.java
```java
package com.example.dm.dto.users;  
  
import jakarta.annotation.PostConstruct;  
import jakarta.validation.ConstraintValidator;  
import jakarta.validation.ConstraintValidatorContext;  
import org.slf4j.Logger;  
import org.slf4j.LoggerFactory;  
import org.springframework.beans.factory.annotation.Value;  
import org.springframework.stereotype.Component;  
  
@Component  
class PasswordValidator implements ConstraintValidator<Password, String> {  
  @Value("${valid.password.pattern}")  
  private String PASSWORD_PATTERN;  
  @Value("${valid.password.message.null}")  
  private String PASSWORD_NULL_MESSAGE;  
  @Value("${valid.password.message.err}")  
  private String PASSWORD_ERR_MESSAGE;
    
  @Override  
  public boolean isValid(String value, ConstraintValidatorContext context) {  
      if(value.isBlank()){  
          context.disableDefaultConstraintViolation();  
          context.buildConstraintViolationWithTemplate(PASSWORD_NULL_MESSAGE)  
          .addConstraintViolation();  
          return false;  
      }else if(!value.matches(PASSWORD_PATTERN)){  
          context.disableDefaultConstraintViolation();  
          context.buildConstraintViolationWithTemplate(PASSWORD_ERR_MESSAGE)  
          .addConstraintViolation();  
          return false;  
      }  
      return true;  
      }  
  }
}
```

<br>

**문제원인 파악하기**
1. .yml 값 등록이 바르게 들어오는 것을 확인했습니다.
2. PasswordValidator 클래스는 @Component 설정된 상태입니다.
3. 에러 디버깅 ```YamlProcessor``` 찍어보기

<br>

**해결방안**  
```YamlProcessor```에서 찍어봤을 때, key 값이 null이고 value는 제대로 들어오는 것을 확인할 수 있었습니다. 
value 값의 문자열 처리 이후에도 문제가 발생해서 디버깅 해본 결과, yml 파일에 key 값으로 설정할 수 없는 예약어 ```null```이 사용된 것을 알 수 있었습니다.
yml에서 사용할 수 없는 예약어로는 ```y```,```yes```,```n```,```no```,```true```,```false```,```null```,```~``` 등이 있습니다.

<br>

**추가 고찰하기**  
추가적으로 @Value 값이 제대로 들어오는지 확인하기 위해서 ```@PostConstruct```로 값을 찍어볼 수 있습니다.  
하지만 위에서 문제는 ```@PostConstruct```는 확인이 불가능했는데, 스프링 빈이 생성되고 모든 의존성 주입 완료 후 실행되기 때문입니다. 위에 에러는 설정파일이나 초기화 단계의 문제이기 때문에
빈의 메서드 실행 전이라 애플리케이션 실패로 미리 종료되어 버렸기 때문입니다. 이 경우는 단순하게 yml 파일 설정을 확인할 필요가 있음을 알게 되었습니다.
```java
private static final Logger logger = LoggerFactory.getLogger(PasswordValidator.class);

@PostConstruct  
public void postConstruct() {  
	logger.info("PASSWORD_PATTERN: {}", PASSWORD_PATTERN);  
	logger.info("PASSWORD_NULL_MESSAGE: {}", PASSWORD_NULL_MESSAGE);  
	logger.info("PASSWORD_ERR_MESSAGE: {}", PASSWORD_ERR_MESSAGE);  
}  
```

<br><br>



## 🚴🏽 암호화와 authentication 이슈
> Spring boot 3.x, Spring security 6, Java 17

<br>

**이슈사항**  
Spring security 설정으로 ```defaultSuccessUrl```로 잘 이동하는 것처럼 보였으나 실제로 ```SecurityContextHolder```에 제대로 authentication이 등록되지 않아서 뷰단에서 thymeleaf ```sec:authorize``` 설정이 제대로 되지 않는 문제가 발생했습니다. 해결방법은 간단했지만 당시에 별다른 에러 문구가 없어 고민한 부분들을 정리하는 방식으로 작성했습니다.

<br>

**시도한 방법들**  
먼저, 의존성 문제가 아닐까 고민했습니다. Spring boot 3.x와 일부 의존성 충돌 가능성에 대한 글을 읽은 기억이 있어서 찾아봤는데 공식 레퍼런스에서도 ```thymeleaf-extras-springsecurity6```와 이슈가 있다는 등의 관련된 별다른 접점은 찾지 못했습니다.  
```SecurityContextHolder```에서 authentication을 제대로 담지 못하고 있는 것이 아닐까 생각해서 debug를 하면서 코드를 찾아봤습니다. 그리고 명시적으로 ```SecurityContextHolder```에 ```authentication```을 넣어도 값이 ```anomyous authentication```으로 찍히는 것을 보았습니다. 이 부분은 요청을 수행 후 자동으로 ```filterChainProxy```에서 ```doFilter```에서 ```this.securityContextHolderStrategy.clearContext();```처리해서의 문제가 아니였다는 것을 알게 되었습니다.
```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    boolean clearContext = request.getAttribute(FILTER_APPLIED) == null;
    if (!clearContext) {
        doFilterInternal(request, response, chain);
        return;
    }
    try {
        request.setAttribute(FILTER_APPLIED, Boolean.TRUE);
        doFilterInternal(request, response, chain);
    }
    catch (Exception ex) {
        Throwable[] causeChain = this.throwableAnalyzer.determineCauseChain(ex);
        Throwable requestRejectedException = this.throwableAnalyzer
                .getFirstThrowableOfType(RequestRejectedException.class, causeChain);
        if (!(requestRejectedException instanceof RequestRejectedException)) {
            throw ex;
        }
        this.requestRejectedHandler.handle((HttpServletRequest) request, (HttpServletResponse) response,
                (RequestRejectedException) requestRejectedException);
    }
    finally {
        this.securityContextHolderStrategy.clearContext();
        request.removeAttribute(FILTER_APPLIED);
    }
}
```  

<br>

**해결방안**  
초심으로 돌아가서 중요하게 다시 생각해보게 된 부분이 Spring security의 동작원리였습니다. filter 중심의 Spring security 프로세스에서 인증논리 구조를 보면 ```UserDetailService```로 user 여부를 확인하고, 이 때 인증은 ```AuthenticationProvider```라는 인증 제공자를 통해서 진행됩니다.
이를 위해 ```SecurityConfig```에 빈으로 주입해서 authentication이 바르게 적용된 것을 확인할 수 있었습니다.
```java
@Bean
public DaoAuthenticationProvider daoAuthenticationProvider(){
    DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
    daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
    daoAuthenticationProvider.setUserDetailsService(authService);
    return daoAuthenticationProvider;
}
```

<br>

**추가 고찰**  
이전 프로젝트에서는 Spring security에서 별도의 인증제공자를 빈으로 주입하지 않아도 작동했었는데, 오래된 버전이라서 ```WebSecurityConfigurerAdapter```를 통한 override 방식의 구현이었다는 점이 가장 큰 차이였습니다.
version 5.4 이후부터는 ```component-based``` 방식으로 접근하기 때문에 달라진 부분이 있습니다. filterChain 방식의 구현과 필요한 논리부를 빈 또는 컴포넌트화해서 사용합니다.  
그럼에도 불구하고 이번 이슈는 단순히 ```WebSecurityConfigurerAdapter```가 deprecated 되었기 때문이라고만은 볼 수 없었습니다.

![20230706_194429.png](/assets/post_images/issue/20230706_194429.png)

여기서 보면, AuthenticationManager로서 ```ProviderManager```는 ```DaoAuthenticationProvider```를 default 값으로 제공하고 있는 것을 알 수 있습니다. 하지만 위 해결방안에서 @Bean 주입 이후 ```DaoAuthenticationProvider```의 authentication 과정이 제대로 작동하는 것을 볼 수 있었습니다.

<br>

**결과**  
authenication 과정이 제대로 작동하는 것을 볼 수 있었고, 뷰단에서 securityContext에 따른 ```sec:authorize```가 잘 작동해 로그인한 경우에는 로그아웃 버튼이 보이게 동작하는 것을 확인할 수 있었습니다.

<br><br>

## Spring Triangle
> IoC, AOP, PSA

<br>

**의존성 주입과 제어역전, IoC(Inversion of Control)**
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

**관점 지향 프로그래밍, AOP(Aspect Oriented Programming)**  
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

**추상화 서비스, PSA(Portable Service Abstraction)**  
잘 만든 인터페이스. <span style="background-color:#fff5b1">환경 변화와 관계없이 일관된 방식의 기술로의 접근 환경을 제공하는 추상화 구조</span>를 말합니다. Spring에서는 Spring Web MVC, Spring Transaction, Spring Cache 등 다양한 PSA를 제공합니다. Spring MVC를 사용하면 @Controller, @RequestMapping 등의 기능을 기존 코드 변동없이 간단하게 코드 변경이 가능한 것을 알 수 있습니다. 이렇게 일관성 있는 서비스 추상화(Service Abstraction)을 만들 수 있습니다.
+ 프로젝트의 ```spring-boot-starter-web``` 의존성 대신 ```spring-boot-starter-webflux``` 의존성을 받도록 바꿔주기만 하면 ```Tomcat```이 아닌 ```netty``` 기반으로 실행하게 할 수 있습니다.

<hr/>

[예제로 배우는 스프링 입문](https://www.inflearn.com/course/spring_revised_edition#)  
[Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
[Proxy](https://refactoring.guru/design-patterns/proxy)

<br><br>

## 엔티티 설계시 주의점
**여기저기 ```@Setter``` 금지**  
엔티티에서는 가급적 ```Setter```를 사용하지 말고 필요한 부분에는 따로 메서드를 생성해주는 것이 좋습니다. 실제 서비스를 운영할 때는 값을 ```set```할 수 있는 곳이 너무 많으면 유지보수에 어려움을 겪을 수 있기 때문입니다.

**지연전략을 사용하기**  
모든 연관관계는 지연로딩으로 설정해서 한 번 조회에 연관된 테이블들이 모두 조회돼서 메모리에 로드될 수 있기 때문입니다. 이 경우 성능의 저하, 불필요한 데이터 쿼리까지 발생하게 됩니다. 따라서 ```@ManyToOne``` 또는 ```@OneToOne```에서는 즉시로딩이 기본값이므로 반드시 ```fetch``` 전략을 지연로딩으로 설정하는 것이 좋습니다.  
만약에 즉시로딩일 필요한 로직이 생기는 경우 fetch 조인을 이용하거나 객체 그래프 탐색을 사용해서 문제를 해결할 수 있습니다. (객체지향 쿼리 언어 참조)

**컬렉션에서 필드 초기화**  
entity 설정시 연관관계 매핑으로 NPE 방지 차원에서 아래 코드처럼 초기화한 속성들이 있습니다. NPE 외에도 하이버네이트에서 제공하는 내장 컬렉션으로 관리가 들어가기 때문에 임의로 변경하지 않도록 주의해야 합니다.
```java
@OneToMany(mappedBy = "member")
private List<Orders> orders = new ArrayList<>();
```

<span style="background-color:#DCFFE4">하이버네이트에서 컬렉션을 어떻게 관리를 한다는 말인가</span>  
강의만 듣고는 이해가 가지 않았는데, 저와 같은 고민을 한 글을 발견했습니다. 하이버네이트가 엔티티를 영속화할 때 내부에 컬렉션이 있으면 하이버네이트가 특별하게 조작한 컬렉션으로 변경한다고 합니다. 그래서 임의 수정시 하이버네이트가 인식을 하지 못해 제대로 동작할 수 없는 문제가 발생한다고 합니다.  
그럼 하이버네이트는 컬렉션을 어떻게 관리하는 걸까요?  
하이버네이트는 컬렉션을 효율적으로 관리하기 위해 엔티티를 영속 상태로 만들때 원본 컬렉션을 감싸고 있는 내장 컬렉션을 생성해서 내장 컬렉션을 사용하도록 참조를 변경합니다. ```PersistentBag```, ```PersistentList```, ```PersistentSet``` 등의 컬렉션 래퍼를 사용합니다. 이러한 컬렉션들은 일반적인 자바 컬렉션과 달리 데이터베이스와의 연동을 위한 추가적인 기능을 제공합니다. 예를 들어, ```PersistentBag```은 중복된 값을 허용하면서도 순서를 유지할 수 있도록 구현되어 있습니다. 또한, ```PersistentBag```은 데이터베이스와의 동기화를 위해 데이터베이스에서 필요한 데이터만 로딩하여 메모리를 효율적으로 사용할 수 있도록 최적화되어 있습니다.

**변경감지**  
변경감지를 이용하면, ```find()```로 entity를 가져오는 과정에서 영속성 컨텍스트에서 관리대상이 되기 때문에 별도의 ```save()``` 로직이 없어도 트랜잭션이 끝나는 시점에 ```Dirty Checking```을 진행합니다.
```java
private final EntityManager em;
Member m = em.find(Member.class, 1);
m.setName("John");
m.setAge(30);
```
```merge()```로 병합처리를 하는 경우에는 기존 값에서 변경된 값이 있을 때, 구분해서 들어가는 것이 아니라 모두 병합처리되어 ```null```로 받는 값이 있는 경우 ```null``` 처리되기 때문에 사용에 유의하는 것이 좋다.

**객체지향 설계를 위한 엔티티 연관 메서드 작성**  
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

****
[실전! 스프링 부트와 JPA 활용1 - 웹 애플리케이션 개발](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-JPA-%ED%99%9C%EC%9A%A9-1)  
[실전! 스프링 부트와 JPA 활용2 - API 개발과 성능 최적화](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-JPA-API%EA%B0%9C%EB%B0%9C-%EC%84%B1%EB%8A%A5%EC%B5%9C%EC%A0%81%ED%99%94)  
[필드에 있는 컬렉션을 초기화 시키는 이유가 뭔가요?](https://www.inflearn.com/questions/258175/%ED%95%84%EB%93%9C%EC%97%90-%EC%9E%88%EB%8A%94-%EC%BB%AC%EB%A0%89%EC%85%98%EC%9D%84-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%8B%9C%ED%82%A4%EB%8A%94-%EC%9D%B4%EC%9C%A0%EA%B0%80-%EB%AD%94%EA%B0%80%EC%9A%94)  
[PersistentBag](https://docs.jboss.org/hibernate/orm/3.5/javadocs/org/hibernate/collection/PersistentBag.html)

<br><br>

## @Transactional
트랜잭션 관리를 위해 Spring Framework 2.0 이상의 버전에서 지원되는 어노테이션입니다. 메서드 레벨 또는 클래스 레벨에서 사용할 수 있으며, 해당 메서드 또는 클래스의 모든 public 메서드에 트랜잭션을 적용합니다.

<br>

**@Transactional의 작동방식**  
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

**@Transactional의 속성**
+ propagation(전파방식)
  + REQUIRED, REQUIRES_NEW, NESTED, SUPPORTS, MANDATORY, NOT_SUPPORTED, NEVER
+ isolation(격리수준)
  + READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
+ readonly(읽기 전용 여부)
+ timeout

<br>

**사용할 때 이것만큼은 고려하자!**

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

****
[@Transactional 바르게 알고 사용하기](https://medium.com/gdgsongdo/transactional-%EB%B0%94%EB%A5%B4%EA%B2%8C-%EC%95%8C%EA%B3%A0-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-7b0105eb5ed6)
[Spring Transaction Management: @Transactional In-Depth](https://www.marcobehler.com/guides/spring-transaction-management-transactional-in-depth)

<br><br>

## Lombok
**@ToString**  
클래스의 toString 메서드를 자동으로 생성해주고 싶을 때 사용됩니다. ```@ToString(of={"ID", "NAME"}, includeFieldNames = false)```와 같이 컬럼을 지정하는 방식으로 사용되기도 하고, 각 컬럼 위에 ```@ToString.Include``` 또는 ```@ToString.Exclude```를 사용해서 컬럼별로 지정이 가능합니다.
```java
@Entity
@ToString(of={"ID, NAME"})
public class Person {
    long id;
    String name;
    int age;
}

// 다른 방식의 활용
@Entity
@ToString
public class Person {
  @ToString.Include  
  long id;
  @ToString.Include
  String name;
  @ToString.Exclude
  int age;
}
```
****
[Lombok 기본 사용법 익히기](https://advenoh.tistory.com/24)

  





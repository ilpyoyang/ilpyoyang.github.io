---
title: 백엔드 개발자 면접대비 질문정리 - Spring
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

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


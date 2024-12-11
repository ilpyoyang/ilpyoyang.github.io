---
title: JPAQueryFactory 설정 이슈
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, JPA]
tags: [Spring, JPA, 이슈]
pin: false
math: true
mermaid: true
---

### 이슈사항  
Spring Boot 3.x 버전에서는 javax가 아닌 ```jakarta persistence dependency```를 사용해야 합니다. 그래서 ```build.gradle```을 변경하고 EntityManager import를 변경 후에 ```JPAQueryFactory```에 등록했음에도 제대로 작동하지 않는 모습을 보게 되었습니다.  
여전히 ```JPAQueryFactory```는 javax entity만을 요구하는 이슈가 발생했습니다.

![20230612_192728.png](/assets/post_images/issue/20230612_192728.png)

<span style="background-color:#DCFFE4; margin-right:5px">왜 jakarta를 사용해야 하는지에 대하여</span>  
오라클 재단에서 이클립스로 ```JavaEE``` 기술 이전과 함께 기존에 사용하던 ```javax.*``` 대신 다른 명칭인 ```jakarta.*```를 사용하는 ```JakartaEE```가 반영된 Spring boot가 릴리즈되었기 때문입니다.

### 해결방법  
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

### 결과  
```jakarta.persistence.EntityManager```로도 ```JPAQueryFactory``` 빈 주입 및 생성에 문제가 없음을 확인했습니다. InitDB test도 통과했습니다!
정상적인 작동을 확인한 뒤에 코드를 살펴보면 java 파일은 ```javax```를 여전히 요구하고 있지만 class 파일 생성시에 ```jakarta``` 타입의 EntityManager로 받는 것을 알 수 있습니다.

![20230613_150127.png](/assets/post_images/issue/20230613_150127.png)

---
[스프링 부트 3.0 으로 전환](https://post.dooray.io/we-dooray/tech-insight-ko/back-end/4173/)  
[spring boot 3.0](https://github.com/querydsl/querydsl/issues/3493)  
[Intellij keeps old dependencies](https://youtrack.jetbrains.com/issue/IDEA-255594/Intellij-keeps-old-dependencies)

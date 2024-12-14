---
title: contextLoads() FAILED
author: ilpyo
date: 2024-12-10 11:33:00 +0900
categories: [Spring]
tags: [이슈]
pin: false
math: true
mermaid: true
---

### 문제발생 
로컬에서는 문제가 없었는데 Github Action pr test를 통과하지 못하는 상황이 발생했습니다. 당시 pr에 많은 기능의 commit이 있어서 하나씩 살펴봤지만 test가 성공하지 못하는 이유를 알지 못해서 팀원들과 같이 논의하면서 해결하게 되었습니다. 

![20231003_150719.png](/assets/post_images/spring/20231003_150719.png)



### 문제원인 파악하기 
properties가 잘 매핑되지 않았기 때문에 나는 에러였고 ```.env```, ```application.yml``` 등 mapping 파일들을 살펴보게 되었습니다.
```
DevMingleApplicationTest > contextLoads() FAILED
    java.lang.IllegalStateException at DefaultCacheAwareContextLoaderDelegate.java:143
        Caused by: org.springframework.beans.factory.BeanCreationException at AutowiredAnnotationBeanPostProcessor.java:489
            Caused by: java.lang.IllegalArgumentException at PropertyPlaceholderHelper.java:18### *
OpenJDK 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
2### *23-1### *-### *3T### *4:55:### *5.188Z  INFO 192### * --- [ionShutdownHook] j.LocalContainerEntityManagerFactoryBean : Closing JPA EntityManagerFactory for persistence unit 'default'
```



### 해결방안 
팀 회의 때 같이 살펴본 결과 test에 있는 ```application.yml```에 ```include```처리로 다른 mapping 파일을 추가하지 않아 발생한 문제였습니다.  
결과적으로 새로 이번에 commit하면서 생성된 ```valid``` mapping을 추가하므로서 해결할 수 있었습니다.
```yml
spring:
  profiles:
    include: auth, valid
```



### 추가 고찰하기 
Github action에 test를 통과하는지 살펴보기 위해서는 test 코드 빌드여부를 확인해야 하고, 그 과정에서 속성값 매핑이 제대로 되는지 확인해야 합니다.
알고보니 사실 간단한 솔루션이었지만 이 글을 남기는 이유는 간단해도 기억하지 못하거나 경험하지 않았을 때, 간과할 수 있는 부분이라 생각이 들었기 때문입니다.
그리고 저 혼자 보이지 않던 부분을 팀원들과 해결할 수 있어서 뿌듯했습니다 :)




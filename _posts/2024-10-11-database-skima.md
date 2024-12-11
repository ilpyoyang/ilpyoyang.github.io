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

JPA는 데이터베이스를 자동으로 생성해주도록 ```ddl-auto``` 옵션을 설정할 수 있습니다. 옵션의 종류는 ```create```, ```create-drop```, ```update```, ```none```, ```validate``` 종류가 있습니다. 주로 개발환경이나 테스트 서버에서는 ```update```를 사용해야 하고 실서버에서는 절대 사용하면 안됩니다. 주로 운영서버에서는 ```validate```나 ```none```을 사용합니다. ```validate```는 엔티티와 테이블이 정상 매핑되었는지만 확인합니다. ```none```이라는 개념은 실제 없고, 주석처리하는 것과 동일한 효과를 갖습니다.
```yml
jpa:
  hibernate:
    ddl-auto: create
```
<span style="background-color:#DCFFE4">DDL 생성기능은 DDL을 자동 생성할 때만 사용되고 JPA의 실행로직에는 영향을 주지 않습니다.</span> 즉 ```validation``` 용도로 사용하기에 좋습니다.

  

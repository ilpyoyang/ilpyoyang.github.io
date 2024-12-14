---
title: Password 사용자 정의 어노테이션 생성과 yml 속성 mapping error 해결하기
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Spring]
tags: [이슈]
pin: false
math: true
mermaid: true
---

### 문제발생 
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



### 문제원인 파악하기### 
1. .yml 값 등록이 바르게 들어오는 것을 확인했습니다.
2. PasswordValidator 클래스는 @Component 설정된 상태입니다.
3. 에러 디버깅 ```YamlProcessor``` 찍어보기



### 해결방안 
```YamlProcessor```에서 찍어봤을 때, key 값이 null이고 value는 제대로 들어오는 것을 확인할 수 있었습니다. 
value 값의 문자열 처리 이후에도 문제가 발생해서 디버깅 해본 결과, yml 파일에 key 값으로 설정할 수 없는 예약어 ```null```이 사용된 것을 알 수 있었습니다.
yml에서 사용할 수 없는 예약어로는 ```y```,```yes```,```n```,```no```,```true```,```false```,```null```,```~``` 등이 있습니다.



### 추가 고찰하기 
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





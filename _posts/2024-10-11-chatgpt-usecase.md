---
title: 개발자가 ChatGPT를 이용하는 다양한 방법들
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Tool]
tags: [ChatGPT]
pin: false
math: true
mermaid: true
---

ChatGPT가 나타나고 나서부터는 이제 구글링 대신 이용하는 비율이 점점 높아지고 있습니다. 물론 아직도 에러나 새로운 기술, 로직 구현에 대한 다양한 방법을 보기에는 블로그 글들이 더 유용할 때가 많습니다. 하지만 개발 과정에서 발생하는 문제에 대한 해답을 빠르게 찾기에는  정말 좋은 툴이 아닌가 싶습니다.  
이 포스팅에서는 생산성을 더 높일 수 있는 개발 프롬프트 작성 방법에 대해 알아보고자 합니다.

#### 혼자하는 코드리뷰  
코드리뷰 문화는 기업에서 개발팀끼리 코드를 보면서 개선사항이나 가독성, 성능을 높이기 위해 진행됩니다. 실제 코드리뷰를 적용해보고 싶을 때 또는 로직을 개선하고 싶을 때 사용할 수 있습니다.
```
Review the following Java code for code smells and suggest improvements
```

#### 리펙토링  
코드 개선을 위해 리펙토링도 적용가능합니다. 당연히 ChatGPT의 정확성이 100%가 아님으로 수정 후에는 테스트를 진행하는 것이 바람직합니다.
```
Refactor the given Java code to improve performance
```

#### 검색 엔진 최적화 (SEO, Search Engine Optimization)  
SEO는 검색 엔진에서 웹사이트를 검색할 때 노출되는 순서를 높이기 위한 방법입니다. 최적화를 통해 검색 엔진에서 노출되는 순서를 높여 더 많은 방문자를 유치하고, 이를 통해 비즈니스 성과를 향상시킬 수 있습니다.
```
How to improve SEO for a landing page?
```
백엔드에서도 검색 엔진 최적화를 위해서는 URL에 키워드를 등록하고, 간결하고 의미있는 URL의 사용, 하이픈(-) 처리, URL 매개변수 사용 지양하는 것을 고려할 수 있습니다.

#### API 명세처리  
Swagger와 같은 명세 처리를 위한 툴을 사용할 경우 적절하게 코드에 Swagger를 위한 코드를 추가해야 합니다. ChatGPT를 이용하면 설정을 쉽게 해줄 수 있습니다.

Prompt
```
Add Swagger code in below code

@DeleteMapping("/")
public ResponseEntity<ApiResponse> deleteUser(Principal principal) {
    String email = principal.getName();
    Users user = usersRepository.findByEmail(email);
    user.setStatus("Deleted");
    return responseBuilder(true, HttpStatus.OK);
  }
}
```

After ChatGPT
```java
@DeleteMapping("/")
@ApiOperation(value = "Delete User", notes = "Deletes the user and updates the status to 'Deleted'")
@ApiResponses(value = {
        @ApiResponse(code = 200, message = "User deleted successfully"),
        @ApiResponse(code = 401, message = "Unauthorized"),
        @ApiResponse(code = 500, message = "Internal server error")
})
public ResponseEntity<ApiResponse> deleteUser(Principal principal) {
    String email = principal.getName();
    Users user = usersRepository.findByEmail(email);
    user.setStatus("Deleted");
    return responseBuilder(true, HttpStatus.OK);
}

```

#### 메서드별 표준 주석 작성
메서드별 협업을 위해 표준 주석을 간단하게 달 경우가 있습니다. 팀 내 컨벤션에 따라 달라지겠지만, 간단하게 ChatGPT에게 원하는 주석을 요청할 수 있습니다. 위에서 사용한 코드를 사용해서 주석을 만들어보겠습니다.

Prompt
```
Provide brief standard comments for each method as a title.
```

Result
```
/**
 * Deletes the user and updates the status to 'Deleted'.
 * /
```

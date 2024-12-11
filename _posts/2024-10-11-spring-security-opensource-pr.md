---
title: Spring Security 오픈소스에 기여하기
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, Spring Security]
tags: [오픈소스, Spring Security, 스터디]
pin: false
math: true
mermaid: true
---

Issue : [ConcurrentSessionFilter breaks permitAll endpoint on session expiration](https://github.com/spring-projects/spring-security/issues/14077)   
PR : [Add ContinueRequestSessionInformationExpiredStrategy](https://github.com/spring-projects/spring-security/pull/14765)

##### 들어가며
작년 오픈소스 스터디 때 [Spring-batch 오픈소스에 기여하기](https://ilpyo-yang.github.io/backend/2023/04/14/Spring.html#-spring-batch-오픈소스에-기여하기)로 컨트리뷰터가 될 수 있었습니다.
그 이후에도 기여를 해야지라고 다짐했지만 결국 두 번째 스터디에 참여해서야 Spring-Security PR을 올리게 되었습니다.

##### 오픈소스 분석 및 해결방안
이슈 자체는 동시접속을 관리하는 ConcurrentSessionFilter에서 session 관리를 하고 있는데, 여기서 session이 만료된 경우에 대해서는 별도 처리없이 early return 처리를 해버리기 때문에 이후의 filter 처리가 이뤄지지 않는다는 문제였습니다. 
여기서 문제를 해결하기 위해 메인테이너가 방향성을 제시해 놓은 이슈였기 때문에 쉽게 접근할 수 있었습니다.  
```java
static class ContinueRequestSessionInformationExpiredStrategy implements SessionInformationExpiredStrategy {
	@Override
	public void onExpiredSessionDetected(SessionInformationExpiredEvent event) throws ServletException, IOException {
		event.getFilterChain().doFilter(event.getRequest(), event.getResponse());
	}
}
```
구현시 고민한 부분은 `ContinueRequestSessionInformationExpiredStrategy`를 생성해서 default 전략으로 가지고 가야하는 부분인가 아니면 사용자 입맛에 맞는 전략으로 알아서 넣을 수 있게 하느냐의 문제였습니다. 
기존의 세션 전략으로는 `ResponseBodySessionInformationExpiredStrategy`를 사용하고 있는데 단순히 세션 만료를 return하는 전략이었습니다.
일단 PR 자체는 메인테이너 제시 코드를 하나의 클래스로 별도로 만들어서 다른 전략처럼 선택할 수 있게 그리고 그걸로 ConcurrentSessionFilter 세팅하는 방식으로 적용했습니다. 
default 처리를 할 수도 있었지만 세션 종료 후 이어지는 필터를 수행하는 것이 오히려 불필요한 과정이 될 수도 있을 것이라는 생각이었습니다. 현재 이 부분은 메인테이너와 조율하면서 변경할 가능성이 있습니다. 

##### 스터디 회고
저번 스터디는 1달동안 하는거라서 약간 중간중간 나태해졌던 것 같은데 이번에는 1주일 동안 이슈를 정하고 하루 날 잡아서 2시간 안에 PR올리기를 했더니 더 몰입해서 할 수 있었던 점이 좋았습니다. 그리고 이전에 Spring security in Action을 책으로 보면서 공부할 때는
약간 지루할 때도 있었는데 오히려 실제 코드를 보면서 접하니까 더 이해가 빠르게 되었습니다.

##### [오픈소스 기여 성공](https://github.com/spring-projects/spring-security/pull/14765)
오픈소스 기여를 올해 3월에 했는데 메인테이너 검토 후 최근에 거의 반 년만에 issue가 클로즈 되었습니다. 너무 오래 전에 한 것 같아 기억이 잘 나지 않을 정도지만 직접 사용하는 Spring Security에 무언가 하나 도움이 되었다는 부분에서 뿌듯했습니다. 
지난번 Spring Batch 기여에 이어서 Spring Security까지 기여할 수 있다는게 신기했고 나중에는 Spring 오픈소스에도 기여할 정도의 실력을 갖춰 도전해보고 싶어졌습니다.

<img src="/assets/post_images/spring/opensource-study-result2.png"/>






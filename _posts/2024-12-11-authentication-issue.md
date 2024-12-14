---
title: 암호화와 authentication 이슈
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Spring]
tags: [이슈]
pin: false
math: true
mermaid: true
---

### 이슈사항  
Spring security 설정으로 ```defaultSuccessUrl```로 잘 이동하는 것처럼 보였으나 실제로 ```SecurityContextHolder```에 제대로 authentication이 등록되지 않아서 뷰단에서 thymeleaf ```sec:authorize``` 설정이 제대로 되지 않는 문제가 발생했습니다. 해결방법은 간단했지만 당시에 별다른 에러 문구가 없어 고민한 부분들을 정리하는 방식으로 작성했습니다.

 

### 시도한 방법들  
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

 

### 해결방안  
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

 

### 추가 고찰  
이전 프로젝트에서는 Spring security에서 별도의 인증제공자를 빈으로 주입하지 않아도 작동했었는데, 오래된 버전이라서 ```WebSecurityConfigurerAdapter```를 통한 override 방식의 구현이었다는 점이 가장 큰 차이였습니다.
version 5.4 이후부터는 ```component-based``` 방식으로 접근하기 때문에 달라진 부분이 있습니다. filterChain 방식의 구현과 필요한 논리부를 빈 또는 컴포넌트화해서 사용합니다.  
그럼에도 불구하고 이번 이슈는 단순히 ```WebSecurityConfigurerAdapter```가 deprecated 되었기 때문이라고만은 볼 수 없었습니다.

![20230706_194429.png](/assets/post_images/issue/20230706_194429.png)

여기서 보면, AuthenticationManager로서 ```ProviderManager```는 ```DaoAuthenticationProvider```를 default 값으로 제공하고 있는 것을 알 수 있습니다. 하지만 위 해결방안에서 @Bean 주입 이후 ```DaoAuthenticationProvider```의 authentication 과정이 제대로 작동하는 것을 볼 수 있었습니다.

 

 ###결과  
authenication 과정이 제대로 작동하는 것을 볼 수 있었고, 뷰단에서 securityContext에 따른 ```sec:authorize```가 잘 작동해 로그인한 경우에는 로그아웃 버튼이 보이게 동작하는 것을 확인할 수 있었습니다.





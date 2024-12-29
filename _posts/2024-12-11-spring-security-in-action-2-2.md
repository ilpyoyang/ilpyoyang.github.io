---
title: Spring Security in Action - 2부. 구현(8~14장)
author: ilpyo
date: 2024-12-10 11:33:00 +0900
categories: [Spring, Spring Security]
tags: [Spring Security in Action, 스터디]
pin: false
math: true
mermaid: true
---

### 8장. 권한 부여 구성: 제한 적용
선택기 메서드로 엔드포인트 선택  
스프링 시큐리티에서 제공하는 선택기 메서드는 MVC 선택기, 앤트 선택기, 정규식 선택기가 있습니다.

> 이용하는 선택기가 어떤 것이지도 모르고 하는 복사-붙여넣기 프로그래밍의 위험한 접근법을 초보 개발자가 너무 자주 이용합니다.   
> 어떻게 작동하는지 이해하기 전에는 이용하지 말아야 합니다!

#### MVC 선택기
책에서는 앤트 선택기보다 MVC 선택을 권장했는데, 매핑으로 인한 위험을 방지하기 위함입니다.
```java
http.authorizeRequests()
        .mvcMatchers(HttpMethod.Post, "/hello").authenticated()
        // 길이와 관계없이 숫자를 포함하는 문자열을 나타내는 정규식
        .mvcMatchers("/reg/{code:^[0-9]*$*}").permitAll()
        .anyRequest().authenticated();
```

#### 앤트 선택기
MVC 선택기와 달리 스프링 MVC의 작동을 고려하는 것이 아닌 방식으로 /hello 경로의 엔드포인트를 설정한다고 했을 때, /hello/ 경로는 보호되지 않습니다. 즉 확실한 경로 설정이 필요합니다.
```java
http.authorizeRequests()
        .antMatchers("/hello/#### ").hasRole("ADMIN")
        .anyRequest().authenticated();        
```

#### 정규식 선택기
[온라인 정규식 선택기](https://regexr.com)  
MVC와 엔트 식으로 해결할 수 없는 경우에 이용하는 것이 좋습니다.
```java
http.authorizeRequests()
        .regexMatchers(".*/(kr|ca)+/(en).#### ").authenticated()
        .anyRequest().authenticated();        
```
잘못된 자격 증명으로 엔드포인트를 호출하면 권한이 있더라도 인증 필터에서 먼저 인증이 실패하는 경우 권한부여 필터까지 가지 않고 응답 상태 ```HTTP 401 Unauthorized```를 반환합니다.

스프링 시큐리티를 기본적으로 CSRF(사이트 간 요청 위조)에 대한 보호를 적용하는데 모든 엔드포인트 호출을 위해 비활성화할 수 있습니다.
```java
http.csrf().disable();
```



### 9장. 필터 구현
스프링 시큐리티가 제공하는 필터 BasicAuthenticationFilter 외의 맞춤형 필터 체인을 추가할 수 있습니다. 권한필터 전 이벤트나 로깅필터 구축이 가능해집니다.
스프링에서 제공하는 필터 간에는 순서가 이미 정해져 있습니다. ```CorsFilter``` → ```CsrfFilter``` → ```BasicAuthenticationFilter``` 순입니다.

#### 맞춤형 필터 구현####
```java
public class RequestVaildationFilter implements Filter {
	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {  
		var httpRequest = (HttpServletRequest) request;
		var httpResponse = (HttpServletResponse) response;
		String requestId = httpRequest.getHeader("Request_id");

		if(requestId.isBlank){
			httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		filterChain.doFilter(request, response);
	}
}
```

#### 맞춤형 필터 순서 지정
이렇게 ```addFilterBefore```를 사용하면, BasicAuthenticationFilter 전에 RequestVaildationFilter를 사용할 수 있 됩니다.   
인증 통과를 기록하는 필터를 만든다고 한다면 BasicAuthenticationFilter 뒤에 배치할 수 있도록 ```addFilterAfter```를 사용할 수 있습니다.
```java
http.addFilterBefore(
	new RequestVaildationFilter(),
	BasicAuthenticationFilter.class)
	.authorizeRequests().anyRequest().permitAll();
)
```

그렇다면 다른 필터 위치에 필터를 추가하려면 어떻게 해야할까?  
BasicAuthenticationFilter에 배치하려면 ```addFilterAt```를 사용할 수 있습니다. 이는 필터 대체가 아닌 추가적인 개념으로 봐야합니다.

이런 경우의 시나리오에 대해서 책에서는 다음 세 가지 사례를 들고 있습니다.
+ 인증은 위한 정적 헤더 값에 기반을 둔 식별
  + 암호화 서명이 아닌 단순한 문자열 제공으로 인증하는 경우
+ 대칭 키를 이용해 인증 요청 서명
  + 클라이언트와 서버가 키를 공유하는 경우
+ 인증 프로세스에 OTP 이용
  + 타가 인증 서버에서 OTP를 얻어서 애플리케이션 다단계 인증을 사용하는 경우

> 실제 시나리오에서 세부 정보를 저장할 때는 비밀 볼트를 이용해야 합니다.

UserDetailsService 구성을 비활성화 하기 위해서 ```exclude``` 특성을 이용할 수 있습니다.
```java
@SpringBootApplication(exclude={UserDetailsServiceAutoConfiguration.class})
```

#### OncePerRequestFilter
스프링 시큐리트에서 제공하는 필터를 이용하는 것도 좋지만 최대한 간단하게 구현할 수 있는 방법이 있다면 그냥 확장하는 것을 피해야 합니다. 같은 요청에 한 번의 필터 호출을 위해 OncePerRequestFilter 클래스를 이용해 필터를 구현하는 것이 권장됩니다.

OncePerRequestFilter는 형식을 형변환하여 HttpServletReqeust 및 HttpServletResponse로 직접 요청을 수신합니다.  필터에서 요청 및 응답을 직접 조작할 수 있으므로 필요한 작업을 수행할 수 있습니다. 이러한 객체를 직접 사용하면 필터에서 외부 라이브러리나 서비스에 의존하지 않아도 되므로 독립성과 유연성을 높여줍니다.  
기본적으로 비동기 요청이나 오류 발송 요청에는 적용되지 않습니다. 하지만 메서드 재정의로 가능하게 할 수 있습니다. 필터가 적용될지 여부도 메서드 재정의로 정할 수 있습니다.


### 10장. CSRF 보호와 CORS 적용
#### CSRF(사이트 간 요청 위조) 보호 적용
POST, PUT, DELETE를 비롯한 변경 호출 페이지는 응답으로 CSRF 토큰을 받고 다음 호출에 사용해야 합니다. 여기서 CSRF 공격은 사용자가 악성 스크립트가 있는 페이지를 열었을 때, 사용자 대신 작업을 수행하게 됩니다.

```CsrfFilter```를 통해 발급되는데, 이 필터는 GET, HEAD, TRACE, OPTIONS를 사용한 HTTP 방식의 요청을 모두 허용하고 CSRF 토큰을 담아서 응답합니다.
POST, PUT, DELETE 의 엔드포인트에서 개발을 하기 위해서는 CSRT 보호 활성화된 경우 토큰이 필요한데, ```_csrf``` 특성에 추가되어 있기 때문에 이를 응답 또는 thymeleaf를 이용해 출력합니다.

CSRF 보호는 브라우저에서 실행되는 웹 앱에 사용되며, 로그인과 같이 앱 내에서 수행하는 변경되는 작업이 없는 경우를 제외합니다.
그리고 같은 서버가 프런트와 백을 담당하는 아키텍처에서는 잘 작동하지만 솔루션이 독립적일 때는 그에 따른 보안 접근법(11~15장)을 고려해야 합니다.

Spring security는 기본적으로 CSRF 보호를 지원하는데, 서버에서 생성된 리소스를 이용하는 페이지가 같은 서버에서 생성된 경우에만 이용합니다.

그럼 모든 경로가 아니라 일부 경로에만 보호를 설정하려면 어떻게 해야 할까?
CSRF 보호를 아래 코드 처럼 ```disable``` 처리하는 것이 아니라 제공되는  handler와 matcher들 이용해서 보호 제외 경로를 지정할 수 있습니다.
```
http.httpBasic(HttpBasicConfigurer::disable)  
	.csrf(CsrfConfigurer::disable)
```

서버 쪽 세션에 csrf 토큰을 저장하는 것은 수평적 확장에서 적합하지 않습니다.
데이터베이스에서 토큰을 관리하는 방식으로 전환하기 위해서는 ```CsrfTokenRepository```를 새로 구현해서 세션 ID를 이용해 관리할 수 있습니다.
```CsrtTokenRepository``` 구현체를 만들면 override된 ```generateToken()```과 ```saveToken()```, ```loadToken()``` 메서드를 구현해서 사용하게 됩니다.
다른 대안으로는 토큰의 만료시간을 정해서 관리하는 방법도 있습니다.

#### CORS(교차 출처 리소스 공유) 이용
CORS는 일부 조건에서 서로 다른 출처 간 요청을 허용합니다. 예를 들어 ```domain.com```에서 ```domain2.com```에서 ```domain.com```의 REST 엔드포인트를 호출한다고 할 때, 호출은 거부됩니다. CORS를 이용하면 이런 문제를 해결할 수 있습니다.

+ ```Access-Control-Allow-Origin``` 접근 가능한 외부 도메인 지정
+ ```Access-Control-Allow-Methods``` 다른 도메인에 대한 접근은 허용하지만 특정 엔드포인트만 허용
+ ```Access-Control-Allow-Headers``` 특정 요청에 이용할 수 있는 헤더에 제한을 추가

CSRF와 개념을 헷갈리지 말아야하는데 CORS는 교차 도메인 호출을 완화해주는 개념이고 브라우저에 관한 것이며 엔드포인트를 보호하는 방법은 아닙니다. CSRF 보흐는 공격을 막는 개념입니다.

HTTP OPTIONS 방식으로 사전 테스트 요청을 하는 경우가 있습니다. 이 요청이 실패하면 브라우저는 원래 요청을 수락하지 않습니다.

CSRF의 정책은 ```@CrossOrigin```으로 적용할 수 있습니다. 다음과 같이 메서드 위에 적용하면 해당 메서드는 localhost 출처에 대한 교차 출처 요청을 허용하게 됩니다. 이 때 ```*```로 넓은 범위의 출처를 허용하는 경우는 XXS(교차 사이트 스크립팅) 요청에 노출되어 DDoS 공격에 취약해질 수 있습니다.
```
@CrossOrigin("http://localhost:8080")
```

하지만 개별 관리를 이런 식으로 하게 되면, 관리가 어렵기 때문에 Security Config에 ```CorsConfigurationSource```를 정의해서 허용할 출처와 메서드를 지정해서 ```cors()```에 적용할 수 있습니다.


### 11장. 실전: 책임의 분리
#### 인증논리
OTP 토큰 인증을 어떻게 처리할 것인가에 대해 그 순서를 책에서 제시한 순서대로 표기하면 다음과 같습니다.
1. 클라이언트가 엔드포인트와 함께 자격증명을 보냅니다.
2. 그럼 비즈니스 논리 서버는 인증서버에서 사용자를 인증하고 OTP를 보냅니다.
3. 여기서 인증서버는 데이터베이스에서 사용자를 인증합니다.
4. 그리고 OTP를 클라이언트에 보냅니다.

비지니스 논리서버와 인증서버가 서로 OTP를 주고 받는 건 잘못 됐다고 할 수 있지만 책에서는 설명을 위해 쉬운 구현 예시를 들어 설명하기 위해 이렇게 설정했다고 합니다.

#### 토큰
엔드포인트 접근을 위해 헤더에 토큰(UUID 혹은 JWT 등)이라는 문자열을 넣어서 인증하게 됩니다.  그리고 애플리케이션 리소스에 접근할 수 있습니다.
+ 요청시마다 자격 증명 공유할 필요가 없습니다.
+ 수명을 지정해 관리할 수 있습니다.
+ 토큰에 세부정보를 저장할 수 있습니다.

JWT(JSON Web Token)  
JSON 데이터 형식을 포함하는 토큰을 말합니다. 마침표로 분리된 헤더, 본문, 서명의 세 개 Base64 인코딩으로 구성됩니다.  자바에서는 JJWT 라이브러리를 지원해 JWT 토큰 생성을 쉽게 할 수 있도록 지원합니다.
[JJWT github overview](https://github.com/jwtk/jjwt#overview)에서 사용법, ```builder()``` 처리, ```claims```, ```parser()```, key 처리 방법에 대해 알 수 있습니다.



### 12장. OAuth 2가 작동하는 방법
OAuth 2는 권한 부여 프레임워크라고도 하며, 위임 프로토콜이라고도 합니다.  
HTTP Basic에서는 인증방식에서 모든 요청에 자격증명을 보내야 하고 별도 시스템이 관리해야하는 문제가 발생합니다. 이 뜻은 즉 네트워크에 자격증명이 자주 공유되고 보안에 취약해집니다.

OAuth 2는 리소스 서버, 사용자, 클라이언트, 권한 부여 서버로 구성됩니다. 리소스 소유자는 애플리케이션에 요청을 보내고 권한 부여 서버에서 데이터 작업 승인을 받았다는 증명을 제공 받습니다. 그리고 이 증명을 리소스 서버에 넘겨 클라이언트가 데이터를 이용할 수 있도록 합니다.  
권한 부여 서버는 클라이언트에 액세스 토큰을 제공할 때 리디렉션 URI로 클라이언트를 호출합니다.
```
사용자 - 클라이언트 - 권한 부여 서버 - 리소스 서버
```

OAuth 2 그랜트 유형  
OAuth 2에서 그랜트 유형은 가장 많이 사용되는 유형으로 흐름은 다음과 같습니다.

#### 승인 코드 그랜트 유형
+ 승인 코드 그랜트 유형으로 인증 요청 수행
  + 사용자는 엔드포인트를 ````response_type````, ```client_id```, ```redirect_uri```, ```scope```, ```state```가 담긴 쿼리로 호출합니다.
  + 인증 성공시 리다이렉트 URI로 클라이언트를 호출하고 코드와 상태값을 제공합니다.
+ 승인 코드 그랜트 유형으로 액세스 토큰 얻기
  + 승인 코드를 가지고 인증 서버에서 토크를 받습니다.
  + 이 때 요청에는 ```code```, ```client_id```, ```client_secret```, ```redict_uri```, ```grant_type```과 같은 세부정보가 들어있습니다.
+ 승인 코드 그랜트 유형으로 보호된 리소스 호출

#### 암호 그랜트 유형
승인 코드 그랜트 유형과 달리 클라이언트와 권한 부여 서버를 같은 조직에서 구축한 경우에 이용합니다. 거의 유사하지만 승인 코드를 받는 과정 없이 클라이언트는 ```grant_type```, ```client_id```, ```client_secret```, ```scope```, ```username```, ```password```가 담긴 세부정보를 보내고 액세스 토큰을 받습니다. 그리고 이 토큰으로 리소스를 호출합니다.
즉, 리소스 소유자가 클라이언트를 신뢰할 수 있는 환경에서 가능합니다.

#### 클라이언트 자격 증명 그랜트 유형
여기서는 사용자가 관여하지 않고, 두 애플리케이션 간 인증을 구현하는 방식을 말합니다. ```grant_type```, ```client_id```, ```client_secret```, ```scope```를 가지고 권한 부여 서버에 요청을 보낸 뒤, 액세스 토큰을 받아 리소스 서버에 호출하는 방식입니다.

#### 갱신토큰을 이용하기
암호 그랜트 유형은 사용자에게 재인증 요청을 하거나 자격증명을 저장해야 합니다. 반면 갱신 토큰이 있다면, 보안 위험이 줄어들고 권한 부여 서버에서 엑세스 토큰과 함께 같이 반환됩니다.  
클라이언트 자격 증명 그랜트 유형에서는 불필요한데, 사용자 자격증명이 필요하지 않기 때문입니다.

OAuth 2는 프레임워크이므로 기능을 알고 제대로 구현해야 애플리케이션 취약성을 완화할 수 있습니다.

#### 간단한 SSO(Single Sign-On) 애플리케이션 구현
권한부여 서버를 깃허브를 이용해 승인 코드 그랜트 유형을 구현할 수 있습니다.

먼저 깃헙 OAuth application을 등록해야 합니다.

종속성 추가
+ spring-boot-starter-oauth2-client
+ spring-boot-starter-security
+ spring-boot-starter-web

Security Config 설정에는 ```http.oauth2Login()```을 사용해 구현할 수 있습니다. ```formLogin()```처럼 필터체인에 OAuth2LoginAuthenticationFilter 새 인증 필터를 추가합니다.

ClientRegistration 인스턴스
```java
ClientRegistration cr = 
	ClientRegistration.withRegistrationId("github")
		.clientId("ae4a6f5a46fe6af5vs")
		.clientSecret("1f6sadf86a5wef364f51dcs8ae4615")
		.scope(new String[]("read:user"))
		.authorizationUri("https://github.com/login/oauth/authorize")
		.tokenUri("https://github.com/login/oauth/access_token")
		.userInfoUri("https://api.github.com/user")
		.userNameAttributeName("id")
		.clientName("Github")
		.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
		.redirectUriTemplate("{baseUrl}/{action}/oauth2/code/{registrationId}")
		.build();
```

이미 스프링 시큐리티에서는 ```withRegistrationId()```를 이용한 설정을 하지 않아도 설정할 수 있도록 일반적인 공급자에 대한 인증을 다음과 같이 ClientOAuth2Provider로 지원하고 있습니다.
```java
ClientRegistration cr = 
	ClientOAuth2Provider.GITHUB
		.getBuilder("github")
			.clientId("a4f6a5e3ws48d615a")
			.clientSecret("a1465eafw184651waf1aw4615waw")
			.build();
```

작성시점 왜 아직 [spring security doc](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)에서 아직 spring boot 2.x로 설명하고 있는지 모르겠지만....?! 이 책을 완독하고 spring boot 3.x 기준 oauth 2 설정 샘플 코드와 링크를 업데이트해야 겠다는 생각이 들었기에 우선 책 기준으로 설명하고 넘어가겠습니다;;

ClientRegistrationRepositroy 구현  
UserDetailsService와 유사하며, spring security에서는 ClientRegistrationRepositroy의 구현인 InMemoryClientRegistrationRepository를 제공합니다. 빈으로 등록하거나 ```oauth2login()``` 메서드의 매개변수로 Customizer 객체를 이용해서 등록할 수 있습니다.

#### 전체 SSO 애플리케이션 구현을 위한 순서는 다음과 같습니다.
1. OAuth application 등록하고, ```client_id```, ```client_secret``` 받아오기
2. 종속성 추가
3. Security Configuration으로 OAuth 2를 위한 필터 적용
4. ClientRegistration 인스턴스 구현
5. ClientRegistrationRepositroy 구현
6. OAuth2AuthenticationToken에서 인증 사용자의 세부 정보 얻어오기



### 13장. OAuth 2: 권한 부여 서버 구현
앞서 배운 OAuth 2 그랜트 유형에 따른 권한 부여 서버를 구현합니다. 일반적으로 웹 애플리케이션에서 깃헙, 구글 등 권한부여 서버를 이용하는 경우는 해당하지 않지만 직접 권한 부여 서버를 구현하는 경우에는 맞춤형으로 권한 부여 서버 구현이 가능합니다.
+ 승인코드 그랜트 유형
+ 암호 그랜트 유형
+ 클라이언트 자격 증명 그랜트 유형

현재 Spring security는 OAuth 2와 관련해서 로그인, 클라이언트, 리소스 서버와 관련된 기능을 제공합니다. [관련 Link](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)

책에서는 spring security oauth 2의 종속성 지원이 중단된 시점으로부터 맞춤형 권한 부여 서버를 구현하는 방법을 다루고 있습니다.  
(Keycloak, Okta와 같은 툴을 대안으로 선택할 수도 있습니다.)

#### 맟춤형 권한 부여 서버 구현
@EnableAuthorizationServer를 사용해 configuration을 권한 부여 서버 구성을 위한 준비를 합니다.   
권한 부여 서버도 자체 자격증명이 필요하기 때문에 사용자와 클라이언트에 대한 자격증명을 저장하고 클라이언트 자격증명이 등록된 경우에 한해서 권한을 부여합니다.

메모리에서 ClientDetails를 구성할 수 있습니다. 이는 UserDetailsService를 이용할 때와 유사한 기능을 제공하는데 실제로는 메모리가 아닌 데이터베이스를 이용해 구현하는 것이 바람직합니다.
```java
clients.inMemory()
	.withClient("client")
	.secret("secret")
	.authorizedGrantTypes("password")
	.scope("read");
```

승인 코드 그랜트 유형이 가능하게 하기 위해서는 클라이언트에 제공된 승인 코드를 이용해서 액세스 토큰을 얻을 수 있도록 해야 합니다. 즉 권한 부여 서버는 클라이언트에 리디렉션 URI와 승인코드를 반환할 수 있어야 합니다.

클라이언트는 모두 같은 자격증명으로 권한 부여 서버에서 엑세스 토큰을 얻을 수 없도록 구현하는 것이 바람직합니다. 그 이유는 하나의 토큰을 얻는 경우 다른 클라이언트도 모두 해킹할 수 있 위험이 있기 때문입니다.

갱신 토큰 유형을 이용해야 하는 경우에는 ```authorizedGrantTypes()```에 ```refresh_token``` 유형을 넣어주어야 합니다.



### 14장. OAuth 2: 리소스 서버 구현
사용자가 리소스 서버에 접근하려고 할 때, 리소스 서버는 사용자가 전달한 액세스 토큰이 올바른지 확인하는 과정을 거칩니다. 이 때 사용되는 토큰 검증 방식은 다양한데, 권한 부여 서버에서 검토하게 하는 방식, 리소스 서버의 데이터베이스 참조 방식, 토큰 서명을 이용하는 방식이 있습니다.

> 이 부분도 현재 spring security와 차이가 있어서(@EnableResourceServer 지원 중단 등) 큰 흐름만 집고 넘어가기로 했습니다.

#### 원격으로 검증
리소스 서버가 직접 권한 부여 서버를 호출하는 토큰 검증을 구현하는 경우가 있습니다. 리소스 서버는 클라이언트에게 받은 토큰을 권한 부여 서버에 전달하고 사용자 세부 정보를 얻습니다. 대신 새로운 토큰이 있을 때마다 권한 부여 서버를 항상 호출해야 한다는 단점이 있습니다.

#### 데이터베이스 참조방식
위 방식처럼 매번 권한 부여 서버에 접근할 필요는 사라졌지만, 공유 데이터베이스를 추가해야 하고 병목이 발생할 수 있다는 단점이 있습니다.   
인증 필터에서 HTTP 요청을 가로채고 이를 토큰 저장소(TokenStore)에서 토큰 검증 후 사용자 세부 정보를 검색합니다. 이 세부 정보는 보안 컨텍스트에 저장합니다.

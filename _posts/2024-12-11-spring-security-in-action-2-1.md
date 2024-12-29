---
title: Spring Security in Action - 2부. 구현(3~7장)
author: ilpyo
date: 2024-12-10 11:33:00 +0900
categories: [Spring, Spring Security]
tags: [Spring Security in Action, 스터디]
pin: false
math: true
mermaid: true
---

### 3장. 사용자 관리
3장은 ```User```, ```UserDetailService```, ```UserDetailManager```에 대한 내용을 다루고 있습니다. 사용자가 인증을 하는 과정에서 인증 논리에 따라 인증 제공자는 사용자를 인증하는 과정을 거치게 되는데 이 때, 메모리 User를 관리하는 체계에 대한 내용입니다.

#### UserDetils와 구현
사용자 기술을 위해서 스프링 시큐리티는 ```UserDetils``` 인터페이스를 구현하고 준수합니다. ```UserDetails```를 직접 클래스로 구현해도 되고, 사용에 따라 ```UserDetail```를 빌드해서 사용할 수 있습니다.
```UserDetails```는 하나 이상의 권한, password, username을 조회하거나 계정의 활성화 및 비활성화를 관리하는 메서드들을 가지고 있습니다. 계정의 관리는 기본적으로 ```true``` 처리를 하지만 별도 내부 서비스 방침에 따라 커즈터마이징해 구현할 수 있습니다.
```java
public interface UserDetails extends Serializable {
	Collection<? extends GrantedAuthority> getAuthorities();
	String getPassword();
	String getUsername();
	boolean isAccountNonExpired();
	boolean isAccountNonLocked();
	boolean isCredentialsNonExpired();
	boolean isEnabled();
}
```  
이렇게 ```UserDetails```를 하나의 클래스로 implements 해서 구현하는 방법도 있지만, ```UserDetailService```를 위해 제공되는 ```User``` 모델을 빌드할 수 있습니다. 이 모델도 ```UserDetails``` 구현체입니다.
이 경우 ```withUsername``` 메서드를 이용해 ```UserBuilder```를 만들어 ```UserDetiails``` 객체를 만들 수도 있습니다.
```java
UserDetails userDetails = User.withUsername(member.getEmail())
                            .password(member.getPassword())
                            .roles(member.getRole())
                            .build();
```



#### UserDetailService와 세 가지 UserDetailManager에 대하여
```UserDetailService```는 인증의 핵심이 되는 부분으로 인증 논리에서 메모리 내에서 User를 관리합니다. ```UserDetailService``` 인터페이스는 단 한 가지 메서드를 가지고 있는데 ```loadUserByUsername(String username)```를 가지고 Username에 해당하는 사용자가 있는지 메모리에서 확인합니다. 해당하는 사용자가 없다면, ```UsernameNotFoundException```로 ```RuntimeException```를 던집니다.
```java
public interface UserDetailsService {
	UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}
```
책에서 제시한 ```loadUserByUsername``` 구현의 예입니다. User들 중에서 username이 동일한 User만을 추출해 UserDetails로 리턴하는 것을 볼 수 있습니다.
```java
@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
  return Users.stream()
    .filter(u -> u.getUsername().equals(username))
    .findFirst()
    .orElseThrows(() -> new UsernameNotFoundException("User not found"));
}
```
```UserDetailManager```는 ```UserDetailService```의 기능을 확장하고 메서드를 추가합니다. ```UserDetailManager```의 구현클래스로 ```InMemoryUserDetailsManager```와 ```JdbcUserDetailsManager```를 제공하고 있습니다. 내부 메모리를 사용하는지 또는 SQL 데이터베이스에 저장된 사용자를 관리하며 JDBC를 통해 데이터베이스에 직접 연결하는지에 따라 다르게 사용됩니다.  
```LdapUserDetailsManager```도 제공하고 있지만 LDAP를 사용할 경우 [별도 dependency 설정](https://www.baeldung.com/spring-security-ldap)이 필요합니다.
```java
public interface UserDetailsManager extends UserDetailsService {
	void createUser(UserDetails user);
	void updateUser(UserDetails user);
	void deleteUser(String username);
	void changePassword(String oldPassword, String newPassword);
	boolean userExists(String username);
}
```
추가로 ```setUsersByUsernameQuery``` 등과 같이 ```JdbcUserDetailsManager```의 쿼리를 변경할 수 있으며 @Bean으로 ```UserDetailsService``` config로 등록할 수 있습니다.
```java
@Bean
public UserDetailsService userDetailsService(DataSource dataSource) {
    String usersByUsernameQuery = "select username, password, enabled from spring.users where username = ?";
    String authsByUserQuery = "select username, authority from spring.authorities where username = ?";
    var userDetailsManager = new JdbcUserDetailsManager(dataSource);
    userDetailsManager.setUsersByUsernameQuery(usersByUsernameQuery);
    userDetailsManager.setAuthoritiesByUsernameQuery(authsByUserQuery);
    return userDetailsManager;

}
```


### 4장. 암호처리
인증공급자가 제공한 password를 이용해서 ```PasswordEncorder```를 이용해서 암호를 검증합니다.
이 부분은 작성시점인 현재(2023-09)와 차이가 좀 있지만 프로세스를 이해하기 위한 것으로 책을 기반으로 서술하고자 합니다.

#### PasswordEncorder 인터페이스
````encode()````를 통해 암호화를 ```matches()```를 통해 인코딩된 문자열이 암호와 일치여부를 확인할 수 있습니다. ```upgradeEncoding(CharSequence encodedPassword)```는 기본값이 ````false````이지만 true 처리하는 경우 인코딩된 암호를 다시 인코딩하게 됩니다.

Spring security에서 제공하는 ```PasswordEncoder``` 구현 옵션들은 다음 옵션들이 있습니다. [각 해싱 알고리즘에 대한 설명](https://livebook.manning.com/book/real-world-cryptography/chapter-2/17)
+ NoOpPasswordEncoder
+ BCryptPasswordEncoder
+ Pbkdf2PasswordEncoder
+ SCryptPasswordEncoder
+ Argon2PasswordEncoder
+ DelegatingPasswordEncoder

#### NoOpPasswordEncoder
테스트나 이전 시스템과의 호환성을 위한 경우에만 사용되어야 합니다. 현재는 Deprecated 되었습니다.

#### BCryptPasswordEncoder####

```java
@Bean  
public BCryptPasswordEncoder passwordEncoder() {  
	return new BCryptPasswordEncoder(16);  
}
```

이렇게 인코딩 프로세스에 이용되는 로그 라운드를 나타내는 강도 계수를 지정할 수도 있습니다. 아래 예제에서 4는 강도 계수입니다. 이 값은 2의 4제곱 즉, 16번의 해싱 라운드를 의미합니다. b는 BCrypt에서 솔트(salt)를 생성할 때 사용됩니다.
```java
SecureRandom s = SecureRandom.getInstanceStrong();
PasswordEncoder p = new BCryptPasswordEncoder(4, s);
```


#### DelegatingPasswordEncoder
여러 해싱 전략을 유연하게 관리할 수 있게 도와줍니다. 접두사 ```{noop}```에 대해 NoOpasswordEncoder가, ````{bcrypt}````인 경우에는 BCryptPasswordEncoder, ```{scrypt}```이면, SCryptPasswordEncoder를 등록합니다.
스프링 시큐리티에는 DelegatingPasswordEncoder의 구현을 반환하는 정적 메서드를 제공합니다.
```java
PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
```
스프링 시큐리티에서 DelegatingPasswordEncoder를 기본적으로 사용하게 되면서, NoOpPasswordEncoder와 같은 deprecated된 PasswordEncoder를 포함하여 여러 전략을 지원하게 되었습니다. 이때, `NoOpPasswordEncoder`에 대한 deprecated 경고를 피하기 위해 `createDelegatingPasswordEncoder` 메서드에 `@SuppressWarnings("deprecation")`을 추가된 것을 볼 수 있습니다.



#### 그럼 비밀번호 암호화 외에는 어떻게 암호화를 구현할까요?
스프링 시큐리티 암호화 모듈(SSCM)에는 키 생성기와 암호기를 구현하는 대안이 있습니다.
```java
StringKeyGenerator keyGenerator = KeyGenerators.string();
String salt = keyGenertor.generateKey();


BytesKeyGenertor keyGenerator = KeyGenerators.secureRandom(16);

BytesKeyGenertor keyGenerator = KeyGenerators.shared(16);
```
암호기는 암호화 알고리즘을 구현하는 객체입니다. BytesEncryptor와 TextEncryptor라는 암호기가 있고 각각은 다른 데이터 형식을 처리합니다. BytesEncryptor가 문자열로 출력을 반환하는 반면, TextEncryptor는 더 범용적이고 바이트 배열로 입력 데이터를 받습니다.
```java
BytesEncryptor e = Encryptors.stronger(password, salt);
```
TextEncryptor는 ```Encryptors.text()```, ```Encryptors.delux()```, ```Encryptors.queryableText()```의 세 가지 주요 형식을 가지고 있습니다. ```Encryptors.text()```, ```Encryptors.delux()```는 ```encrypt()``` 메서드를 반복 호출해도 다른 출력이 반환되는데, 초기화 벡터가 생성되기 때문입니다.
```Encryptors.queryableText()```는 쿼리 가능 텍스트로 입력이 같으면 같은 출력을 반환하는 것을 보장합니다.
```java
TextEncryptor e = Encryptors.queryableText(password, salt);
String encrypted = e.encrypt(valueToEncrypt);
```


### 5장. 인증 구현

+ 맞춤형 AuthenticationProvider로 인증 논리 구현
+ HTTP Basic 및 양식 기반 로그인 인증 메서드 이용
+ SecurityContext 구성 요소의 이해 및 관리

인증 필터가 가로챈 요청을 그리고 그 인증 책임을 인증 관리자에 위임합니다. 그리고 인증 공급자에서 확인한 인증 결과는 보안 컨텍스트(SecurityContext)에 저장됩니다.

~~#### AuthenticationProvider의 이해#### ~~  
Authentication 계약인 Principal 계약을 상속하는데 Authentication에서는 암호같은 요구 사항이나 인증 요청에 대한 세부 정보를 추가할 수 있습니다. 이는 자바 시큐리티 API의 Principal 계약을 확장하도록 설계되어 호환성 측면에 이점이 됩니다. (마이그레이션 이점)
```java
public interface Authentication extends Principal, Serializable {  
	Collection<? extends GrantedAuthority> getAuthorities();  
	Object getCredentials();  
	Object getDetails();  
	Object getPrincipal();   
	boolean isAuthenticated();    
	void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;  
}
```

AuthenticationProvider 인터페이스는 사용자를 찾는 것은 UserDetailsService에 위임하고 PasswordEncoder로 인증 프로세스에서 암호를 관리합니다.

하지만, ```AuthenticationProvider```는 Spring Security 5부터 Deprecated 되었으며, 대신에 AuthenticationManager를 사용하도록 권장됩니다. AuthenticationManager는 AuthenticationProvider와 다양한 인증 방식을 지원하는 Provider들을 통합적으로 관리하고, 실제 인증 처리를 담당하는 역할을 수행하기 때문입니다.

구현부의 ```AuthenticationProvider```와 ```WebSecurityConfigurerAdapter``` 둘 다 현재는 사용되지 않는 부분으로 작성하지 않았습니다.



글 마지막에 이런 내용이 존재하는데 이 부분이 오히려 책의 핵심 내용이자, 의존성을 사용하는 개발자들이 필히 고려해야 할 부분이라고 생각합니다.

프레임워크, 특히 애플리케이션에 널리 이용되는 프레임워크는 수많은 똑똑한 개발자의 참여로 개발된다. 그렇다고 해도 프레임워크가 잘못 구현되는 경우는 많지 않다. 어떤 문제가 프레임워크의 잘못이라고 결론 내리기 전에 애플리케이션을 분석하자.

프레임워크를 이용하기로 결정했다면 최대한 프레임워크의 의도된 용도에 맞게 이용한다. 예를 들어 스프링 시큐리티를 이용하면서 보안 구현에 프레임워크가 제공하는 것보다 맞춤형 코드를 작성하는 일이 많다고 느낀다면 이런 일이 왜 생기는지 의문을 가져야 한다.



#### SecurityContext 이용
보안 컨텍스트는 Authentication 객체를 저장하는 인스턴스입니다.
```java
public interface SecurityContext extends Serializable{
	Authentication getAuthentication();
	void setAuthentication(Authentication authentication);
}
```
SecurityContext를 관리하기 위해 스프링 시큐리티는 SecurityContextHolder라는 객체를 제공합니다.  MODE_THREADLOCAL, MODE_INHRITABLETHREADLOCAL, MODE_GLOBAL 옵션을 제공하고 설정은 Config에서 다음과 같이 설정할 수 있습니다.
```java
return() -> SecurityContextHolder.setStrategyName(	SecurityContextHodler.MODE_INHERITABLETHREADLOCAL);
```

#### MODE_THREADLOCAL
(보안 컨텍스트를 위한 보유 전략 이용)   
각 스레드가 보안 컨텍스트 각자 세부 정보를 저장하는 것으로 기본값입니다. 새 스레드도 자체 보안 컨텍스트를 가지며 상위 스레드의 세부 정보가 새 스레드의 보안 컨텍스트로 복사되지 않습니다.
이 SecurityContext에서 Authentication을 얻기 위해서는 앤드포인트 매개변수에 바로 주입해서 얻을 수 있습니다.
```java
@GetMapping
public String hello(Authentication a){
	return a.getName();
}
```

#### MODE_INHRITABLETHREADLOCAL
(비동기 호출을 위한 보유 전략 이용)  
MODE_THREADLOCAL와 비슷하지만 비동기 메서드의 경우 보안 컨텍스트를 다음 스레드로 복사하도록 스프링 시큐리티에 지시합니다.
부모 스레드에서 생성된 SecurityContext를 자식 스레드에서도 공유할 수 있습니다. 즉, 원래 스레드에 있는 세부 정보를 비동기 메서드의 새로 생성된 스레드로 복사합니다.

#### MODE_GLOBAL
(독립형 애플리케이션을 위한 보유 전략 이용)  
애플리케이션의 모든 스레드가 같은 보안 컨텍스트 인스턴스를 보게 합니다. 스레드 안전을 지원하지 않음에 유의해야 합니다. 공유 스레드 전략에서는 스프링이 관리하는 스레드에만 전략이 적용된다는 것을 기억해야 합니다.



보안 컨텍스트를 새로 생성한 스레드로 전파하게 도와주는 몇 가지 스프링 시큐리티의 유틸리티 툴이 있습니다.

#### DelegatingSecurityContextRunnable
Runnable 인터페이스를 구현한 클래스로, 생성자로 Runnable 객체와 현재 SecurityContext를 받아서, 새로 생성한 스레드에서 Runnable 객체를 실행할 때 보안 컨텍스트를 전파합니다. 반환값이 없는 작업 실행 후 이용할 수 있습니다.
```java
SecurityContext securityContext = SecurityContextHolder.getContext();
Runnable runnable = new MyRunnable();
Runnable wrappedRunnable = new DelegatingSecurityContextRunnable(runnable, securityContext);
new Thread(wrappedRunnable).start();
```

#### DelegatingSecurityContextCallable
반환값이 있는 작업에는 DelegatingSecurityContextCallable 대안을 사용할 수 있습니다. 현재 보안 컨텍스트를 복사해 비동기적으로 실행할 Callable 작업을 지정합니다.

#### DelegatingSecurityContextExecutorService
ExecutorService 인터페이스를 구현한 클래스로, 보안 컨텍스트를 새로 생성한 스레드에서 실행하는 작업을 자동으로 처리할 수 있습니다. 이와 유사하게 DelegatingSecurityContextScheduledExecutorService는 예약된 작업을 위해 보안 컨텍스트 전파를 구현해야 하는 경우의 데코레이터로 사용됩니다.
```java
SecurityContext securityContext = SecurityContextHolder.getContext();
ExecutorService executorService = Executors.newFixedThreadPool(10);
ExecutorService wrappedExecutorService = new DelegatingSecurityContextExecutorService(executorService, securityContext);
wrappedExecutorService.submit(new MyRunnable());
```


#### HTTP Basic 인증 양식

```java
http.httpBasic(c->{
		// 영역 이름을 변경하는 방법
		c.realName("OTHER");
		// custom AuthenticationEntryPoint 적용
		c.authenticationEntiryPoint(new CustomEntryPoint());
	})
	http.authorizeRequests().anyRequest().authenticated();
```

AuthenticationEntryPoint 인터페이스  
Spring Security에서는 여러 가지 AuthenticationEntryPoint 구현체를 제공하며, 이를 통해 다양한 인증 실패 시나리오에 대응할 수 있습니다. 예를 들어, 웹 애플리케이션에서는 ```LoginUrlAuthenticationEntryPoint```가 자주 사용되며, REST API에서는 ```Http403ForbiddenEntryPoint```가 자주 사용됩니다.

#### 양식 기반 로그인 인증
> 수평적 확장성이 필요한 대형 애플리케이션에서 보안 컨텍스트를 관리하는 데 서버 쪽 세션을 이용하는 것은 좋지 않습니다.

양식 기반 로그인을 사용하는 경우에는 formLogin() 메서드를 이용합니다. 스프링 시큐리티에서 로그인을 하지 않는 경우는 로그인 페이지로 리디렉션되게 처리됩니다.
```java
http.formLogin();
```
```@RestController```가 아닌 ```@Controller```를 사용하므로써 메서드 반환 값을 HTTP 응답으로 보내는 것이 아닌 ```home.html```로 랜더링해줍니다.
이 때 로그인을 하지 않았다면, /login 로그인 페이지로 리디렉션되고 /logout 경로로 접근하면 로그아웃 페이지로 리디렉션됩니다. (HTTP 302)
```java
@Controller
public class HelloController{
	@Getmapping("/home")
	public String home(){ return "home.html"; }
}
```
```formLogin()```의 맞춤 구성을 위해 ```AuthenticationSuccessHandler```와 ```AuthenticationFailureHandler``` 객체를 이용할 수 있습니다.

### 6장 실전: 작고 안전한 웹 애플리케이션
주로 구현단에 대한 이야기가 있는 챕터입니다.  작성일자 기준 Deprecated된 내용은 제외했습니다.

+ 의존성 추가
  + SQL 버전 지정을 위한 플라이웨이, 리퀴베이스 종속성 이용할 수 있습니다.
+ 비밀번호 암호화를 위한 PasswordEncoder ```@Bean```으로 등록
+ User, Authority 엔티티 설정
+ UserDetails 인터페이스의 구현

```java
@Override
public CustomUserDetails loadUserByUsername(String username){
	Supplier<UsernameNotFoundException> s = () -> new UsernameNotFoundException("user not found");
	User user  = userRepository.findByUsername(username)
	.orElseThrow(s);
	return new CustomUserDetails(user);
}
```
인증논리에서 암호가 일치하면 ```encoder.matches(rawPassword, user.getPassword())``` 인증이 되었으므로, Authentication을 반환합니다.
> 대부분은 같은 기능을 여러 가지 다른 방법으로 구현할 수 있으며, 가장 단순한 해결책을 선택해 코드를 이해하기 쉽게 만들어 오류와 보안 침해 여지를 줄일 필요가 있습니다.


### 7장. 권한 부여 구성: 액세스 제한
스프링 시큐리티에서는 인증 필터에서 보안 컨텍스트에 인증된 사용자 세부 정보를 저장하고 이후에 권한 부여 필터로 요청을 허용할지 결정합니다.

한 사용자는 하나 이상의 권한을 갖습니다. 즉 GrantedAuthority로 UserDetils는 하나 이상의 권한을 갖습니다. UserDetils의 ```getAuthorities()``` 메서드로 사용자 세부 정보의 모든 권한을 반환합니다.

#### 엔드포인트 권한 제어
```permitAll()```이 아닌 특정 권한 제어로 "WRITE" 권한을 가진 경우에만 접근이 가능하도록 할 수 있습니다. 이외에도 권한 제어를 위한 다음 세 가지 메서드가 있습니다.
+ hasAuthority()
+ hasAnyAuthority()
+ access()

```java
// .hasAuthority()의 이용
http.authoriseRequests()
.anyRequest()
.hasAuthority("WRITE");

// .access()의 이용
// 복잡한 식을 작성해야 하는 경우의 실제 시나리오가 있을 수 있습니다.
http.authoriseRequests()
.anyRequest()
.access("hasAuthority('WRITE') and !hasAuthority('DELETE')");
```

<span style="background-color:#DCFFE4; margin-right:5px">스프링 식(SpEL)이란?</span>  
Spring Framework에서 제공하는 표현 언어입니다.  
스프링 식은 XML이나 애노테이션 기반의 구성에서 사용할 수 있으며, 객체 그래프를 탐색하고 조작하는 데 사용됩니다. 스프링 식은 Java의 다양한 연산자와 함수를 지원하며, 객체의 프로퍼티나 메서드 호출, 리스트나 맵의 인덱스 접근, 산술 연산 등 다양한 기능을 제공합니다.
책의 예제에서는 정오 이후에만 엔드포인트 접근을 하용하는 경우 등 SpEL 식을 활용해서 ```access()``` 메서드를 사용하는 더 범용적인 상황에서 사용이 가능합니다.

권한이 없는 경우의 요청은 HTTP 상태는 ```HTTP 403 Forbidden```을 반환합니다.
여기서 권한과 달리 역할은 권한보다 결이 굵은데 같은 GrantedAuthority가 사용되며, 역할이름은 ```ROLE_```로 시작해야 합니다.
```java
User.withUsername("john")
.password("qwer1234")
.authorities("ROLE_MEMBER")
.build();
```

```permitAll()```로 모든 접근 권한을 허용할 수 있으며, ```denyAll()```로 모든 요청을 거부할 수도 있습니다.




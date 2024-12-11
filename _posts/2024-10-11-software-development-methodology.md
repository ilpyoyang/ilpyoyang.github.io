---
title: 소프트웨어 개발 방법론
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [CS, Basic]
tags: [테스트]
pin: false
math: true
mermaid: true
---

### 객체 지향 방법론
**객체지향 설계 원칙 (= SOILD)**
> 5대 설계원칙: SRP, OCP, LSP, ISP, DIP

<span style="background-color:#fff5b1">SRP(Single Responsibility Principle), 단일 책임 원칙</span>  
한 클래스는 하나의 책임만 가져야 한다는 원칙입니다.  
아래 코드에서도 볼 수 있듯이 사용자와 관련된 로직과 이메일 발송에 대한 로직을 따로 분리해서 class화 하는 것이 바람직합니다. 단 하나의 책임만 가질 수 있도록 코드를 분리해서 작성하도록 합니다.
```kotlin
class User {
    fun register() { }
}
class EmailSender {
    fun sendEmail() { }
}
```
<span style="background-color:#fff5b1">OCP(Open/Closed principle), 개방-폐쇄 원칙</span>  
소프트웨어 요소는 확장에는 열려 있으나 변경에는 닫혀 있어야 한다는 원칙입니다.  
```Dog``` 클래스와 ```Cat```는 둘 다 ```Animal``` 리턴 타입을 반환하는 ```makeSound()``` 메서드는 사용합니다. 여기서 ```Animal``` 클래스는 OCP 원칙을 지킨 클래스인데, 다른 동물 클래스를 만들 때에도 변경 없이 반환 타입 클래스로 동일하게 사용이 가능합니다.
```kotlin
// 동물 클래스
open class Animal(val name: String) {
    open fun makeSound() {
        println("동물이 소리를 내지 않습니다.")
    }
}

// 개 클래스
class Dog(name: String) : Animal(name) {
    override fun makeSound() {
        println("멍멍!")
    }
}

// 고양이 클래스
class Cat(name: String) : Animal(name) {
    override fun makeSound() {
        println("야옹~")
    }
}
```
<span style="background-color:#fff5b1">LSP(Liskov Substitution Principle), 리스코프 치환 원칙</span>  
프로그램의 객체는 프로그램의 정확성을 깨뜨리지 않으면서 하위 타입의 인스턴스로 바꿀 수 있어야 합니다.  
예시에서 보면 ```TransactionalAccount``` 클래스에서 상위 클래스 Accout의 메서드인 ```deposit()```를 오버라이드해서 하위 타입의 인스턴스에 사용할 수 있음을 알 수 있습니다.
```kotlin
// 계좌 클래스
open class Account(val accountNumber: String, var balance: Double) {
    open fun deposit(amount: Double) {
        balance += amount
        println("$amount 원이 입금되었습니다. 현재 잔액: $balance 원")
    }
}

// 입출금 계좌 클래스
class TransactionalAccount(accountNumber: String, balance: Double) : Account(accountNumber, balance) {
    override fun deposit(amount: Double) {
        super.deposit(amount)
        println("거래 내역이 저장되었습니다.")
    }
}

// 메인 함수
fun main() {
    val account: Account = TransactionalAccount("1234567890", 50000.0)
    account.deposit(10000.0)
}

```
<span style="background-color:#fff5b1">ISP(Interface Segregation Principle), 인터페이스 분리 원칙</span>  
특정 클라이언트를 위한 인터페이스 여러 개가 범용 인터페이스 하나보다 낫다는 원칙으로 큰 덩어리의 인터페이스들은 구체적이고 작은 단위들로 분리시킴으로써 클라이언트들이 꼭 필요한 메서드들만 이용할 수 있게 합니다.  
아래 예시는 ISP 원칙을 위반한 인터페이스로 모든 동물이 날지 않기 때문에 모호하고 경우에 따라 꼭 필요한 메서드가 아닌 ```fly()```를 포함하고 있습니다.
```kotlin
// 헷갈리는 동물 인터페이스
interface ConfusingAnimal {
    fun eat()
    fun fly()
}
```
<span style="background-color:#fff5b1">DIP(Dependency Inversion Principle), 의존관계 역전 원칙</span>  
프로그래머는 추상화에 의존해야지 구체화에 의존하면 안된다는 원칙입니다. 하위모듈의 구체적인 내용에 클라이언트가 의존하게 되면, 하위 모듈의 변화가 있을 때마다 클라이언트나 상위 모듈을 수정해줘야 한다는 단점이 발생하기 때문입니다.  
아래 예시는 ```BulbController``` 클래스는 ```Bulb``` 인터페이스를 상속받아서 만들어졌고, 메서드에서 인터페이스의 메서드들을 사용하는 의존관계 역전 현상을 보여주고 있습니다.
```kotlin
// 전구 인터페이스
interface Bulb {
    fun turnOn()
    fun turnOff()
}

// 전구 컨트롤러 클래스
class BulbController(private val bulb: Bulb) {
    fun pressSwitch() {
        bulb.turnOn()
        bulb.turnOff()
    }
}
```

<br>

### DDD(Domain-Driven Design)

![ddd.png](/assets/post_images/architecture/ddd.png)

도메인 주도 설계는 소프트웨어의 존재 가치는 사용자의 사용에 있다는 생각에서 비롯되어 <span style="background-color:#fff5b1">비즈니스 도메인을 중심</span>으로 고려한 설계 방식입니다. 즉, 사용자가 원하는 목적에 맞게 사용할 수 있는 소프트웨어가 기술보다 우선순위에 두고 고민할 필요성이 있다는 점에서 시작됩니다. 사용자의 관점에서 정해지는 부분이기 때문에 도메인은 관점에 따라 그 수가 달라질 수 있습니다. 하지만 DDD를 사용하므로써 개발자는 단순히 기술영역에만 국한되지 않고 도메인 영역까지 사고하는 생각의 범주를 더 넓힐 수 있습니다.  
<span style="background-color:#fff5b1">바운디드 컨텍스트</span>란 모델이 구현되는 곳이자 각각의 분리된 소프트웨어 산출물이 나오게 되는 곳입니다. 유비쿼터스 언어로 표현해 공동 작업을 하는 팀원과 유관 부서 간의 혼동을 피하는 것을 기본으로 합니다.

**반 버논의 도메인 분류**
+ 메인(핵심) 도메인
+ 서브 도메인
  + <span style="background-color:#fff5b1">핵심 서브 도메인</span>
    + 다른 경쟁자와 차별화를 만들 수 있는 비즈니스 영역
    + 높은 우선순위를 갖는 전략적 투자 영역
    + 가장 큰 투자가 필요한 곳
  + <span style="background-color:#fff5b1">지원 서브 도메인</span>
    + 맞춤 개발이 필요한 영역
    + 핵심 서브 도메인의 성공을 위한 중요한 영역
  + <span style="background-color:#fff5b1">일반 서브 도메인</span>
    + 기존 제품 구매를 통해 바로 충족시킬 수 있는 영역
    + 핵심/지원 서브도메인이 할당된 팀에서 직접 구현 가능

****

[Domain-Driven Design Simplified.](https://medium.com/@jaysonmulwa/domain-driven-design-simplified-a03c732401c9)  
[도메인 주도 설계에서의 전략적 설계](https://engineering-skcc.github.io/msa/DDD-StrategicDesign/)

<br><br>

### Type System
강타입 언어는 타입 검사를 통과하지 못하면 컴파일 에러로 프로그램의 실행 자체를 막지만, 약타입 언어는 런타임시 타입오류가 있어도 실행을 막지 않습니다. 대부분의 강타입 언어에서는 ```int```, ```char```와 같은 타입 선언을 하지만, 약타입은 하지 않습니다. 하지만 ```Haskell```의 경우에는 컴파일러가 '추론'을 통해 검사를 하기 때문에 약타입처럼 보이지만 강타입 계열에 속합니다.
+ 강타입 ```GO```, ```ML```, ```F#```
+ 강타입 계열 ```C#```, ```Haskell```, ```Java```
+ 약타입 계열 ```Javascript```, ```Assembly```

컴파일시 타입이 결정되는 정적타입 언어는 강타입 계열에 해당합니다. 반면, 동적타입(Dynamically typed) 언어는 주로 약타입이지만 런타입에서 변수의 타입이 결정되기 때문에 강타입 계열 언어가 될 수 있습니다. 타입에 대한 의견은 다양하지만 동적타입 언어가 타입힌트와 타입 어노테이션을 가지고 강력한 타입체크를 한다면 가능한 의견입니다.    
<span style="background-color:#DCFFE4">C, C++는 강타입이 아니다?</span>  
타입 검사를 통과하지 못하면 항상 실행이 되지 않아야 하지만, ```union``` 타입에서는 타임에러를 검출할 수 없기 때문입니다. 따라서 강타입 '계열'의 언어로 보는 것이 바람직합니다.  
<span style="background-color:#fff5b1">정적타입 언어는 코드작성이 빠르고 유연성이 높기 때문에 개발자가 효율적으로 작업할 수 있지만, 런타입 에러가 발생하거나 디버깅이 어렵다는 단점이 있습니다. 반면, 정적타입 언어는 컴파일 에러가 발생하기 때문에 타입에러를 미리 잡아 안정성이 높다고 할 수 있습니다. 하지만 코드 작성이 더 복잡하고 유연성이 낮다는 단점이 있습니다.</span>

****
[Toggle the table of contents Strong and weak typing](https://en.wikipedia.org/wiki/Strong_and_weak_typing)


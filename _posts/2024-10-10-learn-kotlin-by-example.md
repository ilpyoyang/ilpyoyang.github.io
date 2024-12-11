---
title: Learn Kotlin by Example
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Kotlin]
tags: [Kotlin, 스터디]
pin: false
math: true
mermaid: true
---

[Learn Kotlin by Example](https://play.kotlinlang.org/byExample/overview?_gl=1*9t8fde*_gcl_au*MTMyMjIyOTg2NC4xNzI5NzQ0OTky*_ga*MjIxOTA3MTMxLjE3Mjk3NDQ5ODg.*_ga_9J976DJZ68*MTcyOTc0NDk4OC4xLjEuMTcyOTc0NjM2OS41OC4wLjA.)  
이 글의 모든 예시는 kotlin doc에서 차용했습니다. 모든 내용을 정리하지는 않고 아래 [kotlin을 시작하며]()와 같은 기본 내용을 제외한 중요내용을 추가했습니다.

<hr>

#### 코틀린 타입
코틀린은 원시 타입과 래퍼 타입을 구분하지 않습니다. 기본적으로 원시 타입을 사용하지 않고 컴파일시에 자바의 원시 타입과 래퍼 타입으로 자동 변환됩니다. 즉, 컴파일 시점에 원시 타입으로 변환되고, 런타임에서는 그 변환된 바이트코드가 실행됩니다.  
최상위 타입에는 **Any** 타입이 존재하며 자바의 Object 타입처럼 사용됩니다. 다른 Int, Boolean 원시타입의 상위 객체이기도 합니다.   
**Unit** 타입은 자바의 void와 같이 리턴이 없는 것으로 표시하며, 명시적 return을 사용하지 않아도 됩니다. 실제로 작성된 메서드도 없고 싱글턴으로 생성됨을 알 수 있습니다.   
**Nothing** 타입은 함수가 정상적으로 종료되지 않는 함수임을 알 수 있습니다. 무한 루프를 포함하거나 항상 예외를 던지는 함수의 타입으로 사용됩니다. 🍎

<hr>

#### infix 함수 🍎
두 객체 중간에 들어가는 함수 형태로 함수 앞의 객체인 `dispatcher`와 함수 뒤의 객체인 `receiver`를 사용해서 함수에 적용할 수 있습니다. 클래스 내부에서는 `dispatcher`를 별도로 정의하지 않고 클래스 자신으로 구현할 수 있습니다.
```kotlin
infix fun Int.shl(x: Int): Int { ... } 
1 shl 2 
1.shl(2)
```

<hr>

#### vararg 파라미터 🍎
콤마(,)를 기준으로 주어진 값을 나누어 배열처럼 사용할 수 있게 해줍니다.
```kotlin
fun printAll(vararg messages: String) {
    for (m in messages) println(m)
}
printAll("Hello", "Hallo", "Salut", "Hola", "你好")
```

<hr>

#### Null safty
널을 사용하고자 하는 경우 변수 선언시 타입에 `?`를 사용해서 널이 인자로 들어올 수 있다는 것을 표기해야 합니다.  `?`는 nullable type이며, 허용되지 않는 곳에 널을 사용하려고 하는 경우에는 컴파일 에러가 발생합니다.
```kotlin
var nullable: String? = "You can keep a null here" 
```

<hr>

#### 클래스
기본 생성자는 코틀린에서 자동으로 생성됩니다. 기본 생성자를 생성할 때는 java와 달리 `new`를 표기하지 않아도 됩니다.
##### Data class
자동으로 `toString`, `copy`, `componentN`과 같은 메서드가 생성되고 정확하게 일치하는 요소를 찾기 위해서는 `hashCode`의 일치 여부로 확인할 수 있습니다.
```kotlin
println(user.hashCode())
```
##### Enum class
Enum은 각 속성값을 추가해줄 수 있는데 그 속성을 이용해서 일치여부를 확인할 수 있도록 메서드를 추가할 수 있습니다. 🍎
```kotlin
fun containsRed() = (this.rgb and 0xFF0000 != 0)
// 이런 방식으로 빨간색의 포함여부를 확인할 수 있다.
```
##### Sealed classes
상속의 제한을 두기 위해 사용되는 클래스입니다.
```kotlin
sealed class Mammal(val name: String)                                                   // 1

class Cat(val catName: String) : Mammal(catName)                                        // 2
class Human(val humanName: String, val job: String) : Mammal(humanName)

fun greetMammal(mammal: Mammal): String {
    when (mammal) {                                                                     // 3
        is Human -> return "Hello ${mammal.name}; You're working as a ${mammal.job}"    // 4
        is Cat -> return "Hello ${mammal.name}"                                         // 5     
    }                                                                                   // 6
}
```
- when에서 mammal를 Human, Cat으로 캐스팅
- non-sealed 클래스에 대한 처리가 필요

##### object 🍎
자바의 싱글턴처럼 한 번 사용되는 객체로 lazy 인스턴스를 말합니다. 함수를 호출하는 순간에 함수 내부에 object 객체가 생성됩니다.
```kotlin
fun rentPrice(standardDays: Int, festivityDays: Int, specialDays: Int): Unit {
	val dayRates = object {
        var standard: Int = 30 * standardDays
		var festivity: Int = 50 * festivityDays
        var special: Int = 100 * specialDays
    }
}
```
object 선언하는 경우에는 위에 expression과 달리 변수 할당의 형태로 사용할 수 없고 바로 접근해야 한다는 점에서 차이가 있습니다.
```kotlin
object DoAuth {
	fun takeParams(username: String, password: String) {
	println("input Auth parameters = $username:$password")
    }
}
```
`companion object`는 자바의 `static`처럼 쓰여서 전역에서 공용으로 사용할 수 있도록 해줍니다. 사용시 package 레벨 함수로 사용될 수 있습니다.
```kotlin
class BigBen {
	companion object Bonger {
		fun getBongs(nTimes: Int) {
			for (i in 1 .. nTimes) {
                print("BONG ")
            }
        }
    }
}
```

<hr>

#### 제네릭 🍎
`E`는 제네릭 타입을 나타내는 Element 파라미터입니다. 이 자리에는 `E` 또는 어떤 타입이든 사용될 수 있습니다. 그리고 리턴 자제도 `E`로 할 수 있습니다.  
제네릭 함수는 `<E>`를 함수명 앞에 위치시켜 함수 호출시 어떤 타입으로 구체화를 명확하게 합니다.
```kotlin
fun <E> mutableStackOf(vararg elements: E) = MutableStack(*elements)
```

<hr>

#### Inheritance
`open`을 사용해서 클래스가 상속 가능하도록 합니다.

<hr>

#### Control Flow
##### when
kotlin에서는 `switch`가 아닌 `when`을 사용해서 괄호 안에 값에 따른 처리를 간편하게 수행할 수 있습니다.
```kotlin
fun whenAssign(obj: Any): Any {
    val result = when (obj) {                 
        1 -> "one"
        "Hello" -> 1
        is Long -> false
        else -> 42 
    }
    return result
}
```
##### iterators 🍎
컬렉션(Set, List, Map)의 값을 일관성 있게 가지고 오는 방법으로  `next()`, `hasNext()`와 같은 기능을 제공합니다.
```kotlin
class Zoo(val animals: List<Animal>) {

    operator fun iterator(): Iterator<Animal> {             // 1
        return animals.iterator()                           // 2
    }
}
```

##### ranges
for문과 같은 반복문에서 반복의 범위를 정하는 표현을 다양하게 다음과 같이 사용할 수 있습니다.
- for(i in 0...3)
- for(i in 0 until 3)
- for(i in 2...8 step 2)
- for(i in 3 downTo 0)

##### Equality Checks
코틀린에서 ==는 구조적 일치를, ===는 요소의 일치까지 동일해야 true를 반환합니다. 🍎
```kotlin
val authors = setOf("Shakespeare", "Hemingway", "Twain")
val writers = setOf("Twain", "Shakespeare", "Hemingway")

println(authors == writers)   // 1
println(authors === writers)  // 2
```

<hr>

#### Functional
함수를 파라미터처럼 사용하거나 함수를 리턴하는 방식으로 사용될 수 있습니다.  
아래 코드에서 calculate라는 함수 안에 `::sum` 으로 함수를 받아서 사용하거나 곱셈을 구하는 경우 calculate에 명시된 바에 따라 operation을 수행할 수 있습니다.
```kotlin
val sumResult = calculate(4, 5, ::sum)
val mulResult = calculate(4, 5) { a, b -> a * b }
```
operation이 `::square` 함수를 리턴하므로 `2*2`가 수행됩니다.
```kotlin
fun operation(): (Int) -> Int {
    return ::square
}

fun square(x: Int) = x * x

fun main() {
    val func = operation()
    println(func(2))
}
```
다음과 같이 람다를 이용해서 간단하게 함수를 표시할 수 있습니다.
```kotlin
val upperCase6: (String) -> String = String::uppercase 
```
##### Extension function
상속이나 다른 디자인 패턴 없이도 확장가능한 함수를 만들 수 있습니다. extension property도 지원합니다. 클래스 자체에 함수를 만들지 않았어도 새로운 멤버 없이 클래스에 `.`를 이용해서 확장함수를 정의할 수 있습니다.
```kotlin
fun Order.maxPricedItemValue(): Float = this.items.maxByOrNull { it.price }?.price ?: 0F
```

<hr>

#### Collections
- `List`는 읽기만 가능하고 `MutableList`는 변동이 가능한 콜렉션입니다.
- `Set`은 순서가 정해지지 않고 중복을 허용하지 않습니다.   `MutableSet`은 `MutableList`와 마찬가지로 변동이 가능한 콜렉션입니다.
- `MutableMap`은 변동이 가능한 콜렉션입니다.
```kotlin
val EZPassAccounts: MutableMap<Int, Int> = mutableMapOf(1 to 100, 2 to 100, 3 to 100) 
```
- `filter`를 사용해서 주어진 객체 요소 중 조건에 해당하는 것만을 뽑아낼 수 있습니다.
- `map`을 사용해서 주어진 객체의 모든 요소에 대해 연산을 할 수 있게 합니다.
- `any`, `all`, `none`은 모두 주어진 객체에 조건에 해당하는 요소가 있는지 모두 해당하는지 또는 없는지를 확인해서 boolean 값을 리턴합니다.
- `associateBy`, `groupBy`는 지정된 키로 컬렉션 요소를 이용해서 맵을 만듭니다. 🍎
    - 함수를 어떻게 사용하는지에 따라 출력값이 상이하게 출력됨을 아래 result에서 확인할 수 있습니다. `Person::phone`와 같이 객체에서 특정요소만 나오게 할 수도 있고, `{ it.phone }`와 같이 `phone`이라는 값을 중심으로 모든 요소가 나오게 할 수도 있습니다.

```kotlin
data class Person(val name: String, val city: String, val phone: String)

val people = listOf(
    Person("John", "Boston", "+1-888-123456"),
    Person("Sarah", "Munich", "+49-777-789123"),
    Person("Svyatoslav", "Saint-Petersburg", "+7-999-456789"),
    Person("Vasilisa", "Saint-Petersburg", "+7-999-123456"))

val phoneBook = people.associateBy { it.phone }
val cityBook = people.associateBy(Person::phone, Person::city)
val peopleCities = people.groupBy(Person::city, Person::name)
val lastPersonCity = people.associateBy(Person::city, Person::name)
```
```shell
// Result
People: [Person(name=John, city=Boston, phone=+1-888-123456), Person(name=Sarah, city=Munich, phone=+49-777-789123), Person(name=Svyatoslav, city=Saint-Petersburg, phone=+7-999-456789), Person(name=Vasilisa, city=Saint-Petersburg, phone=+7-999-123456)] 
Phone book: {+1-888-123456=Person(name=John, city=Boston, phone=+1-888-123456), +49-777-789123=Person(name=Sarah, city=Munich, phone=+49-777-789123), +7-999-456789=Person(name=Svyatoslav, city=Saint-Petersburg, phone=+7-999-456789), +7-999-123456=Person(name=Vasilisa, city=Saint-Petersburg, phone=+7-999-123456)} 
City book: {+1-888-123456=Boston, +49-777-789123=Munich, +7-999-456789=Saint-Petersburg, +7-999-123456=Saint-Petersburg} 
People living in each city: {Boston=[John], Munich=[Sarah], Saint-Petersburg=[Svyatoslav, Vasilisa]} 
Last person living in each city: {Boston=John, Munich=Sarah, Saint-Petersburg=Vasilisa}
```
- `partition`을 사용하면 컬렉션에서 조건에 해당하는 요소와 아닌 값으로 두 개의 리스트(`Pair<List<T>, List<T>`)를 반환합니다.
```kotlin
val numbers = listOf(1, 2, 3, 4, 5) val (evenNumbers, oddNumbers) = numbers.partition { it % 2 == 0 }
```
- `flatmap`은 두 개의 컬렉션이 존재하는 경우 하나로 만들어 주는 기능을 합니다. 중첩구조에서 해당하는 리스트들을 하나의 리스트로 만들 때 유용합니다.
- `minOrNull`, `maxOrNull`는 컬렉션의 가장 작은 값 또는 가장 큰 값을 리턴하고 그 값이 없으면 null을 반환합니다.
- `mapWithDefault`를 사용하는 경우 그 값이 없을 때에는 아래 메서드 정의대로 주어진 키의 길이가 반환됩니다. 🍎
```kotlin
val mapWithDefault = map.withDefault { k -> k.length }
```
- 두 컬렉션을 `zip`을 이용해서 묶으면 `Pair`가 적용되어 하나의 컬렉션으로 만들어집니다.
```kotlin
val A = listOf("a", "b", "c")
val B = listOf(1, 2, 3, 4)
val resultPairs = A zip B 
```

<hr>

#### Scope Functions
중첩 스코프 함수는 권장되지 않습니다.
- `let`을 이용하면 null 체크가 가능합니다. `변수?.let{ ... }`과 같이 사용되는 경우에는 변수가 null이 아닐 때 `let` 이하를 실행합니다. `it`을 이용해서 객체에 접근합니다.
- 다른 스코핑 함수인 `run`은 `let`과 달리 `this`를 이용해서 객체에 접근합니다. 주로 객체의 메서드나 프로퍼티를 호출할 때 유용합니다. 객체의 맥락에서 작업을 할 때 자연스럽게 사용할 수 있습니다.
- 멤버 프로퍼티에만 접근할 경우 `with`를 사용할 수도 있습니다.
- `apply`는 객체 내에서 코드블록 사용을 허용합니다.
```kotlin
val jake = Person()
val stringDescription = jake.apply {
    name = "Jake"
    age = 30
    about = "Android developer"
}.toString()   
```
- `also`는 `apply`처럼 사용되고 추가 작업을 포함시키는 것을 편리하게 합니다.
```kotlin
val jake = Person("Jake", 30, "Android developer")
    .also {
        writeCreationLog(it)
    }
```

<hr>

#### Delegation
코틀린에서는 `by`를 이용해서 클래스의 위임 패턴이 가능하게 합니다.
```kotlin
class TomAraya(n:String): SoundBehavior by ScreamBehavior(n)  
```
속성을 위임하는 방식으로 `Map` 구조의 요소를 받아서 속성을 정의할 수 있습니다.
```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

<hr>

#### Kotlin/JS
- `dynamic`을 사용해서 런타임 시점에 동적으로 사용됩니다.
- `JS function`를 사용해서 코틀린 언어로 자바스크립트에서처럼 `alert` 기능을 사용하게 하거나 `json` 생성을 가능하게 합니다.
```kotlin
val json = js("{}")
json.name = "Jane"
json.hobby = "movies"
println(JSON.stringify(json))  
```
- `external`로 선언된 함수나 속성은 실제 구현이 JavaScript에서 제공된다는 것을 의미합니다. 따라서 코틀린에서는 구현을 제공할 필요가 없습니다.
- `HTML5 Canvas`를 지원합니다.
- html 생성이 가능합니다.
```kotlin
val result = html {
    head {
        title { +"HTML encoding with Kotlin" }
    }
    body {
        h1 { +"HTML encoding with Kotlin" }
        p {
            +"this format can be used as an"
        }
    }
}
```

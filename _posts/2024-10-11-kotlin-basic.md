---
title: Java와 비교로 보는 Kotlin 기본문법
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Kotlin]
tags: [Kotlin]
pin: false
math: true
mermaid: true
---

<span style="background-color:#fff5b1">코틀린은 자바의 가상머신 JVM 상에서 실행되는 언어입니다.</span> 코틀린 컴파일러는 JVM이 이해할 수 있는 바이트 코드로 변환해 자바 클래스 파일과 동일한 형식을 가지고 실행할 수 있게 합니다. 그리고 자바와의 호환성이 뛰어난 언어이며 비슷한 문법, 라이브러리 상호운용성을 보장합니다. 코틀린과 자바 코드를 비교하면서 기초 문법을 작성했습니다. (자바와 동일한 부분은 제외)

<br>

**함수 - fun**   
코틀린은 자바와 달리 함수 선언이 ```fun```으로 간단하며, 출력메서드도 간단합니다. 코드마다 ```;```도 없습니다. (파이썬과 자바 혼용의 느낌이 나기 시작합니다.)  
여기서 가장 다르다고 느낀 부분은 변수 부분인데, 아래 코드에서도 알 수 있듯이 <span style="background-color:#fff5b1">코틀린의 경우는 변수명이 먼저</span> 오고 ```:``` 다음에 타입 순으로 작성됩니다. 코틀린 1.3 이전의 버전에서는 파라미터로 ```Arrays<String>```이 반드시 필요했습니다. 최신 버전의 경우 main 함수에 파라미터가 필요하지 않습니다.
```kotlin
// kotlin main 함수
fun main(args: Array<String>) {
    println(args.contentToString())
}
```
```java
// java main 함수
public static void main(String[] args) {
    System.out.println(Arrays.toString(args));
}
```
코틀린은 리턴타입을 마지막에 표시하는데 유추될 수 있는 타입이나 ```Unit``` <span style="background-color:#fff5b1">리턴타입은 생략이 가능</span>합니다.
```kotlin
// kotlin 함수
fun sum(a: Int, b: Int): Int {
    return a + b
}
fun sum(a: Int, b: Int) = a + b

fun printSum(a: Int, b: Int): Unit {
    println("sum of $a and $b is ${a + b}")
}
fun printSum(a: Int, b: Int) {
    println("sum of $a and $b is ${a + b}")
}
```
```java
// java 함수
public int sum(int a, int b){
    return a + b;
}
```

[ Infix notation ]   
한국말로는 <span style="background-color:#fff5b1">중위표기법</span>이라고 합니다. 즉 두 개의 값 사이의 특정한 표현을 넣는 것을 의미합니다. 여기서는 [Pair](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/)의 ```to``` 를 사용했는데, ```Pair 생성자```를 이용도 같은 결과가 나옵니다.
```kotlin
val pair = "Ferrari" to "Katrina"
println(pair)
```
3개의 변수를 합치는 경우에는 [Triple](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/)을 사용해서 변수를 초기화할 수 있습니다. 각각의 변수는 first, second, third로 접근할 수 있습니다.
```kotlin
val (a, b, c) = Triple(2, "x", listOf(null))
println(a) // 2
println(b) // x
println(c) // [null]
```
<span style="background-color:#fff5b1">Infix 함수</span>는 ```infix fun```으로 나타내는데, ```infix fun dispatcher.함수이름(receiver): 리턴타입 { 구현부 }```과 같은 형식으로 되어 있습니다. ```dispatcher```는 Infix 전에 오는 객체이고, 뒤에 ```receiver```는 Infix 다음에 오는 객체입니다.
```kotlin
infix fun Int.times(str: String) = str.repeat(this)
println(2 times "Bye ")
```

<br>

**변수 - val, var, const**   
코틀린은 변수 타입을 적지 않아도 유추되기 때문에 생략이 가능합니다. <span style="background-color:#fff5b1">```var``` 변수는 재할당이 가능한 변수이고, ```val```는 선언할 데이터의 값이 변경되지 않을 경우에 사용됩니다. ```const```는  java의 ```static final```가 붙은 상수처럼 고정된 값을 갖는 변수를 의미</span>합니다.
```kotlin
// kotlin 변수
var x: Int = 5
var x = 5   // `Int` 타입이 유추됨
val y = 5   // 상수
```
```java
// java 변수
int x  = 5;
final int y  = 5;
```
<span style="background-color:#DCFFE4">val과 const val의 차이점</span>  
```val```은 불완전한 불변성을 가지며, <span style="background-color:#fff5b1">런타임시에 결정</span>되는 상수입니다. 함수를 받는 val 변수를 생각해보면, 함수의 파라미터 값에 따라 val 변수의 값은 변할 수 있습니다.  
반면, ```const val```은 <span style="background-color:#fff5b1">컴파일시에 결정</span>되는 상수로 일반적으로 함수나 클래스의 상태에 상관없이 항상 동일한 값을 갖습니다. 그리고 변수명은 ```대문자```와 ```_```를 사용해서 나타냅니다. 함수 내 지역변수나 클래스 속성으로 사용할 수 없어 다음과 같이 ```compaion object```를 같이 사용해야 합니다.

<span style="background-color:#DCFFE4">런타임시 결정되는 상수와 컴파일시 결정되는 상수</span>  
<span style="background-color:#fff5b1">런타임시에 결정되는 상수는 실행 중 메모리에 동적 할당되고, 컴파일시 결정되는 상수는 컴파일된 코드의 데이터 영역에 할당(= 정적 할당)됩니다.</span> 즉, 컴파일시 결정되는 상수는 데이터 영역에 할당되므로 값을 변경할 수 없습니다. 따라서 보안과 관련된 상수를 이용할 때는 런타임시 결정되는 상수를 사용하는 것이 적절합니다.
```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

<br>

**문자열 템플릿**    
이 부분은 문자열 내에서 변수 변환을 주는 문법을 사용하고 있다는 점에서 약간 ```Spring Thymeleaf```의 문법과 유사한 느낌을 받았습니다.  
<span style="background-color:#DCFFE4">왜 s1을 상수로 설정했을까?</span>  
Doc에서 제공한 코드를 사용했는데 왜 s1을 상수로 설정했을까요? 혹시 a를 다시 설정하면 값이 변경되는지 확인해봤습니다. 하지만 자바 String 타입에 들어간 a 값은 변동이 없는 것처럼 변화가 없다는 것을 확인했습니다. 그럼에도 코드에서 상수를 명시하는 것은 불변성을 표시하므로써 유지보수와 가독성의 편리함을 제공합니다.
```kotlin
// kotlin 문자열 템플릿
var a = 1
val s1 = "a is $a"
a = 2
val s2 = "${s1.replace("is", "was")}, but now is $a"
```
```java
// java 문자열 템플릿
int a = 1;
String s1 = "a is " + a;
a = 2;
String s2 = s1 + ", but now is "+ a;
```

<br>

**조건문**    
코틀린에서는 아래 코드처럼 조건문의 값을 대입하는 것처럼 간결하게 나타낼 수 있습니다.
```kotlin
// kotlin 조건문
fun maxOf(a: Int, b: Int) = if (a > b) a else b
```
```java
// java 조건문
public int maxOf(int a, int b){
    return a>b? a:b;
}
```
자바의 ```switch문```과 유사한 ```when``` 표현식이 있는데, 표현방법도 거의 유사합니다. 이 코드도 위 ```if 조건문```처럼 마치 대입하는 형식으로 표기가 가능합니다.
```kotlin
fun describe(obj: Any): String =
    when (obj) {
        1          -> "One"
        "Hello"    -> "Greeting"
        is Long    -> "Long"
        !is String -> "Not a string"
        else       -> "Unknown"
    }
```

<br>

**반복문**    
자바에서는 for 반복문, 향상된 for 반복문에서도 인덱스를 제공하는 별도의 방법이 없어서 불편했지만, <span style="background-color:#fff5b1">코틀린에서는 ```.indices```로 유효한 인덱스 범위 ```0..list.lastIndex```를 제공하고 있습니다. 그 외에도 collection으로 ```forEachIndex```를 가지고 제공하고 있습니다.</span>  
(while문의 경우에는 자바와 코틀린이 거의 유사하기 때문에 생략했습니다.)
```kotlin
// kotlin 반복문
val items = listOf("apple", "banana", "kiwifruit")
// 방법1
for (index in items.indices) {
    println("item at $index is ${items[index]}")
}
// 방법2
list.forEachIndexed{index, element ->
    println("item at ${index} is ${element}")
}
```
```java
// java 반복문
List<String> list = List.of("apple", "banana", "kiwifruit");
for(int i=0; i<list.length; i++){
    System.out.println("item at " + i + " is " + list.get(i););
}
```
<span style="background-color:#fff5b1">Range와 관련해서는 ```step```처럼 값을 점프하면서 범위를 반복하거나, 수를 줄여가면서 반복하기 위해 사용되는 ```downTo```가 있습니다.</span>
```kotlin
for (x in 1..10 step 2) {
    print(x)
}
println()
for (x in 9 downTo 0 step 3) {
    print(x)
}
```

<br>

**Collections**    
코틀린에서도 콜렉션을 제공하는데 대표적으로 ```람다 표현식```이 있습니다. 자바와 달리 ```{ }```를 사용합니다.
```kotlin
val fruits = listOf("banana", "avocado", "apple", "kiwifruit")
fruits
    .filter { it.startsWith("a") }
    .sortedBy { it }
    .map { it.uppercase() }
    .forEach { println(it) }
```

<br>

**Null-Safety**  
자바에서 코틀린으로 넘어간 개발자들이 가장 편리하다고 말하는 기능입니다. 코틀린은 null 참조로 인한 위험을 막기 위해 [Null-Safety](https://kotlinlang.org/docs/null-safety.html#nullable-types-and-non-null-types) 기능을 제공합니다. 코틀린에서 null을 사용하기 위해서는 ```var b: String? = "abc"```과 같은 방식으로 타입 뒤에 ```?```를 붙여 허용해줘야 합니다.  
만약 null을 허용한 변수를 가지고 다른 메서드를 사용하려고 하면, 컴파일러 에러가 발생해 null 가능성을 알려줍니다. 이 경우 <span style="background-color:#fff5b1">Safe calls</span>로 해결할 수 있습니다. 앞서 예시로 ```nullable``` 변수로 null 값을 넣은 변수 ```b```의 길이를 구하기 위해서 ```b?.length```와 같은 표현이 가능합니다. <span style="background-color:#fff5b1">이렇게 Safe calls를 이용하면, 변수가 null인 경우 그 값도 null을 리턴합니다.</span>   
여기서 추가로 ```let```을 사용하면 null이 아닌 경우만 ```{ }``` 안의 메서드를 실행합니다. 즉, 아래 코드에 리스트 안에 null이 있더라도 null이 아닌 ```Kotlin```만 출력합니다. 자바였다면, 조건문을 사용해서 출력했을텐데 확실히 코드가 간결해진 것을 볼 수 있습니다.
```kotlin
val listWithNulls: List<String?> = listOf("Kotlin", null)
for (item in listWithNulls) {
    item?.let { println(it) } // prints Kotlin and ignores null
}
```

<br>

**타입 체크**  
코틀린에서는 ```is```를 이용해서 타입을 체크합니다. 자바에서의 ```instanceof```와 동일한 기능을 수행합니다.
```kotlin
if (obj !is String) return null
```

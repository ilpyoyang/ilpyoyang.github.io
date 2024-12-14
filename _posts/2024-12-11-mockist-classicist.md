---
title: Mockist vs Classicist
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS, Basic]
tags: [테스트]
pin: false
math: true
mermaid: true
---

먼저 알고가야할 개념이 있습니다. 테스트 더블을 사용해서 실제 의존 클래스로부터 격리된 테스트인 ```Solid Unit Test```를 구축하는 방법과 테스트 더블을 사용하지 않는 ```Sociable Unit Test``` 테스트 방법이 있습니다. 이러한 개념들은 ```XP(Extreme Programming)```을 기반으로 시작된 ```TDD```를 어떻게 진행해야 하는가에서 시작되었습니다.

![Solitary_Sociable.png](/assets/post_images/test/Solitary_Sociable.png)

Solitary를 지향하는 사람들을 ```Mockist```라고 하고, Sociable한 테스트도 괜찮다고 생각하는 사람들을 ```Classicist```라고 합니다.



### Mockist TDD  
London School Strategy, Interaction Testing, Outside-In, white box testing이라고도 알려져 있는 Mockist TDD는 ```SUT```를 생성하고 더블로 ```Mock```를 사용합니다.  
<span style="background-color:#DCFFE4">SUT(System Under Test)이란?</span>  
하나의 테스트에서 테스트하고자 하는 주요 대상이 되는 Unit인 테스트 대상 클래스입니다.
```java
verify(mockWareHouse).remove('식빵', '딸기쨈', '우유');    // 행위검증, test 안정감 낮음
```
테스트를 위한 사전작업으로 ```Mock``` 객체를 이용한 방법을 ```SUT```와 직접적인 협력을 맺고 있는 객체 메서드만 설정해주면 됩니다.
```java
Order mockOrder = mock(Order.class);
given(mockOrder.isPossible()).willReturn(true);
```
```재고확인 - 유통기한 확인 - 재고 줄이기 - 주문 유효성 검증```이 순서로 재고를 확인한다고 했을 때 여기서 추가로 중간에 구현된 유통기한 확인에 대한 부분에 대해서는 테스트가 깨지기 때문에 ```Classicist```와 달리 변경이 필요합니다. 반면, 테스트 세분화를 하기 쉬운 환경으로 어디서 발생한 버그인지를 찾기 더 유리할 수 있습니다.



### Classicist TDD  
Detroit School strategy, Inside-Out, black box testing라고 알려져 있으며, 시스템 바운더리 안에서 테스트를 진행하는 스타일입니다. 모든 테스트 더블을 사용하는게 가능하지만, 만약 SUT와 collaborator 사이의 ```collaboration```으로 확인이 불가한 경우에는 mock를 사용하기도 합니다.
```java
assertThat(wareHouse.size()).isEqualTo(1);  // 상태검증, test 안정감 높음
```
테스트를 위한 사전작업으로 ```Fixture```를 만드는 과정을 예시코드로 살펴보면, ```Classicist```에서는 실제 필요한 협력객체를 만들어주는 것을 볼 수 있습니다.
```java
List<Item> orderItems = List.of(new Item('식빵'), new Item('딸기'), new Item('우유'));
```
```Inside-Out``` 방법을 사용하기 때문에 객체간 협력이 어색하거나 ```public api```가 잘못 설계될 수 있다는 단점이 있습니다.

---
[UnitTest - Martin Flower](https://martinfowler.com/bliki/UnitTest.html)  
[Classicist TDD vs Mockist TDD](https://algopoolja.tistory.com/119)  
[Mockist vs Classical testing strategy](https://romainbrunie.medium.com/mockist-v-classical-testing-strategy-d967f1bc263c)  
[[10분 테코톡] 더즈, 티키의 Classic TDD VS Mockist TDD](https://www.youtube.com/watch?v=n01foM9tsRo&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)

---
title: 백엔드 개발자 면접대비 질문정리 - CS
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

### 스레드와 트랜잭션
+ 스레드는 프로세스에서 실행되는 독립적인 실행 단위
  + 하나의 프로세스에는 여러 개의 스레드
  + 동시성 지원을 위한 독립적으로 실행 가능한 단위
  + 병렬처리는 복수의 CPU 코어 또는 프로세서를 활용해서 여러 작업을 동시에 처리하는 것을 말합니다.
+ 트랜잭션은 데이터베이스 관련 작업을 ACID 에 맞게 원자적, 일관적, 격리적, 지속적으로 처리하기 위한 개념
  + 여러 데이터베이스 작업을 하나의 논리적인 작업 단위로 처리

### 멀티프로세스와 멀티스레드
+ 프로그램는 코드의 집합, 그 프로그램이 ```RAM```에서 동작하는 상태가 프로세스
+ <span style="background-color:#fff5b1">하드에 저장된 리소스 및 코드로 구성된 프로그램을 실행하면, 메모리에서 프로세스로 동작하게 됩니다. 스레드는 한 프로세스 내에서 실행되는 동작의 흐름을 의미합니다.</span>
+ 컴퓨터의 멀티작업을 위해 프로세스만을 이용한 경우 컴퓨터 리소스를 너무 많이 차지하게 되는데, 스레드는 한 프로세스에서 heap 자원을 공유하면서 stack을 할당받는 형태이기 때문에 메모리 사용량이 상대적으로 작습니다.
+ 멀티 프로세스는 프로세스 여러 개로 동작하는 것, 메모리를 더 많이 소요하고 동작 시간이 많이 든다. 하지만 프로세스가 여러 개로 동작하기 때문에 보완이 가능하다.
+ 멀티 스레드는 한 프로세스 안에 여러 스레드가 동작하는 것
+ 어떤 프로그램이 멀티 프로세스인지 멀티 스레드로 도는 건지에 대해
  + 멀티스레드 언어: Java, C#
  + 멀티스레드 & 멀티프로세스 언어: Python, C, C++

### 로컬변수, 멤버변수, 전역변수
+ 세 가지 변수는 변수의 범위와 생명 주기를 통해 구별되면, 코드의 구조와 동작에 중요한 영향을 미칩니다.
+ 로컬변수는 <span style="background-color:#fff5b1">함수 내부</span>에서 선언하고 함수 실행도중에만 접근이 가능합니다.
+ 멤버변수는 <span style="background-color:#fff5b1">클래스 내부</span>에서 선언되며, 해당 클래스 객체가 존재하는 동안 접근이 가능합니다. 일반적인 객체의 속성을 의미합니다.
+ 전역변수는 <span style="background-color:#fff5b1">프로그램 전체 영역</span>에서 접근할 수 있는 변수입니다.

### 객체지향 프로그래밍
+ <span style="background-color:#fff5b1">데이터를 추상화하고 상태와 행위를 가진 객체로 만들어 객체 간 상호작용으로 프로그래밍하는 방법</span>
+ 객체는 데이터 또는 식별자에 의해 참조되는 공간
+ 객체지향 프로그램의 3대 요소: 캡슐화, 다형성, 상속
  + ~~4가지 특징과 달리 3요소에는 추상화가 빠지는데 왜 이런겨...~~
+ <span style="background-color:#fff5b1">추상화, 캡슐화, 상속, 다형성</span>
  + 추상화: 객체에서 공통된 속성과 행위를 추출
  + 캡슐화: 데이터 구조화 데이터를 다루는 방법을 결합시켜 묶는 것, class
  + 다형성: 하나의 변수명, 함수명이 상황에 따른 다른 의미로 해석될 수 있는 것
  
### class, instance의 차이
+ 클래스는 객체의 구조와 행동을 정의하고, 변수와 메서드로 구성되어 있습니다.
+ 인스턴스는 클래스를 기반으로 생성된 실제 객체! <span style="background-color:#fff5b1">클래스의 실체화된 형태</span>

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(f"{self.name} is barking!")

# 객체(인스턴스) 생성
my_dog = Dog(name="Buddy")
```

### 객체지향 디자인 패턴
> 생성패턴: Singleton, Factory Method, Abstract Factory, Builder, Prototype  
> 구조패턴: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy  
> 행위패턴: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor

+ Singleton 패턴
  + <span style="background-color:#fff5b1">특정 클래스의 인스턴스가 프로그램 전체에 하나만 생성되도록 보장하는 패턴</span>
  + 전역변수의 문제를 해결하고 리소스의 접근 제어나 중복 생성을 방지하는데 유용합니다.

```java
public static Singleton getInstance() {
    if (uniqueInstance == null) {
        uniqueInstance = new Singleton();
    }
    return uniqueInstance;
}
```

### Stateful와 Stateless의 차이점
+ <span style="background-color:#fff5b1">Stateless 시스템은 이전의 상호작용에 대한 정보를 저장하지 않습니다. 예, HTTP 프로토콜</span>
+ Stateful은 상태유지로 이전의 상호작용 정보를 저장하고 유지하는 웹 애플리케이션의 로그인 세션을 예로 들 수 있습니다.

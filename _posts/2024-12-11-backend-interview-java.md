---
title: 백엔드 개발자 면접대비 질문정리 - Java
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

### 자바의 스레딩
+ synchronized, java.util.concurrent 동시성 제어를 위한 유틸리티와 클래스 제공
+ Thread 클래스, Runnable 인터페이스로 메서드 구현

### Hibernate
+ ORM, JPA 지원
  + JPA는 자바 ORM 표준 명세이고, Hibernate는 JPA 명세의 구현체 중 하나
  + QueryDSL은 타입 세이프 쿼리 작성을 가능하게 합니다.

```java
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">

<hibernate-configuration>

    <session-factory>
        <!-- JDBC Database connection settings -->
        <property name="hibernate.connection.driver_class">com.mysql.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/your_db</property>
        <property name="hibernate.connection.username">your_username</property>
        <property name="hibernate.connection.password">your_password</property>

        <!-- JDBC connection pool settings -->
        <property name="hibernate.c3p0.idle_test_period">3000</property>

        // ...

        <!-- Mention annotated class -->
        <mapping class="com.example.Student"/>
    </session-factory>

</hibernate-configuration>
```

### 자바와 파이썬 차이, 장단점
+ Java
  + <span style="background-color:#fff5b1">자바는 컴파일 언어로 실행시간이 빠르고 큰 규모 애플리케이션에 적합, 다양한 플랫폼에서 실행가능</span>
  + 복잡해 보이거나 보일러 플레이트코드 사용으로 작성 시간이 오래 걸릴 수 있습니다.
+ Python
  + 간결하고 읽기 쉬운 문법이고, 빠른 개발 속도
  + 다양한 라이브러리를 제공하고 웹, 데이터 분석, 인공지능, 과학 연산 등 다양한 분야에 활용가능
  + 인터프리터 언어이며, 컴파일 언어에 비해 상대적으로 느린 실행 속도
    + <span style="background-color:#fff5b1">컴파일 언어는 소스 코드를 기계코드로 변환하는 컴파일 과정을 거치고, 컴파일러에 의해 수행됩니다.</span>
    + 인터프리터 언어는 소스 코드를 라인별로 해석하고 실행하고, 코드를 직접 실행합니다. 런타임에 오류를 발경하며 오류가 발생한 시점에서 프로그램이 중단됩니다. 
  + 동시성 처리에 제한적, 멀티스레딩과 멀티 프로세싱이 상대적으로 더 복잡할 수 있습니다.

### class, abstract class, interface
+ 모두 다 객체 지향 프로그래밍의 핵심 구성 요소
+ ```class```는 객체를 생성하기 위한 틀 똔느 설계도. 데이터(필드)와 메서드를 포함함
+ ```abstract class```는 추상 클래스로 완전하지 않은 추상 메서드를 포함해 하위 클래스에서 추상 메서드를 구현하게 하는 클래스
+ ```interface```는 메서드의 시그니처만 정의하고 구현은 제공하지 않는 틀로 메서드 구현 자체가 불가능(java 8 이후 default, static 메서드 구현을 포함 가능)
  + 대부분 언어에서 인터페이스의 다중 구현은 가능하나 추상 클래스는 단일 상속만 허용
  + 추상 클래스와 인터페이스는 인스턴스화 할 수 없습니다.

### public, protected, private
+ ```public``` 어디서든 자유롭게 접근 가능
+ ```protected``` 같은 패키지 내의 클래스 또는 서브 클래스에서 접근할 수 있음
+ ```default``` 접근제한자 별도 지정 안한 경우에 해당하며, 같은 패키지 내의 클래스만 접근가능, <span style="background-color:#fff5b1">서브 클래스에서 접근 불가</span>
+ ```private``` 해당 클래스에서만 접근 가능

### this, super
+ ```this``` 현재 클래스를 참조
+ ```super``` 부모 클래스를 참조

### static, final
+ ```static``` 
  + static 변수는 클래스 로드시 한 번만 메모리에 할당
  + static 메서드는 클래스 이름으로 호출가능
  + static 멤버는 클래스 로더에 의한 메모리 로드시 초기화
    + 클래스 레벨에서 동작하므로 클래스 인스턴스를 생성하지 않고도 접근이 가능
    + ```int field = ExampleClass.staticField;```
+ ```final``` 
  + final 변수는 값 변경 불가능
  + final 메서드는 하위 클래스 오버라이딩 불가능
  + final 클래스는 상속 불가
+ ```static fianl```
  + 필드에 사용되는 경우, 변하지 않는 상수로 모든 인스턴스가 공유
  + 메서드에 사용하는 경우, 오버라이딩 할 수 없는 정적 메서드 선언시 사용
+ <span style="background-color:#fff5b1">```final``` 필드가 클래스의 모든 인스턴스에 대해 동일한 값을 가져야 하는 경우 ```static final```을 사용하는 것이 좋습니다. 그러나 ```final``` 필드가 인스턴스별로 다른 값을 가져야 하는 경우에는 ```static final```을 사용하면 안 됩니다.</span>
+ **Java best practice**
  + 변수 설정시
    + 값이 변경되지 않아야 하면 ```final```, 모든 인스턴스가 공유해야 하는 경우 ```static```, 모든 인스턴스 공유하면서 값 변경이 안 되어야 하면 ```static final```
  + 메서드 설정시
    + 오버라이딩 불가하게 하려면 ```fianl```, 인스턴스 생성하지 않고도 호출해야 하는 메서드에서 ```static```
  + 클래스 설정시
    + 상속 불가시 ```final```

### 데이터 타입 중 primitive type, reference type
+ primitive type 기본타입
  + ```byte```, ```short```, ```int```, ```long```, ```float```, ```double```, ```char```, ```boolean```
+ reference type 참조타입
  + 객체의 메모리 주소를 저장하는 타입 (실제 데이터 X)
  + 클래스, 인터페이스, 열거, 배열 등

### process와 thread 차이 및 용도, 그리고 어떻게 만들 수 있는지
+ [멀티프로세스와 멀티스레드](/study/2023/10/25/Interview.html#멀티프로세스와-멀티스레드) 참조
+ 프로세스는 프로그램의 인스턴스이며 하나 이상의 스레드를 갖습니다.
+ 스레드는 프로세스 내에서 실행되는 독립적인 실행경로, 프로세스의 메모리와 자원을 공유
+ ```Thread``` 클래스를 확장하거나 ```Runnable``` 인터페이스를 구현하여 스레드를 생성할 수 있습니다.

### 직렬화란?
+ 객체의 상태를 바이트 스트림으로 변환하는 프로세스
+ 데이터 영속성을 유지하며 다시 객체 상태로 사용할 수 있도록 합니다.
+ ```Serializable``` 

```java
import java.io.*;

class Person implements Serializable {
    String name;
    int age;
    
    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

public class SerializationExample {
    public static void main(String[] args) {
        Person p1 = new Person("John Doe", 25);
        
        // 직렬화
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("person.ser"))) {
            out.writeObject(p1);
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // 역직렬화
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream("person.ser"))) {
            Person p2 = (Person) in.readObject();
            System.out.println(p2.name + ", " + p2.age);  // 출력: John Doe, 25
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

### @Override
+ 자바에서의 오버라이딩 명시로 <span style="background-color:#fff5b1">컴파일 시점</span>에서 오류를 잡을 수 있게 합니다.
+ 오버라이딩(Overriding)은 객체 지향 프로그래밍에서 사용되는 개념으로, 하위 클래스가 상위 클래스의 메서드를 자신의 클래스 내에서 재정의할 수 있게 하는 것을 의미합니다.
+ <span style="background-color:#fff5b1">동적 바인딩 지원</span>

### 배열과 ArrayList의 차이
+ 배열은 선언시 <span style="background-color:#fff5b1">크기고정, 기본 데이터와 객체 모두 저장 가능</span>, 인덱스 접근이 빠르나 확장성이 떨어집니다.
+ ArrayList는 크기를 동적으로 조정하며, 객체 타입으로 저장합니다. 다양한 메서드를 기본적으로 제공

### try, catch, finally의 개념 및 용도
+ 예외 발생할 수 있는 코드를 ```try``` 처리하고, ```catch```로 예외 처리를 진행하고, ```finally```로 ```try```, ```catch``` 실행 후 항상 처리할 작업을 수행합니다.

  

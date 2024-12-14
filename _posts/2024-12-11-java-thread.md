---
title: 스레드와 동시성 프로그래밍
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Java]
tags: [Java, 스레드, 동시성 프로그래밍]
pin: false
math: true
mermaid: true
---

오랫만에 공부를 하면서 스레드에 대한 부분을 공부하게 되어서 다시 개념을 간략하게 정리했습니다.

#### 동시성 프로그래밍
동시성 프로그래밍은 여러 작업이 동시에 실행되는 프로그래밍 패러다임을 말합니다. 멀티프로세스와 멀티스레드를 활용하여 작업을 분리하고 동시에 처리함으로써 시스템의 성능을 향상시키는 기술적인 접근 방식입니다.  
멀티 프로세스는 여러 사람이 동시성을 처리하는 방식이라면, 멀티 스레드는 한 사람이 빠르게 일을 처리하는 방식의 느낌이라고 할 수 있습니다. 한 프로세스는 여러 스레드를 가지고 동시성 제어를 할 수 있습니다.  스레드는 커널에 의해 자동으로 스케쥴됩니다. 멀티 스레드는 공유된 메모리 공간을 사용하기 때문에 프로세스 내 자원 공유와 통신이 쉽습니다.

#### 스레드의 구현
자바에서 스레드는 `Runnable` 인터페이스를 구현하거나 `Thread`를 상속 받아서 스레드를 만들 수 있습니다. 일반적으로 `Runnable` 인터페이스를 구현하는 방법이 더 선호되며, 자바에서는 스레드 풀 등과 같은 다양한 도구들이 `Runnable`을 기반으로 동작하기 때문에 더 모듈화하고 유연하게 사용할 수 있습니다.

```java
class MyRunnable implements Runnable { 
	@Override 
	public void run() { // 스레드가 수행할 작업 정의 } 
}

Thread thread = new Thread(new MyRunnable()); 
thread.start();
```
```java
public class MyThread extends Thread { 
	@Override public void run() { // 스레드가 수행할 작업 정의 } 
} 

Thread thread = new MyThread();
```
그 외에는 ```synchronized```, ```volatile``` 등으로 스레드 간 동기화를 구현할 수 있습니다. 여러 스레드가 공유 자원을 수정하려고 할 때, 동기화를 위해 구현됩니다. ```synchronized```는 코드 블럭, 메서드에, ```volatile```는 변수 선언시에 변수 값이 메인 메모리에서 쓰여지도록 보장합니다.

#### 스레드 종류
스레드는 크게 사용자 스레드와 데몬 스레드로 나뉩니다.   
사용자 스레드는 주로 사용자가 생성한 스레드로 메인 스레드도 사용자 스레드에 해당합니다. 프로그램의 주된 작업을 처리하며 사용자 스레드 활동 중에는 프로그램이 계속 실행됩니다.   
반면, 데몬 스레드는 보조적인 역할을 하는 스레드로 백그라운드에서 주기적인 작업을 수행하는 경우에 사용됩니다. 대표적으로 가비지 컬렉션 스레드, 자바 NIO 등에서 활용됩니다. 스레드 실행전 스레드에 ```.setDaemon(ture)```설정을 해주므로써 데몬 스레드로 지정할 수 있습니다. 실행 후 지정하려고 하면 IllegalThreadStateException이 발생합니다.  
모든 사용자 스레드가 종료되면 JVM은 종료되고 데몬 스레드는 끝까지 완료할 수 없습니다.

#### JVM과 스레드
멀티 스레드 환경에서 JVM은 스레드 간 전환과 스레드 상태를 저장해서 관리합니다. 프로세스가 실행되면 메인 스레드가 생성되고 JVM 프로세스가 시작되는데 이 때 메모리를 할당받습니다.    
자바는 Green Thread에서 Native Thread 모델로 변화해왔고,  Native Thread는 OS 수준의 커널 공간에서 관리되는 스레드 모델을 말합니다. 하지만 점차 많은 I/O 작업들로 인해 스레드가 스레드 작업이 중단된 상태에서 톰캣 내부 큐에 계속 쌓여 대기하는 상태가 발생합니다. 즉 긴 대기 상태로 인해서 에러가 반환되게 됩니다.  
이를 해결하기 위해 가상스레드 개념이 도입되었습니다. (JDK21, 2023 9월) OS가 아니라 JDK에서 제공하는 경량화된 user-mode 스레드로 컨텍스트 스위칭 비용을 줄일 수 있는 모델입니다. JVM에 의해 생성되고 커널 영역의 호출이 적으며, 메모리 크기가 일반 스레드의 1%로 작기 때문입니다.

---
+ [Thread 라이프 사이클과 스레드 우선순위로 보는 데몬 스레드와 비데몬 스레드](https://colevelup.tistory.com/31)
+ [기존 자바 스레드 모델의 한계와 자바 21의 가상 스레드(Virtual Thread)의 도입](https://mangkyu.tistory.com/309)
+ [동시성 프로그래밍 Concurrent Programming](https://velog.io/@jungbumwoo/%EB%8F%99%EC%8B%9C%EC%84%B1-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D-Concurrent-Programming)
+ [Java의 미래, Virtual Thread](https://techblog.woowahan.com/15398/)

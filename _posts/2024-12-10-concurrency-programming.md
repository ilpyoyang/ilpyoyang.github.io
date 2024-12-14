---
title: 언어별 동시성 프로그래밍 
author: ilpyo
date: 2024-12-10 11:33:00 +0900
categories: [CS, Basic]
tags: [발표자료, 동시성 프로그래밍]
pin: false
math: true
mermaid: true
---

> [PPT 전체 발표자료 보러가기](https://drive.google.com/file/d/1NRNdSBE9hjIErCJamgXDpgaMjXx_OWQH/view?usp=sharing)

<img src="/assets/post_images/cs/helloworld24/concurrency1.jpg">

### 들어가며
저는 이번 2024년 Hello World 발표 주제로 언어별 동시성 프로그래밍을 선정했었습니다! 3월 30일이었으니까 벌써 1달이 지났네요.  
난이도가 정말 어려운 주제였지만 제게 필요하고 저와 같은 다른 주니어들에게 필요하고 한 번쯤 생각해 볼 만한 주제!라고 생각해서 발표주제로 선정했습니다. 발표를 준비하면서 많은 분들의 도움을 얻었고 저 역시 깊게 생각해보는 좋은 기회가 되지 않았을까 생각합니다. 그리고 발표 내용을 정리하면서 복기하기 위해 블로그에 일부 내용을 정리하게 되었습니다.

#### 먼저 동시성 프로그래밍하면 나오는 단어들을 정리해봤습니다.
동시성이란 병행적 개념으로 실제로 한 번에 일이 처리되는 것 같지만, 단일코어의 컨텍스트 스위칭과 같이 여러 작업이 진행되는 것을 의미합니다. 반면, 병렬성이란 물리적으로 작업들이 분리되어 실행되는 것을 의미하는데 멀티코어, 멀티 프로세서 같은 구조로 병렬성이 가능합니다. 동시성 프로그램밍에서 동시성과 병렬은 보완적 개념으로 함께 사용되어 성능과 효율성을 높이기 위해 함께 사용됩니다.  
멀티프로세스와 멀티스레드는 말그대로 프로세스가 여러 개, 스레드가 여러 개인 개념입니다. 프로세스가 메모리 할당을 필요로 하기 때문에 멀티 프로세스는 리소스 사용량이 높다는 단점이 있습니다. 반대로 멀티스레드는 한 프로세스 내에서 여러 스레드를 두고 빠른 작업을 처리할 수 있게 합니다. 한 프로세스 내에서 동작하기 때문에 동기화 문제가 발생할 수 있다는 단점이 있습니다.  
프로세스 흐름 제어 방식으로는 동기와 비동기가 있습니다. 동기는 작업이 모두 완료되면 다른 작업을 순차적으로 실행한다면, 비동기는 블로킹 작업이여도 다른 작업을 실행하고 다른 작업과의 의존성을 줄일 수 있게 됩니다.

<img src="/assets/post_images/cs/helloworld24/concurrency2.jpg">

### Java와 동시성 프로그래밍
Java는 Runnable 인터페이스로 구현하며, 오버라이드된 run 메서드로 스레드에서 실행될 내용을 구현합니다. 메서드나 코드 블록의 동기화는 synchronized로 지원하는데, 감소 연산자(예로 들면, availableTickets--;)와 같은 부분을 하나의 원자성 작업으로 실행될 수 있도록 해줍니다.

<p style="text-align: center; margin: 50px 0">
    <img src="/assets/post_images/cs/helloworld24/concurrency3.jpg">
</p>

#### Virtual Thread
preview 19, 21 버전부터 Java는 Virtual Thread를 제공하는데 아마 다른 언어들에서 적용된 경량 스레드 개념을 제공해야하지 않나 하는 즉, 기존의 1:1 매핑의 JVM 스레드 개념을 개선하기 위한 취지로 나온 것입니다. 경량화된 user-mode 스레드 개념을 도입하므로서 OS 스레드와 직접적으로 연결되지 않고 Carrier Thread에 연결해 컨텍스트 스위칭 비용과 Blocking 타임을 낮추는 것을 말합니다. Virtual Thread는 Executor와 Thread 클래스 빌더 개념을 사용해서 만들 수 있습니다.  
synchronized, native 메서드를 사용하는 경우에 대해 Carrier Thread에 pin되어 성능이 저하되는 경우가 발생합니다. 따라서 특정 플랫폼 스레드에 고정시켜 JVM의 자유로운 스레드 관리를 방해하게 되는 문제가 생깁니다. Spring에서는 동기화 처리에 대해 synchronized를 사용하는 부분들을 점차 ReentrantLock을 사용한 방식으로 전환하고 있습니다.  
ReentrantLock 역시 Java에서 지원하고 있던 개념이지만, 명시적으로 락의 시점을 제어하기 때문에 JVM 내부적으로 구현된 synchronized에 의한 Virtual Thread 활용에 대한 대응을 할 수 없다는 단점이 있습니다. - ReentrantReadWriteLock을 이용하면 read와 write락을 따로 구분해서 적용할 수 있는데, 읽기 작업의 병렬성을 가능하게 하기 때문에 블로킹 처리에 더 유연하게 대처할 수 있습니다.


### Kotlin과 동시성 프로그래밍
Kotlin도 JVM에서 실행되기 때문에, Java의 Thread 클래스와 같은 기본적인 스레드 모델을 공유합니다. Java에는 없는 코틀린의 특별한 경량스레드 coroutine에 대해 알아보겠습니다. coroutine은  비동기 프로그래밍에 중요한 개념으로 어셈블리 프로그램부터 있던 개념입니다. 즉 단어 자체는 코틀린에서 생긴 개념은 아닙니다.

#### Corutine
먼저 구성을 살펴보면, 코루틴 스코프, 코루틴 콘텍스트, 코루틴으로 되어 있는 것을 볼 수 있습니다. 코루틴 스코프는 생명주기를 정의하고 메모리 누수를 관리합니다. 코루틴 콘텍스트는 코루틴의 생명주기를 관리하고 코루틴이 실행될 스레드를 결정합니다. 스코프, 콘텍스트, 코루틴 자체는 그림에서는 완전 분리된 것처럼 보일 수 있지만 각각 밀접한 관련이 되어 있습니다.  여기서 코루틴이 실제 실행에 필요한 코드를 담고 있다면, 컨텍스트의 Job은 코루틴의 상태 값을 가지고 있어 메타데이터를 담고 있는 개념으로 이해할 수 있습니다.

<img src="/assets/post_images/cs/helloworld24/concurrency4.jpg">

##### Continuation Passing Style  
코루틴은 heap에 위치해서 하나의 스레드 안에서 별도의 context switching 없이 스케쥴링을 가능하게 합니다. 코루틴의 작업을 스레드가 할당받아서 처리를 하다가 중단되는 경우, 다른 스레드에 이어서 다시 작업을 진행할 수 있습니다. 이걸 가능하게 하는 것이 바로 CPS 패러다임으로 Continuation Passing Style이라고 합니다.  
CPS 측면에 대해 코드로 살펴보겠습니다. 코틀린에서는 중단함수(suspend 함수)은 코루틴 내에서 비동기적 작업을 수행합니다. 이 때 이 중단함수를 디컴파일 하면, 코루틴 작업이 중단되었을 경우 이어서 작업 진행이 가능하도록 Continuation 객체와 State Machine이 생성됩니다. Continuation 객체는 State Machine과 함께 작동하여 중단 함수의 실행을 관리하고 완료된 후에는 결과를 반환합니다. State Machine은 중단 함수의 실행 흐름을 제어하고 중단된 상태를 유지합니다. 즉, State Machine을 사용하므로써 중단점 레이블에서 작업 실행을 재개할 수 있게 됩니다.

##### Structured Concurrency  
코틀린의 Structured Concurrency는 흔히 말하는 부모-자식의 계층적 구조를 말하며, 그 계층 구조 내에서 일관된 패턴을 갖게 되는 것을 말합니다. 따라서 그 최상위 스코프가 취소되는 경우 그 안의 코루틴도 모두 함께 취소된다는 특징을 갖습니다.

#### Flow
Flow는 비동기 데이터 스트림을 다루기 위한 API로 코루틴은 아니지만, 코루틴과 함깨 사용되어 시간이 지남에 따라 구독자가 요청(collect)을 호출하멩 따라 데이터를 하나씩 생성, 방출하는 콜드 스트림입니다. return 값이 여러 개라는 점에서 suspend 함수와 차이가 있습니다. 주로 네트워크 호출이나 데이터베이스 쿼리와 같이 비동기적으로 발생하는 이벤트를 처리할 때 사용됩니다.

 

### Go와 동시성 프로그래밍
Go라고 하면, 가장 먼저 Go스러움에 대해 설명할 수 있는데 안정적이고 가볍고 빠르고 동시성을 지원하는 언어적 특징을 가지고 있습니다.  
안정적이라는 말은 타입 안정성을 지원해서 interface와 같은 빈 인터페이스를 사용하며, type assertion이나 reflect를 이용하는 것을 지양하는 것을 말합니다. Java를 사용하면서 간혹 프로젝트에서 reflection에 대한 안정성이 우려스러운 부분을 본 적이 있는데, 반면 Go는 타입 검사를 통해 안정성을 추구합니다.  
그리고 Spring MVC와 같은 무거운 개발 방식보다는 간결하고 빠르게 개발을 할 수 있는 경량화된 프레임워크들을 사용합니다.  
동시성에 대한 지원은 goroutine과 channel으로 이뤄지는데 이 포스팅에서는 이 부분에 대해 간략하게 살펴보겠습니다.

<img src="/assets/post_images/cs/helloworld24/concurrency5.jpg">

### Gorutine
코틀린에 코루틴이 있다면 고 언어에는 고루틴이 있습니다. 이것도 앞서 살펴본 코루틴처럼 경량 스레드 개념입니다. 그래서 동일하게 그래서 비용이 OS에 의한 Process, Thread의 Context Switching에 비해 현저히 낮습니다.  
**GMP 모델**은 Go에서 Go runtime이 thread를 관리하는 방법을 말합니다. 위의 이미지에서 각각 G, M, P 부분을 찾을 수 있습니다. 여기서 G는 고루틴, M은 머신(OS레벨 스레드), P는 proccessor를 의미합니다. 그림에서는 쉽게 표현하기 위해 저렇게 도식화했지만 실제 1:1:1 매핑은 아닙니다.  
고루틴 스케쥴러에 의해 고루틴이 Machine에 할당될 때 Processor에 의해 매칭되는데 이 때 각 Processor에 해당되는 즉, LRQ(Local Run Queue)에 고루틴이 있다면 여기 있는 고루틴 작업을 하게 되고, 없다면 GRQ(Global Run Queue)에 있는 고루틴 작업을 수행하게 됩니다. 고루틴에 의한 비동기적 처리는 해당 함수 앞에 `go`를 표기하므로서 간단하게 고루틴을 사용할 수 있습니다.

#### 그렇다면, Virtual Thread, Corutine, Gorutine은 뭐가 다른걸까?
발표 준비 기간과 발표 당시에 여러 언어 현업자들과 함께 이 부분에 대해 논의를 많이 해봤습니다. 그런데 결과적으로 뚜렷하게 이 언어의 경량스레드 모델이 다른 것과 다소 차이는 있고 어떤 상황에서 저걸 사용하는게 좋다라는 의견을 제시할 수는 있었지만 제가 생각하는 것만큼 명확한 답을 내리지 못했었습니다. 그래서 발표 때 비교장표를 보여드릴 수 없어서 아쉬웠습니다.
발표가 끝나고 이 부분에 대해 더 알아보고 내린 결론은 좀 더 OS Thread에 밀접한 연관이 있고 기존 프로젝트가 Java을 사용하는 언어에서는 Virtual Thread를 빠르게 도입하는 것이 유리합니다. Corutine, Gorutine은 경량 스레드라고 불리지만 결국에는 비동기적 측면에 Virtual Thread는 아이에 Thread를 확장한 개념으로서 서버 사이드적 측면에서 접근해야 한다는 결론에 도달했습니다.
+ Virtual Thread는 Blocking I/O가 발생되는 경우, Virtual Thread가 새로 생성되기 때문에 문제가 되지 않습니다. Carrier Thread를 yield하고 자신이 가진 정보를 heap에 올리기 때문입니다. 
  + `Instead, virtual threads automatically give up (or yield) their carrier thread when a blocking call (such as I/O) is made. This is handled by the library and runtime [...]`
+ 코루틴은 이벤트 핸들링 처리에서 상태 업데이트에 Blocking I/O가 존재하는 경우, main thread가 영향을 받거나 다른 응답처리가 안될 수 있습니다.

### Channel
Go 언어는 "Do not communicate by sharing memory, share memory by communicating"라는 철학에 따라 설계되었습니다. 통신에 의한 메모리 공유라는 핵심철학을 가지고 있고 이 원칙은 고루틴들이 직접 메모리를 공유하고 않고, 대신 채널을 통해 메시지를 주고 받으며 데이터를 교환한다는 의미입니다. 채널은 고루틴들 사이에서 데이터를 안전하게 전송할 수 있는 파이프라인으로 데이터 경합 발생가능성을 줄이고, 순차처리를 통해 안전한 데이터 교환이 가능하게 합니다. 또한 채널을 사용하므로서 데이터 흐름을 명확하게 볼 수 있고 디자인 패턴 구현이 다양해집니다.
Go 언어의 기본적인 동시성 패턴으로 Worker pool pattern, Pipe pattern, Fan-out/Fan-in pattern 등을 가지고 있는데 대표적인 이 3가지 패턴의 특징은 다음과 같습니다.

#### Worker pool pattern  
스레드 풀과 유사한 개념으로 일정 수의 고루틴(워커)를 생성하여, 작업 큐에서 작업을 가져와 처리하는 구조입니다. 이 패턴은 리소스 사용을 효율적으로 관리하고, 고루틴 생성과 종료에 따른 오버헤드를 줄일 수 있습니다. 워커 풀은 병렬 작업 처리에 특히 유용합니다.

#### Pipe pattern  
일련의 처리 단계를 통해 데이터를 전달하는 방식으로 순차적 전달되므로 그 데이터 흐름을 파악하는데 유용합니다. 각 단계는 채널을 받아서 다음 단계에 채널을 리턴하는 방식으로 진행됩니다.

#### Fan-out/Fan-in pattern  
Fan-out/Fan-in은 특히 다량의 데이터 처리나 복잡한 연산을 병렬로 수행하고 결과를 집계할 때 유용하며, 워커 풀 패턴보다 동적으로 고루틴을 생성하고 관리하는 경향이 있습니다.

 
### Typescript와 동시성 프로그래밍
Typescript는 타입이 들어간 JavaScript의 상위 집합 언어로 JavaScript의 동시성 모델을 따릅니다.

<img src="/assets/post_images/cs/helloworld24/concurrency6.jpg">

#### 브라우저 동작원리  
먼저, 일반적인 브라우저 동작원리를 먼저 살펴보겠습니다. 브라우저는 필요한 변수 등을 Heap에 담아두고 console에 출력하는 등의 간단한 실행은 Stack에 두고 하나씩 실행됩니다. 하지만 Web API를 사용해야 하는 경우에는 Task를 Task Queue에 쌓아두고 Stack이 비었을 때 Event loop를 통해서 실행되게 됩니다. 즉, 싱글 스레드 조건에서 비동기 프로그래밍을 가능하게 하는 건 바로 Task Queue가 있기 때문입니다. (Web API의 예로는 setTimeout, ajax 등이 있습니다.)  
브라우저에서 JavaScript 코드가 실행될 때, 비동기 작업을 처리하기 위해 Promise와 Await를 사용할 수 있습니다. 예를 들어, 웹 페이지가 로드될 때 이미지를 비동기적으로 다운로드하고, 다운로드가 완료되면 화면에 표시할 수 있습니다.  

Promise는 미래에 완료될 작업을 대표하는 객체이며, 성공 또는 실패의 결과와 함께 처리될 수 있습니다. Await는 프로미스 기반의 비동기 작업을 보다 동기적으로 보이는 코드 스타일로 작성할 수 있게 해 주는 문법적 설탕(syntactic sugar)입니다. 코드의 가독성과 유지보수성을 향상시킬 수 있지만, Promise chaining 이슈와 콜백 지옥 가능성을 완전히 배제할 수는 없습니다.

### Swift와 동시성 프로그래밍
Swift에서는 WWDC에서 언급된 Swift concurrency을 중심으로 정리했습니다.

#### Grand Central Dispatch  
GCD는 Grand Central Dispatch로 뉴욕의 기차역 그랜드 센트럴 터미널의 이름에서 유래한 것으로 GCD는 다양한 멀티스레딩 작업을 쉽게 관리할 수 있는 API를 제공합니다.  쉽게 말해 비동기 상황에서 GCD는 여러 Task를 여러 스레드에 분배하는 역할을 합니다.  
그럼 이 디스패치 큐는 한 종류인가? 아닙니다. Main, Global, Custom 큐들이 있는데 이 중에서 Global 큐과 설정에 따라 Custom 큐는 Concurrent Queue로 사용될 수 있습니다. Concurrent Queue는 여러 work item 을 한 번에 처리할 수 있기 때문에, 모든 CPU 코어가 포화될 때까지 시스템은 여러 스레드를 불러옵니다. 여기서 잘못된 스레드 관리와 코드 설계는 Thread explosion으로 코어를 넘어가는 스레드 생성이 비효율을 발생시킬 수 있습니다.

#### Swift concurrency
언어 수준에서 비동기 작업을 지원하기 위한 것으로 GCD와는 차이가 있습니다. GCD는 저수준의 C언어 기반 API로 직접 CPU 및 스레드를 이용하기 때문입니다. Task, Actor는 언어 레벨에서 동시성을 다루기 때문에 디버깅과 흐름을 파악하는데 좀 더 용이합니다.

##### Task  
Task는 Swift 5.5에서 도입된 async/await 문법을 사용하여 비동기 코드를 작성할 수 있는 고수준 추상화입니다. Task는 실행 중인 작업을 취소할 수 있는 기능을 제공합니다. 이는 비동기 작업을 중단하고 관련 리소스를 해제하는 데 유용합니다. async/await 만을 사용할 때는 호출을 위한 async 처리를 호출을 하는 곳에서도 처리를 하는 등 번거로운 점이 있었지만, Task 사용으로 각 Task별로 독립적으로 비동기 작업 수행이 가능해집니다.

##### Actor  
상태를 안전하게 캡슐화하고, 동시성 접근을 관리하는 고수준 추상화로 Task를 직렬화해서 한 번의 한 Task만 Actor 타입 접근을 가능하게 합니다. 접근시에도 내부 값들은 isolated 상태로 self 참조로 접근을 할 수 있게 한다는 특징이 있습니다. 따라서 Data race를 유발하지 않는다는 장점이 있습니다.

<img src="/assets/post_images/cs/helloworld24/concurrency7.jpg">

### Dart와 동시성 프로그래밍

##### Future  
비동기 결과의 값, 즉 미래의 값을 갖는 추상적인 클래스입니다. 자바스크립트 Promise와 유사하며, 단일 비동기 작업의 결과에 따라 추가 작업을 연결할 수 있는 체이닝(chaining) 메커니즘을 제공합니다. Dart의 Future에서는 then, catchError, whenComplete 메서드가 있습니다.

##### Stream  
연속적인 이벤트를 처리하는 데 사용됩니다. Stream 자체는 다른 언어에서도 이벤트 처리르 위해 많이 사용되는 개념으로 시간의 지남에 따라 발생하는 이벤트 처리가 가능해집니다. listen 메서드로 이벤트를 수신하고 처리할 수 있습니다.

##### isolate  
각각의 isolate는 독립적인 메모리 공간을 가지고 channel로만 통신을 하는 컨텍스트입니다. 주로 긴 시간이 걸리는 작업을 처리하거나 정책상 관심사 분리를 위해 현업에서 선택하는 경우가 있다고 들었습니다. isolate를 사용하게 되면 아이에 다른 pid를 가지기 때문에 완벽한 분리가 이뤄지지만, 이 정도의 분리가 필요한 작업인 경우에 다른 모듈 또는 프로젝트로 구성하는 경우도 많기 때문에 isolate를 사용하는 경우는 실제 많지 않다고 합니다.

### 발표 내용을 정리하면서
발표주제로 너무 크고 다양한 언어의 차이?를 다루려는 욕심에 개개의 언어에서의 동시성에 대한 부분을 더 다루지 못했다는 부족함이 있었습니다. 개인적으로도 모든 언어를 다 현업에서 다뤄보지 않았었기 때문에 엄청난 확신과 자신감에 찬 발표를 준비하지 못했기에 아쉬움이 남습니다. 하지만 이런 기회가 없었다면 백엔드 개발자라는 틀에 갇혀서 다른 언어에 대한 고민이나 생각들을 하지 못했을 것 같습니다. 올해는 다양한 언어를 다뤄보고 제 스택은 좀 더 깊이 있게 고민해볼 수 있는 계기를 만들어 보겠습니다! 🫡

---
+ [Project loom, what happens when virtual thread makes a blocking system call?](https://stackoverflow.com/questions/70174468/project-loom-what-happens-when-virtual-thread-makes-a-blocking-system-call)
+ [Coroutines and Loom behind the scenes by Roman Elizarov](https://youtu.be/zluKcazgkV4)

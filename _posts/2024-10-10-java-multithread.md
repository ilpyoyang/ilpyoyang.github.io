---
title: Java 멀티스레딩, 병행성 및 성능 최적화
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Java]
tags: [멀티스레딩]
pin: false
math: true
mermaid: true
---

글또 9기 활동을 하면서 Udemy 지원을 받아 듣게 된 강의 내용을 정리한 페이지입니다.

### 1. 개요
멀티스레드는 응답성과 성능을 위해 필요합니다.
멀티스레드 환경에서는 응답을 동시에 처리할 수 있기 때문에 동영상이 진행중에도 UI로 마우스를움직여 다른 작업을 처리할 수 있습니다. 작업이 동시에 실행되는 것처럼 보이는데 사실은 Task에 따른 스레드들을 나누어 처리하고 있기 때문에 이런 병행성이 가능합니다. 멀티 스레드를 사용하면 많은 코어가 필요하지 않습니다.
싱글 스레드를 사용하는 것보다 많은 서비스를 처리하기 때문에 기계 대수를 줄이고 하드웨어 비용을 절감할 수 있습니다.

운영체제는 하드 디스크에서 메모리로 로드되고 운영체제는 하드웨어 CPU 사이 상호작용을 돕습니다. 각 애플리케이션들은 디스크에서 실행과 동시에 운영체제에 의해 프로그램을 메모리로 가지고와서 프로그램 인스턴스를 생성합니다.
각 프로세스는 독립적이며 내부는 PID, Code, Heap Data, Files, 메인 스레드로 구성됩니다. 이 때 메인 스레드 외에 다른 스레드를 가지고 있다면 멀티스레드로 동작하는 프로세스인 것을 알 수 있습니다. 스레드는 스텍을 가지는데 지역변수를 가지고 있고, `instruction pointer`를 가지고 있어
다음 명령어 주소를 가리키는 역할을 합니다.

+ [프로세스의 구조 추가조사](https://velog.io/@gndan4/OS-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EA%B5%AC%EC%A1%B0)
  + 함수를 실행하게 되면 함수가 리턴될 주소가 스텍이 저장되고 지역 변수들도 차례로 스택에 쌓이는데, 함수 실행 후에는 스택 데이터들이 차례로 사라지고 리턴될 주소도 지원지고 리턴될 곳으로 이동됩니다.
  + 스택 프레임
+ [프로세스 상태와 계층구조](https://www.youtube.com/watch?v=wz9C_vqME8g&ab_channel=%ED%95%9C%EB%B9%9B%EB%AF%B8%EB%94%94%EC%96%B4)  
  + 프로세스의 상태를 PCB에 기록해서 관리를 합니다. 수많은 프로세스를 계층적으로 관리, 운영체제 마다 프로세스 상태는 5가지가 있다. 생성, 준비, 실행, 대기(blocked status), 종료 상태
  + 부모 프로세스는 `fork` 시스템 호출로 자신의 복사본 자식 프로세스를 생성, 자원 상속
  + 자식 프로세스는 `exec` 메모리 공간을 새로운 프로그램을 덮어쓰기, 코드/데이터 영역은 실행할 프로그램 내용으로 바뀌고 나머지 영역은 초기화

> *혼자 공부하는 컴퓨터 구조 운영체제*
> 한빛 미디어 강의를 다 들어보는 것도 좋을 것 같다..!

##### 컨텍스트 스위치
동시에 많은 스레드를 다루는 것은 쉽지 않다. 다른 스레드로 전환할 때는 기존의 모든 데이터를 저장하고 다른 스레드의 리소스를 cpu에 복원해야 합니다.

##### 스레드 스케쥴링
기아현상이 발생될 수 있기 때문에 운영체제가 cpu에 스레드를 공평하게 배치할 때는 여러 문제점들을 고려해야 합니다. 운영체제는 에포크에 맞춰 시간을 적당한 크기로 나눕니다. 그리고 스레드의 타임 슬라이스를 종류별로 에포크에 할당합니다.  
스레드에 시간을 할당하는 방법은 운영체제가 우선순위를 정하는 방법에 달려있습니다. 인터렉티브한 스레드에 우선순위를 두고, 스레드 자체는 생성과 파괴가 훨씬 쉽고 하나의 프로세스 안에서 여러 스레드를 사용해서 병행처리를 하면 더 빠르고 효과적으로 수행할 수 있습니다.  
보안과 안전성을 위해서는 하나의 프로세스에서 실행되는 것이 좋습니다.  

<br><br>

### 2. 스레딩 기초 - 스레드 생성
##### 스레드 기능과 디버깅
`Runnable` 인터페이스를 이용해서 스레드를 생성할 수 있습니다. 여기서 스레드를 이용하는 것 외에도 이 스레드가 있다는 것만으로도 리소스를 계속 소비하고 있기 때문에 스레드를 바르게 관리하고 애플리케이션 정리를 할 수 있는 방법에 대해서 고민해야 합니다.
```java
public static void main(String[] args) throws InterruptedException {
    Thread thread = new Thread(new Runnable(){
        @Override
        public void run() {
            Thread.currentThread().getName();
        }
    });
    thread.setName("New Worker Thread");
    thread.setPriority(Thread.MAX_PRIOPITY);
    
    Thread.currentThread().getName();
    thread.start();
    Thread.currentThread().getName();
    
    Thread.sleep(1000);
}
```
```java
public static void main(String[] args) throws InterruptedException {
    Thread thread = new Thread(new Runnable(){
        @Override
        public void run() {
            throw new RuntimeExcpetion("Intentional Exception");
        }
    });
    
    thread.setName("Misbehaving thread");
    
    thread.setUncaughtExceptionHandler(new Thread.UncaughtExcpetionHandler() {
        @Override
        public void uncaughtException(Thread t, Throuable e) { 
            t.getName();
            e.getMessage();
        }
    })
}
```
##### 스레드 상속
```java
public static void main(String[] args) throws InterruptedException {
    Thread thread = new NewThread();
    thread.start();
}

private static class NewThread extends Thread {
    @Override
    public void run() {
        Thread.currentThread().getName();
    }
}
```

#### Quiz
하나의 프로세스에 속한 다수의 스레드는 다음 항목을 공유합니다.
+ 힙
+ 코드
+ 프로세스의 열린 파일
+ 프로세스의 메타 데이터

```java
Thread thread = new Thread(new Runnable() {
  @Override
  public void run() {
     System.out.println("Executing from a new thread");
  }
});
```
이 코드에는 스레드를 생성하고 `thread.start()` 호출을 통해 시작될 경우, 새 스레드의 `run()` 메서드 안에 있는 코드를 실행하게 됩니다.

##### 코딩 연습 1: 스레드 생성 - MultiExecutor
```java
import java.util.*;

public class MultiExecutor {

    public MultiExecutor(List<Runnable> tasks) {
        for(Runnable thread:tasks){
            thread.run();
        }
    }

    public void executeAll() {
        Thread thread1 = new Thread("thread1");
        Thread thread2 = new Thread("thread2");
        List<Runnable> list = new ArrayList();
        list.add(thread1);
        list.add(thread2);
        new MultiExecutor(list);
    }
}
```

##### 코딩 연습 2: 스레드 생성 - MultiExecutor 솔루션
```java
import java.util.ArrayList;
import java.util.List;
 
public class MultiExecutor {
    
    private final List<Runnable> tasks;
 
    /*
     * @param tasks to executed concurrently
     */
    public MultiExecutor(List<Runnable> tasks) {
        this.tasks = tasks;
    }
 
    /**
     * Executes all the tasks concurrently
     */
    public void executeAll() {
        List<Thread> threads = new ArrayList<>(tasks.size());
        
        for (Runnable task : tasks) {
            Thread thread = new Thread(task);
            threads.add(thread);
        }
        
        for(Thread thread : threads) {
            thread.start();
        }
    }
}
```
+ 제가 작성한 코드와 비교했을 때 솔루션이 더 좋다고 느낀 점이 많았는데, 일단 클래스에서 해당 클래스의 생성자 호출을 그 클래스 내의 메서드에서 ```new MultiExecutor(list);```와 같은 방식으로 표현하는게 부적절한 것 같았습니다.
+ 솔루션에서의 해답처럼 `private final List<Runnable> tasks;` 클래스 내 별도 지역 변수를 두고 그 변수를 활용해서 메서드를 만드는 것이 좋을 것 같다고 생각합니다.

<br><br>

### 3. 스레드 조정
스레드를 조정하기 위해 `Thread.interrupt();`를 이용한 처리를 말해주고 있습니다. 하지만 이것만 가지고 이 스레드를 조정할 수행할 방법이 없다면 스레드를 멈추지 못할 수도 있습니다. `Thread.currentThread().isInterrupted()`로 스레드마다 interrupt 여부를 확인해서 체킹할 수 있을 것입니다.  
하지만 이렇게 개별 체킹하는 방식말고 다른 방법은 없을까요? Daemon Thread는 애플리케이션 종료(메인스레드의 종료)에도 불구하고 동작하게 처리하게 할 수 있는 스레드입니다. `thread.setDaemon(true);`와 같은 방식으로 Daemon Thread의 사용할 수 있습니다.
다른 방법으로는 모든 스레드가 수행된 후 메인스레드가 안전하게 종료될 수 있도록 `Thread.join()`을 이용한 스레드 병렬처리 방법을 생각해 볼 수 있습니다.
```java
// 스레드가 interrupt된 경우 InterruptedException 사례
@Override
public void run() {
  try {
    Thread.sleep(500000);
  } catch (InterruptedException e) {
    System.out.println("Existing blocking thread");
  }
}
```
```java
// 스레드의 interrupt 여부를 checking 방식
for (BigInteger i = BigInteger.ZERO; i.compareTo(power) != 0; i = i.add(BigInteger.ONE)) {
  if (Thread.currentThread().isInterrupted()) {
    System.out.println("Prematurely interrupted computation");
    return BigInteger.ZERO;
  }
  result = result.multiply(base);
}
```        
```java
// Daemon Thread의 적용
thread.setDaemon(true);
```

<br><br>

### 4. 성능 최적화
여기서 말하는 성능은 `Latency` 지연시간과 `Throughput` 처리량으로 나눌 수 있습니다. 
##### 지연시간
CPU 1코어 당 하나의 task만을 수행할 수 있도록 배치되어 있고 스레드 수가 추가된 경우(즉 스레드 수가 많아진 경우), 일반적으로 컨텍스트 스위칭과 캐시 성능 저하로 이어질 수 있습니다. 따라서 최적의 상태는 모든 스레드가 Runnable한 상태라고 말할 수 있습니다.  
강의에는 사례로 thread를 이용한 지연시간을 줄이는 이미지 프로세싱에 대한 내용을 담고 있었는데, 막 복잡하지는 않지만 이미지 변화를 실제로 볼 수 있어서 흥미로웠습니다.  

먼저 RGB 색을 뽑아내기 위해서는 다음과 같은 방식으로 처리하는데 각 비트 자리의 FF 위치에 따라 픽셀 색상 인코딩 그룹 중 하나인 RGB 색상을 구할 수 있습니다. 참고로 ARGB라고 표현했을 때는 RGB 방식의 한 버전으로, 여기서 A는 alpha, 즉, 알파(투명도)를 뜻합니다.
비트마스크의 결과값에 있는 모든 비트를 `>>` 연산자를 이용해 오른쪽으로 시프트해야 합니다.
```java
    public static int getRed(int rgb) {
        return (rgb & 0x00FF0000) >> 16;
    }

    public static int getGreen(int rgb) {
        return (rgb & 0x0000FF00) >> 8;
    }

    public static int getBlue(int rgb) {
        return rgb & 0x000000FF;
    }
```

강의에서는 흰꽃을 모두 분홍색 꽃으로 변환하는 이미지 프로세싱 작업을 처리했는데, 다음 코드와 같이 이미지 높이를 스레드 수로 나눠 각각 스레드가 처리할 수 있도록 했습니다.
+ 스레드 수를 가상 코어 수보다 많게 늘리면 베네핏이 없습니다.
+ 알고리즘의 병렬 실행에는 비용이 많이 듭니다.
```java
public static void recolorImage(BufferedImage originalImage, BufferedImage resultImage, int leftCorner, int topCorner, int width, int height) {
    for(int x = leftCorner ; x < leftCorner + width && x < originalImage.getWidth() ; x++) {
        for(int y = topCorner ; y < topCorner + height && y < originalImage.getHeight() ; y++) {
            recolorPixel(originalImage, resultImage, x , y);
        }
    }
}
```

##### 처리량
처리량은 작업량을 스레드로 나눈 값(T/N)을 말합니다. 여기서 Task를 나누고 합치는 것만으로 비용이 발생하기 때문에 위에 별도 스레드를 만들지 않고 처리하는 것이 오히려 더 성능이 좋을 수도 있습니다. 
하지만 스레드 수가 더 많아지면 그 처리량에서 처리가 나기 때문에 일정 수 이상의 스레드에서는 성능이 더 좋게 나오는 것을 볼 수 있습니다.

<br><br>

### 5. 스레드 간 데이터 공유
##### 스택과 힙
스택은 메모리에서 메서드가 후입선출로 실행되는 공간을 말합니다. 스택에는 Local primitive types, Local references를 가지고 있습니다. 반면 힙은 JVM에서 관리하는 공간으로 Objects, Class Members, Static valuables를 담는 공간입니다.  
##### 원자젹 작업, Atomic Operations
원자적 작업이란 말그대로 하나의 원자와 같이 작업 자체가 한 번에 실행되는 경우를 말합니다.  
`items++;`는 원자적 작업이라고 볼 수 없는데 그 이유는 메모리에서 현재 값을 가지고 오고, 그 다음 그 값에 1을 더하고, 그 `new Value`를 `items`에 대입하는 식으로 진행되기 때문입니다.

<br><br>

### 6. 병행성 문제와 솔루션
##### 임계영역과 동기화
임계영역이란 하나의 원자성 작업으로 처리할 수 있게 하는 영역을 말합니다. 이 영역이 하나의 원자성 작업으로 처리될 수 있게 하기 위해서 java에서는 메서드에 `synchronized` 처리를 해줍니다. 대부분 원자성 작업은 get, sest, refercences와 같은 작업을 처리할 때 해당합니다. 하지만 대부분의 메서드는 비원자적 작업으로 되어 있기 때문에 동기화에 대해 고민할 필요가 있습니다.  
변수에도 `volatile` 처리를 통해 원자성을 부여할 수 있는데 `long`, `double`과 같은 변수들은 64bit 자바에서 보장되지 않기 때문에 32bit로 나눠서 처리되는 과정에서 원자성이 사라집니다.
```java
private static class InventoryCounter {
  private int items = 0;
  Object lock = new Object();
  public void increment() {
    synchronized (this.lock) {
        items++;
    }
  }
  // ...
}
```

##### 경쟁 상태 및 데이터 경쟁, 락킹 기법과 데드락
말 그대로 경합 상태와 동기성 문제로 발생하는 상황으로 공유 리소스에 비원자적 연산이 실행되기 때문에 발생합니다. 경쟁상태 지점인 임계영역을 동기화 블록에 넣어 이 문제를 해결할 수 있습니다. 
이런 경쟁상태에서 deadlock이 발생하게 되는데 상호배제, hold and wait, 비선점, 순환대기 문제를 모두 가지고 있는 경우에 발생합니다. 순환대기를 피하기 위해서 순서대로 실행될 수 있도록 모든 메서드에 접근 순서를 유지하는 방안을 해결법으로 제시하고 있습니다.  
데이터 경쟁은 비순차적 실행으로 데이터가 순차적 계산이 아닌 값의 데이터베이스 반영으로 문제가 발생하는 것을 말합니다. 

아래 코드에서 `increment()`에서 `x++;`, `y++;` 모두 원자적 작업이 아니기 때문에 처리 이후에 `checkForDataRace()`를 확인해보면 데이터 경쟁이 발생한 것을 확인할 수 있습니다.
```java
public class Main {
  public static void main(String[] args) {
    SharedClass sharedClass = new SharedClass();
    Thread thread1 = new Thread(() -> {
      for (int i = 0; i < Integer.MAX_VALUE; i++) {
        sharedClass.increment();
      }
    });

    Thread thread2 = new Thread(() -> {
      for (int i = 0; i < Integer.MAX_VALUE; i++) {
        sharedClass.checkForDataRace();
      }

    });

    thread1.start();
    thread2.start();
  }

  public static class SharedClass {
    private int x = 0;
    private int y = 0;

    public void increment() {
      x++;
      y++;
    }

    public void checkForDataRace() {
      if (y > x) {
        System.out.println("y > x - Data Race is detected");
      }
    }
  }
}
```

<br><br>

### 7. 락킹 심화
ReentrantLock은 자바에서 제공하는 개념으로 락의 공정성을 제어하는 방식입니다. 주로 읽기 작업을 하고 쓰기 작업이 적은 경우에는 ReentrantReadWriteLock을 사용해서 공유자원을 동시에 읽는 것을 허용하는 것이 더 효과적입니다.
```java
private ReentrantReadWriteLock reentrantReadWriteLock = new ReentrantReadWriteLock();
private Lock readLock = reentrantReadWriteLock.readLock();
private Lock writeLock = reentrantReadWriteLock.writeLock();

public int getNumberOfItemsInPriceRange(int lowerBound, int upperBound) {
  readLock.lock();
  try {
    Integer fromKey = priceToCountMap.ceilingKey(lowerBound);
    Integer toKey = priceToCountMap.floorKey(upperBound);
    if (fromKey == null || toKey == null) {
        return 0;
    }
    NavigableMap<Integer, Integer> rangeOfPrices = priceToCountMap.subMap(fromKey, true, toKey, true);
    int sum = 0;
    for (int numberOfItemsForPrice : rangeOfPrices.values()) {
        sum += numberOfItemsForPrice;
    }
	
    return sum;
  } finally {
    readLock.unlock();
  }
}
```

  

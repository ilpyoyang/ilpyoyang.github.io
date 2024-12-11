---
title: 테스트 더블
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [CS, Basic]
tags: [테스트]
pin: false
math: true
mermaid: true
---

테스트 더블은 xUnit의 저자 Gerard Meszaros가 만든 용어로, ```스턴트 더블(스턴트 대역 배우를 지칭하는 용어)```에서 아이디어를 얻은 말이라고 합니다. 실제 DOC 접근이 어렵고, 사용할 수 없는 경우에 사용되는 Test 객체입니다.  
테스트 더블을 이용하면, 테스트 대상 코드를 격리하고 테스트 속도를 개선할 수 있습니다. 그리고 특수한 상황을 시뮬레이션 할 수 있습니다.

### Dummy  
실제로 사용되지는 않지만 파라미터 리스트를 채우기 위해 사용되는 객체를 말합니다. 구현을 제외한 인터페이스 또는 기본 클래스의 파생 객체로 객체만 전달될 뿐 사용되지 않습니다.  
아래 코드에서 보면, ```DummyObject```는 아무것도 없지만 ```@Test``` 파라미터를 채우기 위해 존재하는 객체로 이름만 존재하는 것을 알 수 있습니다.
```java
public class DummyObject {}

public class DummyObjectTest {
    @Test
    public void testDummyObject() {
        DummyObject dummy = new DummyObject();
        // 테스트할 로직 작성
    }
}
```

### Stub  
Dummy 객체가 실제로 동작하는 것처럼 보이게 만들어 놓은 객체를 말합니다. 호출자를 실제 구현물로부터 격리시키는 목적으로 사용합니다. 테스트에서 호출된 요청에 대해 미리 준비해 둔 결과를 제공합니다.
```java
public interface DatabaseService {
    String getData();
}

public class DatabaseServiceStub implements DatabaseService {

    @Override
    public String getData() {
        return "Stubbed data";
    }
}

public class MyClassTest {

    @Test
    public void testMethodWithStub() {
        DatabaseService databaseStub = new DatabaseServiceStub();
        MyClass myClass = new MyClass(databaseStub);
        // Call the method that uses the stubbed database service
        String result = myClass.processData();
        // Assert the result
        assertEquals("Stubbed data", result);
    }
}
```

### Fake  
```in-memory test database```가 대표적인 사례로 실제로 동작하진 않지만 정해진 결과값을 리턴하도록 하드코딩된 객체를 말합니다. 그렇기 때문에 구현은 가지고 있지만 실제 사용하는 객체처럼 보일 뿐, 실제 객체의 동작과는 차이가 있습니다.
```java
public interface EmailService {
    void sendEmail(String to, String message);
}

public class FakeEmailService implements EmailService {
    private List<String> sentEmails = new ArrayList<>();

    @Override
    public void sendEmail(String to, String message) {
        // 이메일을 실제로 보내지 않고, 리스트에 추가한다.
        sentEmails.add(to + ": " + message);
    }

    public List<String> getSentEmails() {
        return sentEmails;
    }
}

public class FakeEmailServiceTest {
    @Test
    public void testFakeEmailService() {
        FakeEmailService fakeEmailService = new FakeEmailService();
        // 테스트할 로직 작성
    }
}
```

### Spy  
테스트에서 특정 객체가 사용되었는지 그 객체의 예상된 메서드가 정상적으로 호출되었는지 확인해야하는 상황이 생기는 경우에 사용합니다.
```java
public class SpyList extends ArrayList<String> {
    private boolean addMethodCalled = false;

    @Override
    public boolean add(String element) {
        addMethodCalled = true;
        return super.add(element);
    }

    public boolean isAddMethodCalled() {
        return addMethodCalled;
    }
}

public class SpyListTest {
    @Test
    public void testSpyList() {
        SpyList spyList = new SpyList();
        // 테스트할 로직 작성
    }
}
```

### Mock  
어떤 동작을 했을 때, 어떤 결과를 주는지에 대해 프로그래밍된 객체를 말합니다. ```MockPaymentGateway```는 실제 프로그램에서 사용되는 객체로 그 객체를 가지고 와서 테스트하기 때문에 실제 프로세스가 구현이 되어 잘 동작하는지 확인할 수 있습니다.
```java
public interface PaymentGateway {
    boolean processPayment(double amount);
}

public class MockPaymentGateway implements PaymentGateway {
    private boolean processPaymentCalled = false;

    @Override
    public boolean processPayment(double amount) {
        processPaymentCalled = true;
        // 실제 결제 프로세스를 모킹하여 테스트에 사용한다.
        return true;
    }

    public boolean isProcessPaymentCalled() {
        return processPaymentCalled;
    }
}

public class MockPaymentGatewayTest {
    @Test
    public void testMockPaymentGateway() {
        MockPaymentGateway mockPaymentGateway = new MockPaymentGateway();
        // 테스트할 로직 작성
    }
}
```

<span style="background-color:#DCFFE4">그럼 언제 어떤 테스트 더블을 사용해야 할까?</span>  
쓰임에 따라 사용해야할 테스트 더블은 다른데, <span style="background-color:#fff5b1">Mockist TDD의 경우에는 Mock만을 사용하고, Classicist TDD의 경우에는 Fake, Stub, Spy를 사용하는 것이 적절하고 경우에 따라서는 Mock도 사용할 수 있습니다.</span> Mockist과 Classicist에 대해서는 아래 작성한 글을 참고해주세요.

---

[TestDouble - Martin Flower](https://martinfowler.com/bliki/TestDouble.html)  
[Test Double(테스트 더블)알아보기](https://beomseok95.tistory.com/295)  
[TDD: Test Doubles in Unit Testing. Should we use Fakes? Stubs? Mocks?](https://optivem.com/tdd-test-doubles-in-unit-testing-should-we-use-fakes-stubs-mocks/)

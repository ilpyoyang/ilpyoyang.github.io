---
title: Spring Batch 오픈소스에 기여하기
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Spring, Spring Batch]
tags: [오픈소스, Spring Batch, 스터디]
pin: false
math: true
mermaid: true
---

Issue : [StepBuilder - issue when setting the taskExecutor before faultTolerant()](https://github.com/spring-projects/spring-batch/issues/4438)  
PR : [Add AbstractTaskletStepBuilder copy constructor](https://github.com/spring-projects/spring-batch/pull/4471) 

### 들어가며
오픈소스 기여 스터디를 통해 ```spring-batch``` 기여에 참여하게 되었습니다. 
이슈 선정의 목표는 당시에 처음 오픈소스를 참여하는 것이라서 <span style="background-color:#fff5b1">욕심내지 않고, 쉬우면서 중요한 오픈소스에 기여해보자</span>는 단순한 목표를 가지고 시작했습니다. 
GDG 오픈소스 스터디에 참여해서 스터디 운영자 분과 다른 스터디 참여하시는 분들의 PR 참여를 노션으로 보면서 기한 내에 PR를 할 수 있었습니다.
(아직 merge 반영되지 않았지만 메인테이너가 확인한 상태입니다.)

### Spring batch에 대한 간략 설명
Spring은 워낙 유명한 오픈소스이기 때문에 다들 알겠지만 spring-batch의 배치 잡을 사용할 프로젝트가 아닌 이상 사용해보지 않은 사람도 많은 것 같습니다.
저도 알고는 있었지만 오픈소스로 내부 오픈소스를 본 것은 처음이었습니다.  

Spring batch는 <span style="background-color:#fff5b1">대량의 데이터를 처리하는 데 사용되는 경량, 포괄적인 배치 프레임워크</span>입니다.   
먼저 ```step```은 ```ItemReader```, ```ItemProcessor```, ```ItemWriter```와 같은 구성요소를 포함하며, 특정 작업을 수행하는 역할을 합니다. 데이터 청크 단위로 처리할 수 있도록 하며 하나 이상의 ```step```으로 ```job```을 구성합니다.  
```job```은 배치 처리의 실행 단위로 ```JobInstance```로 간주되며, ```JobParameter```에 의해 구분됩니다.```JobExecution```으로 실행에 대한 기록을 담습니다.  

![stepbuilder1.png](/assets/post_images/spring/stepbuilder1.png)

### 이슈 내용
[이슈](https://github.com/spring-projects/spring-batch/issues/4438)가 간단하고 테스트코드를 잘 작성해주셔서 한 번에 이해하기 편했습니다.  
```step```을 만들 때, ```taskExecutor()```의 위치에 따라 필드 값이 잘 상속되지 않음을 알 수 있습니다.
```java
TaskletStep step1 = new StepBuilder("step-name", jobRepository)
                .chunk(10, transactionManager)
                .reader(itemReader)
                .processor(itemProcessor)
                .writer(itemWriter)
                .faultTolerant()
                .taskExecutor(taskExecutor)
                .build();
TaskletStep step2 = new StepBuilder("step-name", jobRepository)
                .chunk(10, transactionManager)
                .taskExecutor(taskExecutor)// The task executor is set before faultTolerant()
                .reader(itemReader)
                .processor(itemProcessor)
                .writer(itemWriter)
                .faultTolerant()
                .build();
```

### 오픈소스 분석
```TaskletStep```가 만들어지는 과정은 다음과 같은 구조도로 나타낼 수 있습니다. 
```
StepBuilderHelper
|
|-- AbstractTaskletStepBuilder
    |
    |-- SimpleStepBuilder
        |
        |-- FaultTolerantStepBuilder
            |
            |-- TaskletStep
```

```StepBuilder```로 ```TaskletStep```을 생성할 때, ```.faultTolerant()```는 ```FaultTolerantStepBuilder```의 영향을 받고, ```.taskExecutor(taskExecutor)```는 ```AbstractTaskletStepBuilder```의 메소드가 적용됩니다.  
```faultTolerant()```를 적용하므로서 ```TaskletStep```이 생성될 때 청크 지향의 시스템 구현시 실패한 아이템의 재시도(retry)와 스킵(skip) 기능을 포함하게 됩니다.
```java
// FaultTolerantStepBuilder faultTolerant()
public FaultTolerantStepBuilder<I, O> faultTolerant() {
  return new FaultTolerantStepBuilder<>(this);
}
```
```taskExecutor(taskExecutor)```는 ```AbstractTaskletStepBuilder``` 속성 중 ```taskExecutor```를 넣어준 매개변수로 변경하고 ```SimpleStepBuilder``` 인스턴스를 반환할 수 있게 해줍니다.
여기서 ```B```는 ```AbstractTaskletStepBuilder``` 또는 그 하위 클래스의 타입을 나타냅니다.
```java
// AbstractTaskletStepBuilder taskExecutor(taskExecutor)
public B taskExecutor(TaskExecutor taskExecutor) {
  this.taskExecutor = taskExecutor;
  return self();
}
```

```SimpleStepBuilder```의 생성자를 보면 부모 객체의 속성들을 받아서 새로운 객체를 생성하거나 복사 생성자를 만드는 두 가지 방법이 사용된 것을 볼 수 있습니다.
```java
public SimpleStepBuilder(StepBuilderHelper<?> parent) {
	super(parent);
}
protected SimpleStepBuilder(SimpleStepBuilder<I, O> parent) {
    super(parent);
    this.chunkSize = parent.chunkSize;
    this.completionPolicy = parent.completionPolicy;
    this.chunkOperations = parent.chunkOperations;
    this.reader = parent.reader;
    this.writer = parent.writer;
    this.processor = parent.processor;
    this.itemListeners = parent.itemListeners;
    this.readerTransactionalQueue = parent.readerTransactionalQueue;
    this.meterRegistry = parent.meterRegistry;
}
```

하지만 ```AbstractTaskletStepBuilder```의 복사 생성자가 없고 단순히 부모 객체 속성을 받아오는 ```super()``` 처리 생성자만 있는 것을 볼 수 있습니다.
```java
public AbstractTaskletStepBuilder(StepBuilderHelper<?> parent) {
  super(parent);
}
```

### 해결방안
```AbstractTaskletStepBuilder```의 복사 생성자를 추가하므로서 필드 update가 가능하도록 처리했습니다.
```java
public AbstractTaskletStepBuilder(AbstractTaskletStepBuilder<?> parent) {
    super(parent);
    this.chunkListeners = parent.chunkListeners;
    this.stepOperations = parent.stepOperations;
    this.transactionManager = parent.transactionManager;
    this.transactionAttribute = parent.transactionAttribute;
    this.streams.addAll(parent.streams);
    this.exceptionHandler = parent.exceptionHandler;
    this.throttleLimit = parent.throttleLimit;
    this.taskExecutor = parent.taskExecutor;
}
```

테스트 코드는 다음과 같이 작성했는데, 오픈소스 기여에서 ```contribute``` 파일이나 ```readme``` 내용을 보고 설정한 내용대로 테스트 코드를 작성하면 됩니다.  
```@BeforeEach```로 공통으로 테스트에 사용될 ```simpleStepBuilder``` 만들어 줍니다. 코드 수정은 ```AbstractTaskletStepBuilder``` 자체는 추상클래스이므로 비교를 위한 구현체로 ```simpleStepBuilder```를 이용했습니다.  
복사 생성자가 잘 작동하는지 확인하는 테스트 코드와 ```taskExecutor()```를 먼저하고 ```faultTolerant()```를 이후에 했을 때 값을 비교하는 테스트 코드를 작성했습니다.  

여기서,``` SimpleStepBuilder```의 속성값은 ```private```로 접근이 어렵기 때문에 자바 API인 **리플렉션**을 이용했습니다.
<span style="background-color:#fff5b1">리플렉션은 런타임에 클래스의 정보를 조회하고, 객체의 필드나 메서드에 접근하거나, 클래스의 객체를 동적으로 생성하는 등의 작업을 가능하게 해주는 자바 API입니다.</span> 
```field.setAccessible(true)```와 같은 방식으로 declare 필드의 접근을 조정할 수 있습니다. (```accessPrivateField``` 메서드)

```java
@SpringBatchTest
@SpringJUnitConfig
public class AbstractTaskletStepBuilderTests {
	private final JobRepository jobRepository =  mock(JobRepository.class);
	private final int chunkSize = 10;
	private final ItemReader itemReader = mock(ItemReader.class);
	private final ItemProcessor itemProcessor = mock(ItemProcessor.class);
	private final ItemWriter itemWriter = mock(ItemWriter.class);
	private final SimpleAsyncTaskExecutor taskExecutor  = new SimpleAsyncTaskExecutor();
	SimpleStepBuilder simpleStepBuilder;

	private <T> T accessPrivateField(Object o, String fieldName) throws ReflectiveOperationException {
		Field field = o.getClass().getDeclaredField(fieldName);
		field.setAccessible(true);
		return (T) field.get(o);
	}

	private <T> T accessSuperClassPrivateField(Object o, String fieldName) throws ReflectiveOperationException {
		Field field = o.getClass().getSuperclass().getDeclaredField(fieldName);
		field.setAccessible(true);
		return (T) field.get(o);
	}

   // 공통 사용될 simpleStepBuilder 만들기
	@BeforeEach
	void set(){
		StepBuilderHelper stepBuilderHelper = new StepBuilderHelper("test", jobRepository) {
			@Override
			protected StepBuilderHelper self() {
				return null;
			}
		};
		simpleStepBuilder = new SimpleStepBuilder(stepBuilderHelper);
		simpleStepBuilder.chunk(chunkSize);
		simpleStepBuilder.reader(itemReader);
		simpleStepBuilder.processor(itemProcessor);
		simpleStepBuilder.writer(itemWriter);
	}

    // 복사가 잘되는지 확인
	@Test
	void copyConstractorTest() throws ReflectiveOperationException {
		Constructor<SimpleStepBuilder> constructor = SimpleStepBuilder.class.getDeclaredConstructor(SimpleStepBuilder.class);
		constructor.setAccessible(true);
		SimpleStepBuilder copySimpleStepBuilder = constructor.newInstance(simpleStepBuilder);

		int copyChunkSize = accessPrivateField(copySimpleStepBuilder, "chunkSize");
		ItemReader copyItemReader = accessPrivateField(copySimpleStepBuilder, "reader");
		ItemProcessor copyItemProcessor = accessPrivateField(copySimpleStepBuilder, "processor");
		ItemWriter copyItemWriter = accessPrivateField(copySimpleStepBuilder, "writer");

		assertEquals(chunkSize, copyChunkSize);
		assertEquals(itemReader, copyItemReader);
		assertEquals(itemProcessor, copyItemProcessor);
		assertEquals(itemWriter, copyItemWriter);
	}

   // taskExecutor를 먼저하고 faultTolerant를 이후에 했을 때 값 비교
	@Test
	void faultTolerantMethodTest() throws ReflectiveOperationException {
		simpleStepBuilder.taskExecutor(taskExecutor); // The task executor is set before faultTolerant()
		simpleStepBuilder.faultTolerant();

		int afterChunkSize = accessPrivateField(simpleStepBuilder, "chunkSize");
		ItemReader afterItemReader = accessPrivateField(simpleStepBuilder, "reader");
		ItemProcessor afterItemProcessor = accessPrivateField(simpleStepBuilder, "processor");
		ItemWriter afterItemWriter = accessPrivateField(simpleStepBuilder, "writer");
		TaskExecutor afterTaskExecutor = accessSuperClassPrivateField(simpleStepBuilder, "taskExecutor");

		assertEquals(chunkSize, afterChunkSize);
		assertEquals(itemReader, afterItemReader);
		assertEquals(itemProcessor, afterItemProcessor);
		assertEquals(itemWriter, afterItemWriter);
		assertEquals(taskExecutor, afterTaskExecutor);
	}
}
```

### 스터디 회고
실제로 오픈소스에 기여한다는 건 생각만 해보고 시도한 적이 없었는데 이렇게 간단한 오픈소스를 통해 이번을 시작으로 다른 오픈소스에도 참여해보고 싶다는 생각이 들었습니다. 그리고 오픈소스 자체에 대한 심리적 부담감?같은 것이 있었는데 실제로 프로젝트에 참여하듯이 기여를 할 수 있다는 점이 좋았습니다.
스터디가 아니였으면, 다른 사람들과 함께 하지 않았으면 시도가 더 늦어졌을 것 같은데 좋은 기회에 참여할 수 있어서 감사했습니다.  

결론으로 ```spring-batch```는 기여할 것이 많은 노다지였다!

<img src="/assets/post_images/spring/opensource-study-result.png"/>

<span style="background-color:#fff5b1">스프링 배치 컨트리뷰터!!</span>  
그로부터 거의 5개월이 지난 시점의 메인테이너의 피드백을 받게 됐는데 도움을 주신 인제님과 기여부분 수정제안을 해주신 태익님의 도움으로 pr을 다시 올려서 close 시킬 수 있었습니다.  
사실 엄청난 코드작성을 한 부분은 아니지만 중간 데이터 소실이라는 문제가 발생하는 부분이기 때문에 core단 버그를 수정했다는 점에서 굉장히 뿌듯했고, 이런 식으로 접근할 수 있구나 이렇게 소통해서 문제를 해결하는구나라는 것을
알게 된 순간이었습니다.

아쉬운 부분이 있다면, 아무리 생각해도 당시에 이슈에서 제안한 한정적 방법 밖에 떠오르지 않아서 테스트를 일단 이슈대로 작성했었습니다. 중간에 test 부분 작성에 대한 방향성을 더 유지보수가 쉽게 하는 방안으로 메인테이너 요청을 만족스럽게 수정하지 못한 부분이었습니다.
기존에는 모든 값들이 잘 복사됐는지 확인하는 방식이었는데, 메인테이너가 아래와 같이 `stepOperations` 비교를 하는 방식으로 변경해서 테스트를 변경해주신걸 볼 수 있었습니다.
(spring-batch에는 `private` 처리된 것이 많아서 `ReflectionTestUtils`로 값을 그냥 가지고 와서 비교하는 방식으로 테스트 코드가 실제로 다른 테스트에도 작성된 부분이 많습니다.)
```java
Object stepOperations = ReflectionTestUtils.getField(step, "stepOperations");
assertInstanceOf(TaskExecutorRepeatTemplate.class, stepOperations);
``` 





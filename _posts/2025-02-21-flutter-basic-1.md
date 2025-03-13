---
title: Dart 기초문법
author: ilpyo
date: 2025-02-21 00:00:00 +0900
categories: [Flutter]
tags: []
pin: false
math: true
mermaid: true
---

### Dart Basic
#### 프로그래밍이란?
프로그램 = 컴퓨터가 이해할 수 있는 명령어의 나열

#### 컴파일
사람이 고급언어로 작성한 코드를 컴파일러가 저급언어로 변경해서 컴퓨터가 이해할 수 있게 해줍니다.
JIT(Just In Time) 컴파일
- 실행 중 번역의 과정을 거침 - 런타임 시기
  AOT 컴파일
- 실행 전에 미리 컴파일하는 기술
- 실시간 컴파일이 아니라서 개발 효율성은 떨어집니다.

##### **Dart는 두 가지 컴파일러(JIT, AOT)를 모두 사용함**

##### 왜 Dart를 써야 하는가?
Flutter를 이용한 크로스 플랫폼 앱 개발을 위해 Dart라는 언어를 사용합니다. 구글에 의해 디자인된 객체지향 언어로 C 언어와 유사하며 다른 언어들과 같이 간편한 기능적 요소를 제공합니다.
- 멀티플랫폼으로 생산성이 미쳤다.
- 현대적인 프로그래밍 지원 - 객체지향, 함수형, 비동기 프로그래밍을 지원
- 데이터의 타입 안전성이 있다. Type Safe
- Null Safe
  - `int? a = 42;` - Nullable하게 null에 대해 안전하게 만들어줄 수 있습니다.
  - `int a = 42;` - Non-nullable하게 null에 대해 안전하게 만들어줄 수 있습니다.

##### SDK, Software Development Kit
- 컴파일러, 라이브러리, 디버깅 및 테스트 도구, 문서 및 샘플코드, 패키지 관리자
- Flutter SDK에 Dart SDK 포함
- 버전 표기
  - Stable 버전 `3.5.2`
  - Beta 버전 `3.6.0-218.0.beta`
  - Dev 버전 `3.6.0-218.0.dev`

---

### Dart 기본문법

#### 변수

##### 프로그램 실행 중 값을 변경할 수 있는 변수
- 숫자형(`int`, `double`, `num`), 문자형(`String`), 불리안형(`boolean`)
- `dynamic`은 모든 타입에 가능하며, 런타임 시점에 타입을 체크합니다. `late`는 선언시 지정한 타입만 가능하고 컴파일 타임에 타입을 체크합니다.
```dart
int age = 30;
String name = "Bob";
bool isStudent = true;

var city = 'Seoul';      // 자동추론
dynamic value = 'Hello'; // 런타임에 타입이 결정
```

##### 상수(Const)
프로그램 실행 중 값을 변경할 수 있는 변수
- `final` - 프로그램 실행 중에 값이 결정되는 경우
- `const` - 항상 값이 고정되는 경우
```dart
final age = 30;
const age = 30;

// Can't assign to the const variable 'age'.
age = 40;
```

##### late
선언 후 변수 사용시점에 지연 초기화되는 변수이면서, non-nullable이기 때문에 null을 넣을 수 없습니다. 초기화 비용이 높은 변수가 지금 당장 필요하지 않은 경우에 사용합니다.
```dart
late String greeting;

void main() {
  greeting = getGreeting();
  print(greeting);
}

String getGreeting() {
  return "Hello, Dart!";
}
```

##### null
Dart는 Null safety가 있어서 기본적으로 변수는 `null` 값을 가질 수 없습니다.
- `?.` (null-aware operator) 연산자를 사용하면 null인 값이여도 허용할 수 있습니다.
```dart
String? nullableName;
nullableName = null;

String nonNullableName = 'Bob';
// nonNullableName = null;         
// The value 'null' can't be assigned to a variable of type 'String' because 'String' is not nullable.
```

#### 연산자
프로그램의 수학적인 연산 또는 비교, 데이터 조합에 사용됩니다.
- 산술연산자
  - `+`, `-`, `*`, `/`
  - `~/`(나누는 값의 정수만 반환)
  - `%`(나누는 값의 나머지만 반환)
- 비교연산자
  - `==`, `!=`, `>`, `<`, `>=`, `<=`
- 타입 체크 연산자
  - `as`(형변환, 호환되는 경우에만 가능)
  - `is`(타입 판별)
  - `is!`(특정 타입을 가지고 있지 않은지 판별)
- 대입 연산자
  - `=`, `??=`(왼쪽의 값이 `null`일 때 오른쪽 값을 대입)
  - `+=`, `-=`, `*=`, `/=`, `~/=` , `%=`
- 논리 연산자
  - `!`, `||`, `&&`

#### Enum
상수형 집합을 위해 사용되는 타입으로 `Set`과 달리 인덱스로 만들어 사용이 가능합니다. 이미 있는 값을 추가하려는 경우에는 에러가 발생합니다.
```dart
enum Food {
  rice,
  noodles,
  ramen,
  hotdog,
  pizza
}
```

#### 반복문

##### for문을 이용한 반복문
items의 item을 for문으로 ListTile 위젯으로 보여주고 있습니다. 여기서 `var item in items`으로 items 내에 item을 꺼내서 for문 이하 코드를 수행함을 알 수 있습니다. 여기서 for문은 리스트 순서를 기본적으로 보장합니다.
```dart
for (var i = 0; i < items.length; i++) {
  print(items[i]); // items의 각 항목을 출력
}

for (var item in items) {
  listTiles.add(ListTile(title: Text(item))); // 각 항목에 대해 ListTile 추가
}
```

##### forEach문을 이용한 반복문
forEach문도 컬렉션 순서를 보장하는 반복문으로 for문과 달리 인덱스를 직접 다루지 않고 함수형 스타일로 실행할 작업을 정의합니다. forEach 내부에서 `return`, `break`, `continue` 등을 사용할 수 없습니다.
```dart
items.forEach((item) {
  listTiles.add(ListTile(title: Text(item))); // 각 항목에 대해 ListTile 추가
});
```

##### while문을 이용한 반복문
주어진 조건이 참인 동안 반복을 계속해서 while문 내의 작업을 수행하는 반복문입니다. 
```dart
while (index < items.length) {
  listTiles.add(ListTile(title: Text(items[index])));
  index++;
}
```

##### do-while문을 이용한 반복문
조건이 나중에 검사되는 반복문으로 처음 한 번은 반복이 실행됩니다. 이후 조건이 적합하지 않으면 반복을 멈춥니다.
```dart
do {
  listTiles.add(ListTile(title: Text(items[index])));
  index++;
} while (index < items.length);
```

##### map을 이용한 반복문
items라는 리스트 변수를 선언하고 이를 Scaffold 내에 ListTile 위젯에 담아 나열하는 것을 보여주는 예시입니다. 여기서도 list 순서를 보장합니다.
```dart
class ListWidget extends StatelessWidget {
  final List<String> items = ['사과', '바나나', '체리', '포도', '오렌지']; // 리스트 데이터

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('반복문 예제')),
      body: ListView(
        children: items.map((item) => ListTile(title: Text(item))).toList(), // 반복문 적용
      ),
    );
  }
}
```

##### break, continue
`break`와 `continue`는 반복문에서 흐름을 제어하는데 사용합니다. `break`는 반복문을 완전히 종료하고, `continue`는 현재 반복을 건너뛰고 다음 반복으로 넘어갑니다.

`i`가 5일 때 반복문 종료하고 10까지 반복되는 반복문을 이어서 실행하지 않습니다. 즉, 0, 1, 2, 3, 4까지 출력됩니다.
```dart
void main() {
  for (var i = 0; i < 10; i++) {
    if (i == 5) {
      print('i가 5일 때 반복문 종료');
      break;
    }
    print(i);
  }
}
```

`i`가 5일 때만 현재 반복을 건너뛰고, 다음 반복으로 0, 1, 2, 3, 4, 6, 7, 8, 9를 출력됩니다. 건너 뛴 5가 출력되지 않은 것을 알 수 있습니다.
```dart
void main() {
  for (var i = 0; i < 10; i++) {
    if (i == 5) {
      continue;
    }
    print(i);
  }
}
```

#### 조건문

##### if문을 이용한 조건문
if, else if, else를 이용한 조건문으로 순차적으로 검사하고 조건에 해당하는 경우 코드 블록을 실행합니다.
```dart
int number = 7;

if (number > 10) {
  print("number는 10보다 큽니다.");
} else if (number > 5) {
  print("number는 5보다 크고 10보다 작거나 같습니다.");
} else {
  print("number는 5보다 작거나 같습니다.");
}
```

##### switch문을 이용한 조건문
switch문은 여러 값 중 하나를 선택하여 해당하는 코드 블록을 실행합니다. 
```dart
String fruit = "사과";

switch (fruit) {
  case "사과":
    print("사과입니다.");
    break;
  case "바나나":
    print("바나나입니다.");
    break;
  case "포도":
    print("포도입니다.");
    break;
  default:
    print("알 수 없는 과일입니다.");
}
```

#### 조건표현식

##### 조건식을 이용한 조건문
`?` 앞의 조건에 해당되는 경우 `:` 앞의 값을, 조건에 해당되지 않는 경우 `:` 뒤의 값을 변수에 대입합니다.
```dart
int number = 8;
String result = (number > 5) ? "5보다 큽니다" : "5보다 작거나 같습니다";
print(result);
```

##### null-aware를 이용한 조건문
`??` 연산자를 사용하면, 왼쪽 값이 null이면 오른쪽 값을 반환합니다. null일 때 값을 지정해주므로써 발생할 수 있는 에러를 미리 방지할 수 있다는 장점이 있습니다.
```dart
String? name;
String greeting = name ?? "이름이 없습니다";
print(greeting);
```

### 함수
위젯 트리의 깊이가 깊어지면 Flutter에서 유지보수 및 가독성이 떨어지는 문제가 발생합니다. 이런 일을 방지하기 위해서는 함수를 만들어서 기능단위로 분리할 필요가 있습니다.

다음과 같이 비동기 작업을 처리하기 위한 `fetchData()` 함수를 만들 수 있습니다. Flutter에서 비동기 작업을 처리할 때는 `async`와 `await`를 사용합니다. 반환 타입은 `Future`를 사용하여 비동기 처리를 나타냅니다. 미래에 완료될 값을 나타내는 객체로 `Future.wait()`로 여러 개의 `Future`를 사용해서 처리하고 모두 완료될 때까지 기다리는 방법을 사용합니다.
```
Future<void> fetchData() async {
  await Future.delayed(Duration(seconds: 2));
  print("Data fetched!");
}
```



#### 클래스
dart는 클래스를 객체로 사용하는 객체지향 언어입니다. 아래 처럼 사용자에 대한 모델을 만들고 각 속성을 정의하거나 그 속성을 다루는 함수를 가지고 있는 객체 모델을 만드는데 사용할 수 있습니다.
```dart
class UserModel {
  String name;
  int age;
  String status;

  UserModel({required this.name, required this.age, this.status = '오프라인'});

  void updateStatus(String newStatus) {
    status = newStatus;
  }
}
```

#### 제네릭(Generic)
클래스나 함수 에서 데이터 타입을 일반화하여 다양한 타입을 지원할 수 있게 하는 기능으로 코드 재사용성을 높일 수 있습니다.
- 타입 파라미터는 객체 생성 시 반드시 명시해주는 게 좋습니다. 그렇지 않으면 `dynamic`으로 동작할 수 있어 타입 안정성을 잃을 수 있습니다.
- 제네릭을 너무 남발하면 코드가 복잡해질 수 있으니, 필요한 경우에만 사용하는 게 좋습니다.

```dart
class Box<T> {
  T value;

  Box(this.value);

  void showType() {
    print('Type of value: ${value.runtimeType}');
  }
}

void main() {
  var intBox = Box<int>(123);
  intBox.showType(); // Type of value: int

  var stringBox = Box<String>('Hello');
  stringBox.showType(); // Type of value: String
}
```

#### 주석
- 협업을 위한 주석을 작성하거나 내가 작성한 코드에 대한 내용을 작성할 때 사용합니다.
- `//`, `/* */`, `///`(문서주석, `[a]`와 같은 방식으로 표현이 가능)

---

### 함수형 프로그래밍
메서드 체이닝이라고도 하며 여러 함수를 연결해서 사용하는 방식을 말합니다. 
상태 변화가 적고 데이터 변환이 중심인 작업, 병렬 처리나 비동기 작업이 많을 때, 코드의 안정성과 가독성이 중요한 경우에 사용합니다.

반면, 명령형 프로그래밍의 경우에는 직관적이고 빠르게 프로토타입을 만들 때 사용하는 것으로 함수형 프로그래밍보다 장황한 코드로 오류 발생 가능성이 상대적으로 높습니다.

형변환 함수
- `toString()`, `int.parse('')`, `double.parse('')`, `toList()`, `toSet()`, `asMap()`

고차함수
- `map()`, `where()`, `firstWhere()`, `lastWhere()`, `reduce()`, `fold()`, `any()`, `every()`, `takeWhile()`, `skipWhile()`

```dart
List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var evenNumbers = numbers.where((number) => number.isEven);
var result = evenNumbers.reduce((a, b) => a + b);
print(result); // 30
```

---

### 객체지향 프로그래밍
클래스를 만들어 같은 형태의 여러 객체를 생성하기에 효율적입니다. 그리고 이 클래스를 상속 받아서 재사용하거나 해당 객체들이 동시에 사용할 수 있는 메서드를 클래스에 정의함으로써 유지보수가 용이해집니다.
```dart
class Animal {
  String name;
  int age;

  Animal(this.name, this.age);

  void speak() {
    print('$name이(가) 소리를 냅니다!');
  }
}

void main() {
  var dog = Animal('멍멍이', 3);
  var cat = Animal('야옹이', 2);

  dog.speak();
  cat.speak();
}
```

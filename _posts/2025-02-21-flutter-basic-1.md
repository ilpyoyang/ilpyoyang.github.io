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

Flutter를 이용한 크로스 플랫폼 앱 개발을 위해 Dart라는 언어를 사용합니다. 구글에 의해 디자인된 객체지향 언어로 C 언어와 유사하며 다른 언어들과 같이 간편한 기능적 요소를 제공합니다.

### 변수
Dart는 변수 타입을 강타입, 약타입, 동적 타입으로 런타입에 결정되도록 하는 `dynamic`, null safety를 제공하는 등 타입 안전성을 제공합니다.
```dart
int number = 10; // 강타입

var name = "Dart"; // 약타임

dynamic word = "Hello"; // 동적 타입
word = 123;

String? nullableText = null; // null 가능
```

Flutter에서 적용된 변수를 다음과 같이 적용할 수 있습니다.
```dart
void _incrementCounter() {
  setState(() {
    _counter++; // 변수 값 변경
  });
}
```

### 반복문

#### for문을 이용한 반복문
items의 item을 for문으로 ListTile 위젯으로 보여주고 있습니다. 여기서 `var item in items`으로 items 내에 item을 꺼내서 for문 이하 코드를 수행함을 알 수 있습니다. 여기서 for문은 리스트 순서를 기본적으로 보장합니다.
```dart
for (var i = 0; i < items.length; i++) {
  print(items[i]); // items의 각 항목을 출력
}

for (var item in items) {
  listTiles.add(ListTile(title: Text(item))); // 각 항목에 대해 ListTile 추가
}
```

#### forEach문을 이용한 반복문
forEach문도 컬렉션 순서를 보장하는 반복문으로 for문과 달리 인덱스를 직접 다루지 않고 함수형 스타일로 실행할 작업을 정의합니다. forEach 내부에서 `return`, `break`, `continue` 등을 사용할 수 없습니다.
```dart
items.forEach((item) {
  listTiles.add(ListTile(title: Text(item))); // 각 항목에 대해 ListTile 추가
});
```

#### while문을 이용한 반복문
주어진 조건이 참인 동안 반복을 계속해서 while문 내의 작업을 수행하는 반복문입니다. 
```dart
while (index < items.length) {
  listTiles.add(ListTile(title: Text(items[index])));
  index++;
}
```

#### do-while문을 이용한 반복문
조건이 나중에 검사되는 반복문으로 처음 한 번은 반복이 실행됩니다. 이후 조건이 적합하지 않으면 반복을 멈춥니다.
```dart
do {
  listTiles.add(ListTile(title: Text(items[index])));
  index++;
} while (index < items.length);
```

#### map을 이용한 반복문
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

### 함수
위젯 트리의 깊이가 깊어지면 Flutter에서 유지보수 및 가독성이 떨어지는 문제가 발생합니다. 이런 일을 방지하기 위해서는 함수를 만들어서 기능단위로 분리할 필요가 있습니다.

다음과 같이 비동기 작업을 처리하기 위한 `fetchData()` 함수를 만들 수 있습니다. Flutter에서 비동기 작업을 처리할 때는 `async`와 `await`를 사용합니다. 반환 타입은 `Future`를 사용하여 비동기 처리를 나타냅니다. 미래에 완료될 값을 나타내는 객체로 `Future.wait()`로 여러 개의 `Future`를 사용해서 처리하고 모두 완료될 때까지 기다리는 방법을 사용합니다. 
```
Future<void> fetchData() async {
  await Future.delayed(Duration(seconds: 2));
  print("Data fetched!");
}
```

### 조건문

#### if문을 이용한 조건문
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

#### switch문을 이용한 조건문
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

#### 조건식을 이용한 조건문
`?` 앞의 조건에 해당되는 경우 `:` 앞의 값을, 조건에 해당되지 않는 경우 `:` 뒤의 값을 변수에 대입합니다.
```dart
int number = 8;
String result = (number > 5) ? "5보다 큽니다" : "5보다 작거나 같습니다";
print(result);
```

#### null-aware를 이용한 조건문
`??` 연산자를 사용하면, 왼쪽 값이 null이면 오른쪽 값을 반환합니다. null일 때 값을 지정해주므로써 발생할 수 있는 에러를 미리 방지할 수 있다는 장점이 있습니다.
```dart
String? name;
String greeting = name ?? "이름이 없습니다";
print(greeting);
```

### 클래스
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

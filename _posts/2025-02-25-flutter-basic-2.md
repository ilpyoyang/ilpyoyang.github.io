---
title: Flutter 비동기 작업 심화
author: ilpyo
date: 2025-02-25 00:00:00 +0900
categories: [Flutter]
tags: []
pin: false
math: true
mermaid: true
---

## 들어가며
동기는 모든 작업이 순차적으로 처리되는 것을 말하고, 비동기는 작업이 병렬적으로 처리되는 것을 말합니다. 즉, 앞서 시작된 작업의 완료를 기다리지 않고 다음 작업을 시작합니다.

### 코드로 비교하는 동기와 비동기
#### 동기 방식의 코드
작업 1이 모두 완료된 후에 작업 2가 시작되고 `모든 작업 완료`라는 문구가 표기됩니다.
```dart
void main() {
  print('작업 1 시작');
  task1();
  print('작업 2 시작');
  task2();
  print('모든 작업 완료');
}

void task1() {
  for (int i = 0; i < 1000000000; i++) {}
  print('작업 1 완료');
}

void task2() {
  print('작업 2 완료');
}
```
// 결과
```
작업 1 시작
작업 1 완료
작업 2 시작
작업 2 완료
모든 작업 완료
```

#### 비동기 방식의 코드
다음 코드는 비동기 방식을 기반으로 한 코드인데 결과적으로 작업이 duration에 따라 처리되는 것을 볼 수 있습니다. 즉 `wait` 내의 코드 작업 순서에 일치하지 않음을 알 수 있습니다. 

```dart
void main() async {
  print('작업 시작');
  await Future.wait([
    task1(),
    task2(),
    task3()
  ]);
  print('모든 작업 완료');
}

Future<void> task1() async {
  await Future.delayed(Duration(seconds: 2));
  print('작업 1 완료');
}

Future<void> task2() async {
  await Future.delayed(Duration(seconds: 1));
  print('작업 2 완료');
}

Future<void> task3() async {
  await Future.delayed(Duration(seconds: 3));
  print('작업 3 완료');
}
```

// 결과
```
작업 시작
작업 2 완료
작업 1 완료
작업 3 완료
모든 작업 완료
```

## Flutter 비동기 작업 심화
### 상태관리와 비동기
위 제시된 코드처럼 비동기 작업에 따른 결과가 나올 때까지 지연을 걸어둔 뒤 `setState` 상태에 반영하는 것을 예로 들 수 있습니다. 비동기적으로 작업이 시작되지만 결과적으로 사용자 입장에서 동기적인 처리처럼 보여야 하는 경우에도 해당합니다.
- `async`, `await`을 사용해서 비동기 처리를 한 것을 볼 수 있습니다. `async`를 붙여 비동기 함수를 만들고 `await`은 `Future`가 완료될 때가지 기다린 뒤 완료되면 결과 값을 반환합니다.
- `Future`는 비동기 작업의 결과를 나타내는 객체로 작업 완료 후 결과나 오류를 제공합니다.
- `Future` 반환 전후로 버튼의 활성화 여부 처리 등(`setState`)을 통해 중복 요청을 방지할 수 있습니다.

```dart
Future<void> resetGameTiles(int tile1, int tile2) async {
  await Future.delayed(Duration(milliseconds: 1500));
  setState(() {
    tileStates[tile1] = false;
    tileStates[tile2] = false;
  });
  selectedTile = -1;
}
```

### Future 체이닝 메서드
`Future`는 위 방식 외에도 비동기 작업을 위한 `Future` 체이닝 메서드를 제공합니다.
- `Future.then()`, `Future.catchError()`, `Future.whenComplete()` 
- `task1().then((value) => task2()).catchError((e) => print(e));`
  - `task1`의 값에 따라 `task2`를 실행할 수 있고 그 과정에서 에러를 잡아내고 로그를 출력하는 등의 작업을 간단하게 표현할 수 있습니다.

### Future와 Stream의 차이
`Future`는 한 번만 데이터를 반환하고 `Stream`은 다른 언어들처럼 연속된 스트림 처리 즉, 여러 개의 데이터를 비동기적으로 반환하는데 사용합니다. 실시간 데이터 처리에 `StreamBuilder` 위젯을 활용하는 비동기 상태 관리를 생각해볼 수 있습니다.

### Completer 클래스
`Completer`를 사용해서 외부에서 Future를 완성시키는 방법이 있습니다. 비동기 작업을 컨트롤할 수 있는 객체로 `completer.complete`로 `Future` 객체를 반납합니다.
```dart
Future<String> fetchData() {
  Completer<String> completer = Completer<String>();

  Future.delayed(Duration(seconds: 2), () {
    completer.complete('데이터 로드 완료');
  });

  return completer.future;
}
```

`Completer`를 사용하는 이유는 무엇일까요? 바로 비동기 작업을 위한 고급 제어가 가능합니다. 코드에서 보이듯이 자동으로 완료되는 `Future`의 반환 완료시점을 수동으로 제어할 수 있기 때문입니다. 
- `Completer` 내부에 `Future` 객체를 지니고 있기 때문

### UI와 FutureBuilder
`FutureBuilder`는 `Future`가 완료될 때까지 snapshot을 통해 상태를 추적합니다. `snapshot.connectionState` 상태에 따라 완료, 에러 상태를 제어할 수 있습니다. 로딩 중에는 `CircularProgressIndicator` 표시를 하고, 로딩된 후 결과를 반환합니다.
- `snapshot.hasError`로 에러 처리를 위한 메시지를 제공할 수 있습니다.

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(title: Text('비동기 작업 예시')),
    body: Center(
      child: FutureBuilder<String>(
        future: fetchData(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return CircularProgressIndicator();  // 로딩 중일 때 인디케이터
          } else if (snapshot.hasError) {
            return Text('에러 발생: ${snapshot.error}');
          } else if (snapshot.hasData) {
            return Text('결과: ${snapshot.data}');
          } else {
            return Text('데이터 없음');
          }
        },
      ),
    ),
  );
}
```

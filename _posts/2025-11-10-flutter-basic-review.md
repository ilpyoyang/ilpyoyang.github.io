---
title: Flutter 복습
author: ilpyo
date: 2025-11-10 17:18:00 +0900
categories: [Flutter]
tags: []
pin: false
math: true
mermaid: true
---

## Flutter에 대해서
Flutter는 구글에서 만든 크로스 플랫폼 UI 프레임워크로, 단일 코드베이스로 iOS, Android, Web, Desktop까지 개발할 수 있는 것이 특징이다. 

<mark style="background: #FFF3A3A6;">자체 그래픽 엔진(Skia, Impeller)을 사용</mark>하기 때문에 기존 하이브리드 방식처럼 플랫폼별 UI 차이가 심하지 않고 렌더링 성능도 매우 뛰어나다. Skia는 벡터 기반 렌더링을, Impeller는 최신 GPU 성능을 활용한 고성능 렌더링을 지원한다.

핫리로드 기능은 개발 과정에서 코드 수정 시 전체 화면을 다시 빌드하지 않고 최상위 위젯부터 build() 메서드를 재호출하여 수정된 내용을 즉시 반영한다. Hot Reload는 상태를 유지한 채 UI만 업데이트하며, Hot Restart는 상태까지 초기화한다.

Flutter는 JIT와 AOT를 모두 지원한다. 개발 단계에서는 JIT 컴파일을 통해 빠른 반영이 가능하고, 배포 단계에서는 AOT 컴파일로 네이티브 머신코드로 변환되어 실행 속도가 빠르다. Dart VM은 바이트코드를 실행하거나 최적화된 기계어로 변환하여 처리한다.

## pubspec.yaml | pubspec.lock | analysis_options.yaml

### pubspec.yaml
프로젝트의 핵심 구성 파일로 패키지 의존성 추가, 버전 관리, assets, fonts 설정 등을 담당한다. 외부 패키지는 pub.dev에서 관리하며, pubspec에서 선언 후 `flutter pub get`을 실행하면 설치된다.

### pubspec.lock
실제 설치된 패키지의 정확한 버전을 기록하며 버전 충돌을 방지한다. 개발자가 직접 수정하지 않고 flutter pub get 실행 시 자동 생성·업데이트된다.

### analysis_options.yaml
코드 분석기와 린트 규칙을 정의하는 설정 파일이다. null safety 검사, 코드 스타일 강제, 불필요한 경고 무시 등 프로젝트 일관성을 유지하는 데 중요하다.

## MaterialApp | CupertinoApp | Scaffold
### MaterialApp
MaterialApp은 Flutter 앱의 “전체 틀”을 구성하는 최상위 레벨의 앱 위젯으로 앱 전역에서 재사용되는 색상, 폰트 스타일, 위젯 테마를 정의할 수 있다. 또한 Navigator와 Route를 묶어 앱 내의 화면 전환과 네비게이션 방식을 통합적으로 다룬다.
### CupertinoApp
CupertinoApp은 MaterialApp과 기능적 위치는 동일하지만, UI 구성 요소가 iOS 스타일을 따르도록 설계되어 있다. MaterialApp처럼 전체 앱의 테마나 라우팅을 관리하는 상위 컨트롤러 역할을 한다. 플랫폼에 따라 Material과 Cupertino 위젯을 섞어 사용하기도 한다.
### Scaffold
Scaffold는 Material 디자인 문맥 안에서 단일 화면의 기본 골격을 구성하는 위젯이다. AppBar, Drawer, FloatingActionButton, BottomNavigationBar, SnackBar 등 개별 화면(UI) 요소들을 배치하기 위한 구조적 틀을 제공한다. <mark style="background: #FFF3A3A6;">즉 MaterialApp이 앱 전체의 운영 시스템이라면, Scaffold는 개별 화면 단위의 ‘페이지 레이아웃 템플릿’에 가깝다.</mark> Scaffold는 화면마다 다르게 설정할 수 있으며, 화면 전환 시마다 새로운 Scaffold가 생성되는 것이 일반적이다.

## 주요 위젯
- SafeArea는 기기마다 다른 Notch 영역을 고려해 padding을 보정한다. 
- DevTools는 UI 구조 확인, 레이아웃 디버깅, 성능 추적 등을 제공한다. 
- Expanded는 부모가 제공한 남는 공간을 자식이 차지하도록 강제하는 위젯이다. Spacer와 함께 레이아웃에서 영역 비율 조절을 돕는다. Spacer는 사실 Expanded를 간편하게 사용하기 위한 축약 형태이다.
```dart
class Spacer extends StatelessWidget {
  const Spacer({ Key? key, this.flex = 1 }) : super(key: key);

  final int flex;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: flex,
      child: const SizedBox.shrink(),
    );
  }
}
```

- SizedBox는 간격 또는 고정 크기 박스 역할을 한다.
- AppBar는 상단 영역 UI를 표현하며 leading, title, actions 등 다양한 속성을 제공한다.

## StatefulWidget vs StatelessWidget
StatelessWidget은 상태 변화 없이 UI만 표현한다. StatefulWidget은 setState를 통해 화면 갱신이 필요한 경우 사용한다. 상태가 복잡해지면 Riverpod 등 상태관리 도구를 함께 활용하는 것이 일반적이다.

<a href="https://www.flutterclutter.dev/flutter/basics/statelesswidget-vs-statefulwidget/2020/1195/" target="_blank" rel="noopener">
  <img width="461" alt="Stateless vs Stateful diagram" src="https://www.flutterclutter.dev/images/wp-content/uploads/2020/08/statelesswidget-vs-statefulwidget-diagram.webp">
</a>

--- 

## JSON과 데이터 통신
Dart의 `dart:convert`를 사용해 JSON 문자열과 Map 간 변환을 수행한다. Model 클래스를 만들고 fromJson/toJson을 구현하는 방식이 일반적이다. Freezed 패키지를 통해 모델 자동 생성도 가능하다.
```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required int id,
    required String name,
    String? email,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

## MVVM 아키텍처
View는 UI, ViewModel은 상태 관리/데이터 가공, Model은 실제 데이터 구조 및 Repository 등을 담당한다. 결합도를 낮추고 테스트가 쉬워진다.
- Model은 앱의 실제 데이터와 비즈니스 규칙을 담고 있는 계층이다. API 통신, 데이터베이스 접근, 데이터 변환, 유효성 검사 같은 실질적인 로직이 이곳에서 처리된다. 
- View는 화면에 표시되는 화면 요소이며, 사용자가 상호작용하는 UI 계층이다. Flutter에서는 화면을 그리는 위젯 전체가 View 영역에 속한다. View는 상태를 직접 관리하지 않고, 사용자 이벤트(버튼 클릭, 스크롤 등)를 ViewModel에게 전달하며, ViewModel이 제공하는 상태만 받아서 렌더링한다. 
- ViewModel은 View와 Model 사이에서 중간 다리 역할을 한다. View에서 발생한 사용자 입력을 받고, Model을 호출해 데이터를 가져오거나 저장하며, 그 결과를 다시 View가 사용할 수 있는 형태로 가공한다. ViewModel은 UI의 행동을 담지만 UI 자체는 포함하지 않는다. 
  - ViewModel → View: 상태 업데이트(옵저버/상태관리 방식으로 반영)

Flutter는 공식적으로 고정된 아키텍처가 없기 때문에 MVVM을 다양한 방식으로 구현할 수 있다. 
- 가장 흔한 접근은 ChangeNotifier와 Provider를 사용하는 것으로, ViewModel이 ChangeNotifier를 상속하여 상태를 관리하고 View는 ChangeNotifierProvider나 Consumer를 통해 이를 구독한다. 구조가 간단하고 직관적이어서 중소형 앱에서 특히 많이 사용된다. 
- Riverpod은 Provider의 개선된 버전으로 간주되며 전역 스코프와 의존성 주입을 더 깔끔하게 처리할 수 있고 테스트가 쉬운 장점이 있다. 이 경우 ViewModel은 StateNotifier 또는 AsyncNotifier를 기반으로 구현되어 더 명확한 상태 흐름을 구성할 수 있다. 
- Bloc 패턴은 이벤트 기반으로 동작하며, ViewModel이 Bloc의 역할을 수행하는 구조로 이해할 수 있다. 각 상태와 이벤트가 명확히 구분되고 예측 가능성이 높기 때문에 규모가 큰 앱이나 복잡한 상태를 다루는 프로젝트에서 특히 강력하게 활용된다.

## Dio 라이브러리
Dio는 Flutter/Dart 생태계에서 가장 널리 사용되는 HTTP 클라이언트 라이브러리 중 하나이다. BaseOptions, Interceptors 등을 통해 헤더 설정 자동화, 오류 처리 구조화가 가능하다. 단순 요청 외에도 인터셉터, 파일 업로드, 요청 취소, 재시도, 전역 설정을 지원한다. 

## Geolocator
사용자의 현재 위치(GPS) 및 위치 변화 스트림을 받아오고, 거리 계산, 권한 관리 등을 간단하게 처리할 수 있도록 도와주는 라이브러리다. Geolocator는 현재 위치 취득에 최적화되어 있는 반면, Google Maps API의 경우는 지도 렌더링 중심으로 위치는 별도로 가지고 와야 한다는 차이가 있다.

아래는 Geolocator를 이용한 샘플로 현재 position에 따라 위치 변경을 감지하는 코드이다.
```dart
StreamSubscription<Position>? positionStream;

void startListening() {
  const locationSettings = LocationSettings(
    accuracy: LocationAccuracy.high,
    distanceFilter: 10,
  );

  positionStream = Geolocator.getPositionStream(locationSettings: locationSettings)
      .listen((Position? position) {
    print(
        '위치 업데이트: ${position?.latitude}, ${position?.longitude}');
  });
}

void stopListening() {
  positionStream?.cancel();
}
```

## 실시간 통신 (WebSocket)
SocketJS는 WebSocket 지원이 어려운 환경에서도 fallback을 제공한다. STOMP는 텍스트 기반 메시지 프로토콜로 구독/발행 구조의 실시간 통신에 적합하다.

--- 

## 애니메이션 구현
Flutter에서 애니메이션은 크게 암시적과 명시적 방식으로 나뉜다. 암시적 애니메이션은 AnimatedContainer, AnimatedOpacity와 같이 위젯의 속성 값을 변경하는 것만으로 Flutter가 자동으로 애니메이션을 처리해주기 때문에 구현이 간단하다. 반대로 명시적 애니메이션은 AnimationController와 Tween을 사용하여 애니메이션의 속도, 곡선, 반복 횟수 등 세부 동작을 직접 제어할 수 있어 보다 정교한 애니메이션 구현이 가능하다. UI 요소의 이동, 크기 변환, 색상 변화 등 다양한 효과를 세밀하게 다루고 싶을 때 사용된다.
```dart
AnimatedContainer(
  duration: Duration(seconds: 1),
  width: _isExpanded ? 200 : 100,
  height: 100,
  color: _isExpanded ? Colors.blue : Colors.red,
);

class MyAnimatedWidget extends StatefulWidget {
  @override
  _MyAnimatedWidgetState createState() => _MyAnimatedWidgetState();
}

class _MyAnimatedWidgetState extends State<MyAnimatedWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(seconds: 2));
    _animation = Tween<double>(begin: 0, end: 200).animate(_controller);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) => Container(width: _animation.value, height: 50, color: Colors.blue),
    );
  }
}
```

## Throttling vs Debouncing
Throttling과 Debouncing은 이벤트 처리 최적화 기법이다. Throttling은 이벤트가 반복 발생하더라도 일정 시간 간격마다 한 번만 실행되도록 제한하여 과도한 호출을 막는다. 반면 Debouncing은 이벤트가 여러 번 발생하면 마지막 이벤트가 발생한 이후 일정 시간 동안만 동작하도록 하여 마지막 입력만 반영한다. 무한 스크롤에서 API 호출 제한, 검색 자동완성에서 불필요한 요청 최소화 등 사용자 경험과 성능을 동시에 개선할 수 있다.
```dart
Timer? _debounce;
void onSearchChanged(String query) {
  if (_debounce?.isActive ?? false) _debounce!.cancel();
  _debounce = Timer(Duration(milliseconds: 500), () => print(query));
}

Timer? _throttle;
void onScroll() {
  if (_throttle?.isActive ?? false) return;
  _throttle = Timer(Duration(seconds: 1), () => print("scroll"));
}
```

## 무한 스크롤
리스트 뷰에서 끝까지 스크롤할 때마다 추가 데이터를 가져오는 기능을 무한 스크롤이라고 한다. ScrollController나 NotificationListener를 사용해 현재 스크롤 위치를 감지하고, 리스트 끝에 도달하면 API를 호출하여 새로운 데이터를 추가하는 방식이다. 이를 통해 사용자에게 연속적인 콘텐츠 경험을 제공할 수 있으며, 페이징 처리나 로딩 상태 표시와 함께 구현하는 것이 일반적이다.
```dart
class InfiniteListView extends StatefulWidget {
  @override
  _InfiniteListViewState createState() => _InfiniteListViewState();
}

class _InfiniteListViewState extends State<InfiniteListView> {
  final ScrollController _controller = ScrollController();
  List<int> _items = List.generate(20, (index) => index);

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      if (_controller.position.pixels >= _controller.position.maxScrollExtent) {
        setState(() {
          _items.addAll(List.generate(10, (index) => _items.length + index));
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _controller,
      itemCount: _items.length,
      itemBuilder: (context, index) => ListTile(title: Text('Item ${_items[index]}')),
    );
  }
}
```

## 당겨서 새로고침
사용자가 스크롤 상단에서 화면을 아래로 당기면 콘텐츠를 새로고침하는 기능이다. Flutter에서는 RefreshIndicator 위젯을 사용하며, onRefresh 콜백에서 Future를 반환하면 새로고침 완료 시까지 로딩 스피너가 표시된다. 뉴스 앱이나 SNS 피드, 게시판 앱에서 자주 사용되며 사용자 경험을 직관적으로 개선하는 방법이다.
```dart
RefreshIndicator(
  onRefresh: () async {
    await Future.delayed(Duration(seconds: 2));
    print("refreshed");
  },
  child: ListView.builder(
    itemCount: 20,
    itemBuilder: (context, index) => ListTile(title: Text('Item $index')),
  ),
)
```

## 테마 커스터마이징
Flutter에서 앱 전체의 색상과 스타일을 관리할 때 ThemeData를 사용한다. ThemeExtension을 활용하면 기존 테마에 앱 고유의 색상, 폰트, 스타일 세트를 확장하여 전역에서 일관성 있게 관리할 수 있다. 이를 통해 UI 유지보수가 용이해지고, 앱 전체의 디자인 통일성을 확보할 수 있다.
```dart
class MyColors extends ThemeExtension<MyColors> {
  final Color? primary;
  MyColors({this.primary});

  @override
  MyColors copyWith({Color? primary}) => MyColors(primary: primary ?? this.primary);

  @override
  MyColors lerp(ThemeExtension<MyColors>? other, double t) {
    if (other is! MyColors) return this;
    return MyColors(primary: Color.lerp(primary, other.primary, t));
  }
}

ThemeData(
  extensions: [MyColors(primary: Colors.blue)],
);

## GoRouter
GoRouter는 Navigator 2.0 기반의 선언적 라우팅 패키지이다. URL 기반 라우팅을 지원해 Flutter 웹에서도 자연스러운 페이지 전환과 브라우저 주소 표시를 구현할 수 있다. 복잡한 네비게이션 구조를 선언적으로 관리할 수 있어 유지보수와 테스트가 용이하다.

final GoRouter router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => HomePage()),
    GoRoute(path: '/detail', builder: (context, state) => DetailPage()),
  ],
);
```

## 반응형 UI
반응형 UI는 화면 크기와 해상도에 따라 레이아웃을 동적으로 조정하는 방식이다. MediaQuery로 화면 정보를 얻거나 LayoutBuilder로 부모 제약 조건을 확인하고, flutter_screenutil 같은 패키지를 사용하면 픽셀 밀도에 맞춘 UI를 구현할 수 있다. 모바일, 태블릿, 웹 등 다양한 화면 환경에서 적절한 레이아웃을 제공할 때 필요하다.
```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) {
      return Row(children: [Expanded(child: Text('Wide Screen'))]);
    } else {
      return Column(children: [Text('Narrow Screen')]);
    }
  },
)
```

## Local Notification
flutter_local_notifications 패키지를 사용하면 앱 내에서 스케줄링, 반복 알림, 푸시 알림 없이 로컬 알림을 구현할 수 있다. 사용자가 지정한 시간에 알림을 보내거나 반복 알림을 설정할 때 유용하다.
```dart
final FlutterLocalNotificationsPlugin notifications = FlutterLocalNotificationsPlugin();
await notifications.initialize(InitializationSettings(android: AndroidInitializationSettings('@mipmap/ic_launcher')));
await notifications.show(0, '타이틀', '내용', NotificationDetails(android: AndroidNotificationDetails('id', 'name', importance: Importance.high)));
```

## TensorFlow Lite - YOLOv8
tflite_flutter 패키지를 사용하면 Flutter 앱에서 모델을 로딩하고 추론을 실행할 수 있다. 카메라 스트림과 결합하면 실시간 객체 탐지와 이미지 분석이 가능하다.
```dart
import 'package:tflite_flutter/tflite_flutter.dart';
final interpreter = await Interpreter.fromAsset('model.tflite');
var input = [1.0, 2.0, 3.0];
var output = List.filled(3, 0).reshape([1,3]);
interpreter.run(input, output);
print(output);
```

## StatefulWidget Lifecycle
StatefulWidget의 생명주기 메서드를 이해하면 UI 업데이트와 리소스 관리를 효율적으로 할 수 있다. initState, didChangeDependencies, didUpdateWidget, dispose 등을 적절히 활용해 초기화, 상태 변경, 위젯 제거 시 작업을 처리할 수 있다.
```dart
@override
void initState() {
  super.initState();
  print("initState");
}

@override
void didUpdateWidget(covariant MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  print("didUpdateWidget");
}

@override
void dispose() {
  print("dispose");
  super.dispose();
}
```

## Isolate
Flutter는 단일 스레드로 동작하므로, 무거운 계산은 Isolate나 compute 함수로 분리해야 UI가 멈추지 않는다. Isolate는 독립된 메모리 공간에서 연산을 수행하고 메시지를 통해 결과를 전달한다.
```dart
import 'dart:async';
import 'package:flutter/foundation.dart';
int heavyComputation(int n) {
  int sum = 0;
  for (int i = 0; i < n; i++) sum += i;
  return sum;
}
void run() async {
  int result = await compute(heavyComputation, 1000000);
  print(result);
}
```

## Clean Architecture
Clean Architecture는 관심사를 분리하여 유지보수성과 확장성을 높이는 구조이다. UI, ViewModel, UseCase, Repository, DataSource 계층으로 나누어 구현하며, 각 계층은 단일 책임을 가진다. 이를 통해 테스트 용이성과 재사용성을 확보할 수 있다.
```dart
class GetUserUseCase {
  final UserRepository repository;
  GetUserUseCase(this.repository);
  Future<User> execute(int id) => repository.getUser(id);
}
```

## Gemini 연동
Google AI Gemini 모델과 연동하면 텍스트 생성, 분석, 이미지 처리 등을 앱에서 구현할 수 있다. REST API 호출이나 Firebase Extensions 방식으로 사용할 수 있다.
```dart
final response = await http.post(
  Uri.parse('https://gemini.googleapis.com/v1/predict'),
  headers: {'Authorization': 'Bearer $token'},
  body: jsonEncode({'prompt': 'Hello AI'}),
);
```

## Crashlytics
Firebase Crashlytics는 실제 사용자 환경에서 발생한 앱 오류를 실시간으로 수집하고 분석하는 도구이다. 로그 기록과 예외 보고를 통해 앱 안정성을 개선할 수 있다.
```dart
FirebaseCrashlytics.instance.log("action log");
FirebaseCrashlytics.instance.recordError(exception, stack);
```

## Analytics
Firebase Analytics는 사용자 행동 데이터를 추적하여 앱 개선과 비즈니스 인사이트 확보에 활용된다. 이벤트 기반 데이터 수집으로 사용자의 앱 이용 패턴을 분석할 수 있다.
```dart
FirebaseAnalytics analytics = FirebaseAnalytics.instance;
await analytics.logEvent(name: 'purchase', parameters: {'item': 'Shoes', 'price': 120});
```
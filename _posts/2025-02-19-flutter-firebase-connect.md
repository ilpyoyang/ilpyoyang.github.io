---
title: Flutter에 Firebase 연동하기 (iOS, Android)
author: ilpyo
date: 2025-02-19 00:00:00 +0900
categories: [Flutter]
tags: [Firebase]
pin: false
math: true
mermaid: true
---

Flutter에 Firebase 연동하는 방법을 알아보겠습니다. 먼저 간단하게 Firebase에 계정을 생성하고 프로젝트를 만들어 줍니다. 그리고 프로젝트 생성시에는 필요한 경우에 따라 Gemini, Anaylistics 설정 여부를 선택하고 약관에 동의하면 됩니다. 

## 기본 데이터베이스 세팅
필요한 경우, 연동 확인을 위해 firebase database로 이동해서 샘플 DB를 추가합니다. 세팅을 위해 데이터베이스를 생성해줘야 하는데, 본 설명에서는 연동 확인만을 위해 테스트 모드를 사용했습니다.
- 테스트 모드에서는 기본적으로 모든 사용자가 인증 없이 데이터를 읽고 쓸 수 있도록 설정되며, 주로 개발 및 테스트 과정에서 사용됩니다. 
- 반면, 프로덕션 모드에서는 데이터베이스 접근이 인증된 사용자로 제한되어 보안이 강화됩니다.

<img width="810" alt="Image" src="https://github.com/user-attachments/assets/a51ace85-85a9-4801-9db7-3515a48a950d" />

## iOS 연동하기

<img width="1225" alt="Image" src="https://github.com/user-attachments/assets/576c4f5f-a622-4c1f-b51c-0f675746ea39" />

Firebase 콘솔에서 iOS 앱을 추가하고 `GoogleService-Info.plist` 파일을 다운로드합니다. 이 파일은 Firebase 프로젝트와 iOS 앱을 연결하는 역할을 합니다. 다운로드한 `.plist` 파일을 Flutter 프로젝트의 `ios/Runner` 폴더에 추가한 후, flutterfire와 같은 Firebase 관련 패키지를 `pubspec.yaml`에 추가하여 의존성을 설치합니다. 
의존성은 flutter 명령어를 이용하면 되고, 버전 호환은 에러를 보면서 수정하면 됩니다.
```yaml
firebase_core: ^3.12.0
cloud_firestore: ^5.6.4
```

그 다음, iOS 프로젝트에서 Firebase를 사용하려면 `pod install` 명령을 통해 CocoaPods를 설치하고, 앱을 Firebase와 연결하는 초기화 코드를 추가해야 합니다.  
이 때 버전 호환으로 에러가 발생하는 경우가 있었는데 별도의 `.lock` 파일은 없었으나 다음과 같은 에러가 발생해서 Podfile의 platform ios 버전을 `platform :ios, '13.0'`와 같이 변경해 주었습니다.
```
cocoapods could not find compatible versions for pod "cloud_firestore":
```

## Android 연동하기

<img width="997" alt="Image" src="https://github.com/user-attachments/assets/d77fb338-b144-4431-b0d5-a8ee86850e88" />

Android에서 Firebase를 연동하는 과정은 iOS와 유사합니다. Firebase 콘솔에서 Android 앱을 추가한 후, `google-services.json` 파일을 다운로드하여 Flutter 프로젝트의 `android/app` 폴더에 추가합니다. `build.gradle` 파일에서 Firebase와 관련된 플러그인 및 의존성을 추가하는 부분은 ios에서 해주었기 때문에 별도 추가설정은 없습니다.
`firebase_auth` 설정은 본 설정에서 테스트 모드 적용으로 연동만을 파악하기 때문에 넘어가겠습니다.

## 공통사항 
iOS 연동하기와 Android 연동하기에서 사용된 파일들(`GoogleService-Info.plist`, `google-services.json`)에서 각종 키값을 프로젝트 `main.dart`에 연동을 위해 세팅해줍니다. 

<img width="461" alt="Image" src="https://github.com/user-attachments/assets/0500e062-90bc-4a27-a35f-f223074aac02" />

그리고 build에서 데이터를 잘 불러오는지 다음과 같이 확인이 가능합니다.
```dart
FirebaseFirestore.instance.collection('blog').get().then((value) {
  debugPrint('${value.docs.length}');
});
```

---
title: IntelliJ 템플릿과 단축키
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Tool]
tags: [IntelliJ]
pin: false
math: true
mermaid: true
---

**Live template**  
IntelliJ에서 ```sout```를 치면, ```System.out.println();``` 코드가 자동으로 작성되게 할 수 있습니다. 이렇게 IntelliJ에서 반복된 코드나 템플릿을 활용할 때, ```Live Template```를 사용하면 시간을 단축할 수 있습니다.  
직접 템플릿을 작성하기 위해서는 ```Setting``` - ```Live Template```에서 해당하는 언어에 ```+``` 버튼으로 템플릿을 추가합니다. 예를 들어 아래 예시처럼 ```Testcode Template```를 ```tc```로 설정했다면, java 파일에서 ```tc```를 입력했을 때, template를 자동으로 작성하는 팝업?을 볼 수 있습니다.

![20230529_102411.png](/assets/post_images/ide/20230529_102411.png)

<br>  

**단축키**  
우리의 피땀눈물을 줄여줄 수 있는 윈도우 OS 기준으로 코드를 작성할 때 주로 사용하는 유용한 단축키를 정리했습니다.
+ ```Ctrl```+```Shift```+```F``` ------------------------ 전체 찾기
+ ```Alt```+```Enter``` ------------------------------- Quick Fix
+ ```Ctrl```+```Space``` ------------------------------ 자동완성
+ ```Ctrl```+```/``` ------------------------------------ 주석처리
+ ```Ctrl```+```Alt```+```O``` --------------------------- import문 정리
+ ```Ctrl```+```Alt```+```M``` --------------------------- 메서드 추출
+ ```Alt```/```Ctrl```+```Shift```+```↑```/```↓``` ----------- 코드 위치 변경
+ ```Alt```+```↑```/```↓``` -------------------------------- 세로줄 다중커서

****
[Live templates](https://www.jetbrains.com/help/idea/using-live-templates.html)  
[IntelliJ IDEA keyboard shortcuts](https://www.jetbrains.com/help/idea/mastering-keyboard-shortcuts.html)

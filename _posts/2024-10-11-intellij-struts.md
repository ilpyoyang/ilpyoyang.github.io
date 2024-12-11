---
title: IntelliJ 환경에서 Struts 프로젝트 구동하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Tool]
tags: [IntelliJ, 이슈]
pin: false
math: true
mermaid: true
---

Structs 환경에서 프로젝트 개발 경험은 없는데, 회사에서 오래된 프로젝트를 IntelliJ IDEA 2023.1로 사용하기로 해서 개발환경 설정하는 과정을 기록해두었습니다.

먼저 시작에 앞서 ```tomcat-apache``` 설치가 되어 있어야 합니다. 저는 최신 파일인 apache-tomcat-9.0.74 버전으로 설치했고 ```CATALINA_HOME``` 환경변수를 추가해두었습니다. 그리고 당연히 Java 8버전 설치도 필요하고 환경변수 ```JAVA_HOME``` 설정도 필요합니다.  
프로젝트 파일을 IntelliJ IDEA 2023.1로 열어줍니다. 무료 IntelliJ 구동 환경은 차이가 있습니다. 유료버전을 사용해주세요.

![20230511_154724_1.png](/assets/post_images/ide/20230511_154724_1.png)

<br>

**Setting 설정**  
compiler를 ```Eclipse```로 설정합니다.

![20230511_154724_2.png](/assets/post_images/ide/20230511_154724_2.png)

<br>

**Project Settings 설정**  
여기서 설정해야할 부분은 Project, Modules, Libraries, Facets, Artifacts입니다.

<span style="background-color:#fff5b1">Project 부분</span>에서는 프로젝트와 일치하는 SDK를 설정합니다.

![20230511_154724_3.png](/assets/post_images/ide/20230511_154724_3.png)

<span style="background-color:#fff5b1">Modules 부분</span>에서는 ‘+’로 ```Web``` 형태의 모듈을 추가해줍니다. 저는 name 설정은 자유인데 프로젝트명과 동일하게 변경했습니다. 그리고 ```Deployment Descriptors```와 ```WebResource Directories``` 경로를 변경해줘야 합니다. IntelliJ는 자동으로 기존 프로젝트 구조와 다르게 기본 ```WEB-INF``` 상위 디렉토리로 web을 자동으로 생성해서 추가해줍니다. 하지만 기존 프로젝트에서 ```web.xml``` 위치가 달라서 그에 맞게 둘 다 경로를 변경했습니다.

![20230511_154724_4.png](/assets/post_images/ide/20230511_154724_4.png)

<span style="background-color:#fff5b1">Artifacts 부분</span>에서는 ```Web Application : Exploded```로 추가하고 Module을 선택하면 아까 위에서 모듈이 있으므로 선택해줍니다.

![20230511_154724_6.png](/assets/post_images/ide/20230511_154724_6.png)

<span style="background-color:#fff5b1">Facets 부분</span>은 ```Web```으로 추가하면 자동의 값이 세팅되는데 경로가 맞는지만 확인하면 됩니다.

![20230511_154724_7.png](/assets/post_images/ide/20230511_154724_7.png)

<br>

**ojdbc8.jar 추가**  
기존에 lib 위치에 ```ojdbc8.jar``` 파일이 없어서 [다운로드](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html) 받아서 추가해줬습니다. 자바 버전과 사용이 가능한 파일로 확인해서 추가해야 합니다.

그럼 기본적인 setting은 끝났고 tomcat 연결만 남았습니다.

<br>

**Run/Debug Configurations 설정**  
```Local Tomcat```을 추가합니다. Configure에서 apache-tomcat 경로설정을 합니다. 그리고 나면 fix라는 경고창이 뜨는데 클릭하면 ```Before launch``` 부분에 아까 설정했던 Artifacts가 추가된 것을 볼 수 있습니다. 혹시 경고창이 안 뜬다면 Build 외에 Artifacts가 추가됐는지 확인해주세요.

![20230511_154724_8.png](/assets/post_images/ide/20230511_154724_8.png)

![20230511_154724_9.png](/assets/post_images/ide/20230511_154724_9.png)

<span style="background-color:#FFE6E6">```Deployment``` 탭에서는 그리고 기본 경로 말고, 경로가 ```/```가 될 수 있도록 반드시 세팅해주세요.</span> 기본적으로 fix 경고창에 의해 Artifacts를 앞에 ```Server``` 탭에서 추가를 하면 기본 경로가 Artifacts가 반영된 경로로 설정되어 있을 가능성이 있습니다.  
이렇게 하면 실행해서 ```localhost:8080```으로 페이지가 실행됩니다.

<br>

**참고사항**  
프로젝트를 가져오는 과정에서 디렉토리 root명을 변경한 경우, ```context.xml```에서 ```docBase```를 <span style="background-color:#fff5b1">변경된 이름과 동일하게</span> 변경해줘야 합니다.

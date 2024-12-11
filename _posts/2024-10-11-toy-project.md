---
title: Toy project
author: ilpyo
date: 2024-10-10 11:33:00 +0900
categories: [Kotlin]
tags: [Kotlin, 스터디]
pin: false
math: true
mermaid: true
published: false
---

## Toy Project List 
+ [원티드 백엔드 인턴쉽 사전과제](/manage/2023/09/18/Toy_project.html#원티드-백엔드-인턴쉽-사전과제)

<br><br>

## 원티드 백엔드 인턴쉽 사전과제

<img src="/assets/post_images/project/wanted_internship_assignment.png">

<div class="project-info">
    <div class="classification">GitHub</div>
    <span class="answer">
        <a target="_blank" href="https://github.com/Ilpyo-Yang/wanted-pre-onboarding-backend">wanted-pre-onboarding-backend</a>
    </span><br>
    <div class="classification">프로젝트 구분</div>
    <span class="answer">Backend 개인 프로젝트</span><br>
    <div class="classification">프로젝트 기간</div>
    <span class="answer">2023.08</span><br>
    <div class="classification">기술스택</div><br>
    <span class="answer badge">Java 17</span>
    <span class="answer badge">Spring Boot 3.1.2</span>
    <span class="answer badge">JPA</span>
    <span class="answer badge">Gradle</span>
    <span class="answer badge">jjwt</span>
    <span class="answer badge">JUnit5</span>
    <span class="answer badge">Github Action</span><br>
    <span class="answer badge">AWS EC2, S3, CodeDeploy</span>
</div>

### 프로젝트 소개
게시판에서 필요한 기능들을 만든 API으로 사용자(회원가입, 로그인), 게시글(추가, 전체 조회, 특정 게시글 조회, 수정, 삭제) 기능을 담았습니다. 배포는 GitHub Action, AWS EC2, S3, CodeDeploy를 이용했습니다.  
<a target="_blank" href="https://ilpyo.notion.site/API-d989a5067e384350ae50c3022a503eec?pvs=4">API 명세 바로가기</a>

### 주요 고려사항
#### 1. 어떻게 배포할 것인가에 관하여

<a target="_blank" href="https://ilpyo-yang.github.io/devops/2023/05/08/AWS.html#aws-다양한-배포-방법들">고민의 흔적들</a>  

사전과제의 요구사항 중 하나가 AWS 배포였기 때문에, 기존에 아는 내용에서 빠르게 배포할 수 있는 방법들을 모색했습니다. GitHub Action CI/CD로 사용했는데 이미 버전관리가 Github으로 되어 있고, Travis는 일부 유료버전으로 변경되면서 접근이 제한된 부분이 있었기 때문입니다.
Github 클론을 이용한 jar 배포를 하게 되면 매번 클론을 받아서 EC2에서 빌드를 진행해야 한다는 번거로움과 서버 리소스를 사용하게 됩니다.
따라서 Github Action 이용한 빌드로 zip 파일을 S3에 전송하고 AWS 배포를 진행했습니다.
```yml
- name: Build with Gradle
  run: ./gradlew build
  shell: bash
  
- name: Make Zip File
  run: zip -qq -r ./$GITHUB_SHA.zip .
  shell: bash
```

#### 2. 테스트 코드를 작성하자
테스트 코드 역시 선택과제 중 하나였는데, 단위테스트로 각 API, config에 정의된 util 기능, security 설정과 관련된 기능을 개별로 작성했습니다.
mock 객체를 사용해서 ```resultAction```를 이용한 API 호출과 response 내용을 확인했습니다.
```java
@Test
@DisplayName("과제 3. 새로운 게시글을 생성하는 엔드포인트")
@Rollback(value = false)
void setPost() throws Exception {
    String url = "/api/board";
    BoardDto dto = BoardDto.builder()
        .category("Notice")
        .subject("게시판 테스트를 진행합니다.")
        .contents("posting 통합테스트")
        .userUuid("1da3da6b-bd8f-4835-be2a-bfb1d6d2da09")
        .createdDate(LocalDateTime.now())
        .build();
    
    String token =
        "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbeyJhdXRob3JpdHkiOiJVU0VSIn1dLCJzdWIiOiJURVNUQGdtYWlsLmNvbSIsImlhdCI6MTY5MTQwMzUyOSwiZXhwIjoxNjkxNDAzNjE2fQ.BBjmf89ZKGR0ZUUpIQjFd8WoSwr-Qhvzg8gSMkLZKWs";
    
    ResultActions resultActions = mockMvc.perform(
        post(url)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(dto))
    );
    
    resultActions
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.board").isNotEmpty())
        .andDo(print());
}
```

<br><br>

  

<style>
.project-info{
    border: 0.1rem solid lightgrey;
    padding: 10px;
    border-radius: 5px;
}
.classification{
    font-weight: bold;
    width: 150px;
    display: inline-block;
    line-height: 27px;
}
.badge {
    border-radius: 5px; 
    padding: 4px; 
    border: 0.1px solid lightgrey; 
    color: darkolivegreen;
}
</style>

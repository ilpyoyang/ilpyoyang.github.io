---
title: 환경변수 어떻게 가지고 갈까?
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [DevOps]
tags: []
pin: false
math: true
mermaid: true
---

### 환경변수를 가지고 있는 프로젝트를 배포할 때 어떻게 하는게 좋을까요? 
(컨테이너 이미지로 무중단 배포를 하고 개발자의 휴먼에러를 최대한 줄일 수 있는 방법을 찾는 것을 목표로 하는 경우를 기준으로 합니다.)
참고로 스프링 부트 프로젝트를 기준으로 환경변수는 `시스템 환경 변수 < 자바 시스템 속성 < application.yml < @PropertySource < default.properties 같은 기본 속성파일` 순으로 변수를 인식합니다.
우선순위에 밀려 이 변수가 제대로 인식되지 않으면 `Caused by: java.lang.IllegalArgumentException: Could not resolve placeholder 'jwt.secret' in value "${jwt.secret}"`와 같은 에러가 발생합니다.

### 방법1. .env 파일 만들기
그렇다면 실제 배포를 할 때 환경변수를 어떻게 가지고 가는게 좋을까요? 경험한 프로젝트들에서 일반적으로 `.env` 파일을 만들어 별도로 값을 읽어오는 경우로 되어 있었습니다. 즉 이렇게 하려면 프로젝트 패킹 외에 따로 서버에 ssh로 직접 접속해 파일을 만들거나 옮겨주는 방식으로 하는 것이었습니다. 
실제로 이 방법은 손도 많이 가고 네트워크나 서버 보안 상태에 따라 비밀번호가 바로 유출되는 경험을 할 수 있을 것입니다.

### 방법2. .env 파일을 사용하되 github 액션으로 만들기
Github Action을 사용해서 무중단 배포를 할 때, 소스 레포에 `secrets`를 이용하는 방법입니다. 이렇게 하면 개발자는 직접 서버 접근을 하지 않아도 되기 때문에 `방법1` 보다는 안전하다는 생각이 듭니다. 
그런데 만약에 서버에 누군가 침입해서 `.env` 파일을 지우면 어떻게 될까요? 다시 장애가 발생할 수 있습니다.
(아래 코드에서는 GCP Artifact Registry를 이용해 자동으로 docker 이미지가 재시작되기 때문에 해당 컨테이너를 지우고 다시 `.env` 파일을 이용해 동작시키는 과정입니다.)
```yml
      - name: Pull and Deploy
        uses: appleboy/ssh-action@v1.0.3
        env:
          ENV: ${{ secrets.ENV }}
        with:
          host: ${{ secrets.GCP_SSH_HOST }}
          username: ${{ secrets.GCP_SSH_USERNAME }}
          key: ${{ secrets.GCP_SSH_KEY }}
          port: ${{ secrets.GCP_SSH_PORT }}
          script_stop: true
          script: |
            > .env
            echo "${{ env.ENV }}" >> .env
            docker ps -aq | xargs -r docker rm -f
            docker run -d --restart=always --name todaystock --env-file .env -p 8080:8080 ${{ secrets.GCP_IMAGE_TAG }}
```

### 방법3. 컨테이너 환경변수를 넣어주자
가장 간편한 방법은 단순하게도 클라우드 서버에서 컨테이너 변수를 관리하는 부분에 환경변수를 추가해주는 것입니다.  
Google 서버 보안으로 VPC 네트워크도 설정해 둔 상태이므로 안정적이기도 하지만, 인프라 측면에서 관리할 수 있다는 점과 배포시 다시 run할 필요가 없기도 하고, GCP에서는 설정한 변수를 다시 확인할 수 있다는 장점이 있습니다.  

GCP에는 구글 컨테이너 기반의 OS인 [Google COS](https://cloud.google.com/container-optimized-os/docs?hl=ko)가 있습니다. 기본적으로 Artifact Registry에 이미지를 새로 올리면 그 이미지(latest) 기준으로 COS가 재시작되서 새로운 소스를 반영한 컨테이너 구동을 가능하게 합니다. COS 설정에서 컨테이너에 필요한 환경변수를 직접 설정할 수 있습니다.  
하지만 사용해본 단점으로는 컨테이너 1개를 작동시키는 OS이기 때문에 별도의 컨테이너를 띄우기에는 성능이 부족할 가능성이 높으며, `gcloud` 명령으로 다양한 Google API를 사용하면서 서버 내 로컬 DB를 이용하기에는 어려울 수 있을 것 같습니다. 이것저것 시도를 해봤지만 COS 자체가 컨테이너 한 개 구동을 기반으로 하기 때문입니다.
컨테이너 1개에 Cloud SQL을 사용하거나 이미지 업로드와 자동 배포를 위해서 Docker 기반이 아닌 쿠버네티스 기반으로 하는 [Google Kubernetes Engine(GKE)](https://cloud.google.com/kubernetes-engine/?hl=ko)도 고려해볼 수 있을 것 같습니다.

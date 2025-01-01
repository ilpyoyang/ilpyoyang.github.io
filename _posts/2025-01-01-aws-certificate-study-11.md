---
title: 11부. 한 번에 알아보는 AWS - API Gateway, CICD
author: ilpyo
date: 2025-01-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## API Gateway
API Gateway를 통해 사용자들이 접근할 수 있도록 할 수 있습니다. API에 특화된 기능을 제공하며, 인증 및 권한을 부여하거나 API 버전을 관리하고 서버리스(ex. Lambda)를 지원합니다. 배포하는 방식은 여러가지가 있는데 Endpoint를 하나의 리전에 두고 Edge-Optimized를 사용해 전 세계에서 접근이 가능하게 하거나 하나의 지역에서 CloudFront를 이용하는 방식 또는 VPC에서 ENI를 이용해서 접근하게 하는 방식들이 있습니다. 보안으로는 IAM, Cognito, Custom authorizer를 사용하는 방식들이 있습니다.
- Open API spec 사용이 가능합니다. (aka. Swagger) validation check에 사용이 가능합니다.
- 헤더에 `x-api-key`를 사용해서 사용량을 제한하거나 모니터링할 수 있습니다. 특정 usage plan에 연결된 API를 사용하도록 연결되기 때문입니다.
- CloudWatchLog(`CacheHitCount`, `CacheMissCount`), X-Ray를 이용한 로깅 및 추적이 가능합니다.

### APIs
> Rest API, HTTP API, WebSocket API

#### Rest API vs HTTP API
Rest API는 OAuth 2.0이나 OpenID를 이용한 연결이 불가능합니다. HTTP API는 지연시간이 적고, 비용이 저렴합니다. 하지만 usage plan에 따른 API key는 제공하지 않습니다.

#### WebSocket API
양방향 소통이 가능하며 실시간 작동이 필요한 채팅과 같은 애플리케이션 개발에 필요합니다. 메시지를 반대로 클라이언트에 보낼 때 `ConnectionID`를 사용하게 되는데 이 연결 아이디를 이용합니다. 

```
wss://abcdefg123.execute-api.us-east-1.amazonaws.com/dev
wss://abcdefg123.execute-api.us-east-1.amazonaws.com/dev/@connections/{connectionId}
```

### Stage
- Stage Variables에 따라 특정 Lambda를 호출해서 관리할 수 있습니다.
- Canary Deployment
  - 소량의 트래픽 테스트를 위해서 사용됩니다. 
  - Canary Setting에서 Canary와 Current stage의 트래픽 비율을 정해서 메트릭과 로그를 분리할 수 있습니다.
  - Promote canary를 하면 업데이트로 새로운 버전으로 현재 Stage로 promote할 수 있습니다.

### Mapping Template
매핑될 입력데이터나 출력데이터를 변환하는데 사용합니다. 백엔드로 요청을 보내거나 백엔드에서 받은 응답을 변환하는데 사용됩니다. VTL(Velocity Template Language)를 이용해서 작성됩니다. SOAP API는 XML, REST API는 JSON을 기반으로 합니다.
```
{
    "id": "$input.json('$.userId')",
    "name": "$input.json('$.userName')"
}
```

### Caching
백엔드 호출을 줄일 수 있는 방식으로 TTL은 300초를 기본값으로 갖습니다. Stage별로 캐시 설정이 가능하며 용량은 0.5GB에서 237GB 사이의 값을 갖습니다. 
- 헤더에 `Cache-Control: max-age=0`으로 설정해서 클라이언트에서 캐시를 무효화할 수 있습니다.

### Errors
#### 4xx: 클라이언트 오류 (Client Errors)
- `400` Bad Request: 잘못된 요청 형식.
- `401` Unauthorized: 인증 실패 (API Key 없음 등).
- `403` Forbidden: 권한 부족.
- `404` Not Found: 요청한 리소스 없음.
- `405` Method Not Allowed: 허용되지 않은 HTTP 메서드 사용.
- `406` Not Acceptable: 요청한 형식을 지원하지 않음.
- `408` Request Timeout: 요청 시간이 초과됨.
- `429` Too Many Requests: 호출 횟수 초과 (Rate Limiting).
#### 5xx: 서버 오류 (Server Errors)
- `500` Internal Server Error: 서버 내부 오류.
- `502` Bad Gateway: 백엔드 서비스에서 잘못된 응답.
- `503` Service Unavailable: 서비스가 일시적으로 사용 불가.
- `504` Gateway Timeout: 백엔드 서비스 타임아웃.

### Routing
클라이언트가 보내는 메시지를 서버에서 처리할 때 특정 엔드포인트나 Lambda 함수로 메시지를 전달하는 과정입니다. 다음과 같이 JSON 메시지에서 라우팅할 표현식을 사용할 수 있는데 WebSocket 기반 API의 경우 표현식은 `$request.body.{path_to_body_element}` 형식이어야 합니다. 아래 표현식에서 `$request.body.action`이라고 하면 `join`이라는 변수가 매핑됩니다.
```
{
    "service" : "chat",
    "action" : "join",
    "data" : {
        "room" : "room1234"
   }
}
```
- [API Gateway에서 WebSocket API에 대한 라우팅 생성](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/websocket-api-develop-routes.html)

<span style="background-color:#fff5b1">매핑 템플릿과 달리 메시지가 어떤 경로로 갈지를 지정하는 것으로 매핑 템플릿처럼 그 요청과 응답을 변경하는 것과는 차이가 있습니다.</span>

---

## CICD (Continuous Integration, Continuous Deliver)
> ~~CodeCommit~~, CodePipeline, CodeBuild, CodeDeploy, CodeStar, CodeArtifact, CodeGuru

![](https://docs.aws.amazon.com/ko_kr/whitepapers/latest/cicd_for_5g_networks_on_aws/images/cicd_5g3.png)

AWS에서 코드 관리와 배포를 자동화하는 방법을 알아봅니다. 각 CICD 연관 서비스들은 다음과 같은 기능을 제공합니다.
- ~~CodeCommit – 코드를 저장합니다.~~
- CodePipeline – 코드를 Elastic Beanstalk로 자동 배포하는 파이프라인을 자동화합니다.
- CodeBuild – 코드를 빌드하고 테스트합니다.
- CodeDeploy – EC2 인스턴스에 코드를 배포합니다.
- CodeStar – 소프트웨어 개발 활동을 한 곳에서 관리합니다.
- CodeArtifact – 소프트웨어 패키지를 저장, 게시, 공유합니다.
- CodeGuru – 기계 학습을 이용한 자동 코드 리뷰를 제공합니다.

### CodeCommit
> 2024-07-25일 지원중단

버전 컨트롤을 위해서 사용되며 Git Repo를 온라인에 두어 협업을 할 수 있도록 하는 것이 바람직합니다. AWS에서 코드를 관리하게 되면, 보안과 완전 관리를 제공합니다. Git을 이용하지만 인증, 인가를 위해 SSH key, HTTPS, IAM을 이용해 보안 처리가 됩니다. 이렇게 보안과 호스팅 주체에서 Github과 차이가 있습니다. 

### CodePipeline
CICD 워크플로우를 시각화해서 보여주는 서비스로 Stage 파이프라인에서 빌드, 테스트, 배포 등의 일련의 작업 또는 병렬 작업들을 검토할 수 있게 합니다. 각 과정의 artifacts를 S3에 저장했다가 다음 stage에 보내주는 방식으로 파이프라인 아래 동작합니다. 

### CodeBuild
말 그대로 코드 빌드에 사용되고 코드 파일 루트에 <span style="background-color:#fff5b1">buildspec.yml</span> 파일이 필요합니다. 이 파일에 따라 CodeBuild Container를 실행하고 필요한 Docker image를 가지고 옵니다. 그리고 최종 artifact를 S3 버킷에 파일 캐시를 할 수 있습니다.

buildsepc.yml [예제](https://docs.aws.amazon.com/ko_kr/codebuild/latest/userguide/build-spec-ref.html#build-spec-ref-example)는 다음과 같습니다.
```yml
version: 0.2

run-as: Linux-user-name

env:
  shell: shell-tag
  variables:
    key: "value"
  parameter-store:
    key: "value"
  exported-variables:
    - variable
  secrets-manager:
    key: secret-id:json-key:version-stage:version-id
  git-credential-helper: no | yes

proxy:
  upload-artifacts: no | yes
  logs: no | yes

batch:
  fast-fail: false | true
  # build-list:
  # build-matrix:
  # build-graph:
        
phases:
  install:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    runtime-versions:
      runtime: version
    commands:
      - command
    finally:
      - command
    
  pre_build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
    finally:
      - command
    
  build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
    finally:
      - command
    
  post_build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
    finally:
      - command
    
reports:
  report-group-name-or-arn:
    files:
      - location
    base-directory: location
    discard-paths: no | yes
    file-format: report-format
artifacts:
  files:
    - location
  name: artifact-name
  discard-paths: no | yes
  base-directory: location
  exclude-paths: excluded paths
  enable-symlinks: no | yes
  s3-prefix: prefix
  secondary-artifacts:
    artifactIdentifier:
      files:
        - location
      name: secondary-artifact-name
      discard-paths: no | yes
      base-directory: location
cache:
  paths:
    - path
```

### CodeDeploy
앱을 배포하려고 할 때 EC2 인스턴스, Lambda, ECS 서비스 사용을 고려할 수 있습니다. 배포 속도를 제한하거나 배포시 문제가 생겼을 때 롤백 기능을 제공하는 등 안전한 배포 자동화를 할 수 있게 합니다. CodeDeploy 적용을 위해 `appspec.yml` 배포시 설정사항을 기록한 파일이 있어야 합니다.

```yml
version: 0.0
os: linux
files:
  - source: /app/
    destination: /var/www/myapp/
hooks:
  BeforeInstall:
    - location: scripts/before_install.sh
      timeout: 180
      runas: root
  AfterInstall:
    - location: scripts/after_install.sh
      timeout: 180
      runas: root
  ApplicationStart:
    - location: scripts/application_start.sh
      timeout: 180
      runas: root
  ValidateService:
    - location: scripts/validate_service.sh
      timeout: 180
      runas: root
```

- EC2 인스턴스 배포시
  - IAM 권한이 잇는 CodeDeploy Agent가 S3 버킷에서 소스를 다운받아 배포합니다.
  - ASG를 이용해 In-Place 배포(기존 인스턴스의 업데이트), Blue/Green 배포(새로운 환경을 만들어서 배포하는 방식)를 사용할 수 있습니다.
- Lambda 배포시
  - 점진적 배포를 위해 새로운 버전의 %를 증가시켜가면서 트래픽을 이동시킵니다. Linear 방식으로 `10PercentEvery10Minute`처럼 증가시키거나 Canary를 사용하는 방법, 한 번에 이동시키는 AllAtOnce 전략이 있습니다.
- ECS Cluster 배포시
  - ECS를 사용하는 경우 ECS Cluster에 새로운 버전의 Target Group을 만들어 Lambda와 동일하게 Linear, Canary, AllAtOnce 전략을 사용해 트래픽을 새로운 버전으로 변경합니다.

AWS CodeDeploy에서 롤백이 발생하면, CodeDeploy는 마지막으로 성공한 배포의 리비전을 새로운 배포로 다시 적용합니다. 즉, 기존에 배포되었던 버전을 단순히 복원하는 방식이 아니라, 마지막으로 정상적으로 배포된 리비전을 새로운 배포로 처리합니다.

### CodeArtifacts
VPC 안에 존재해서 코드 종속성을 유지하고 외부 저장소에 의존하지 않고 패키지를 CodeArtifacts 안에 미리 저장하고 있어 안전하게 관리할 수 있습니다. 

### CodeGuru
코드 리뷰와 코드 개선을 위한 서비스를 제공합니다. 발생할 수 있는 위험과 버그, 보안 취약점을 분석하고 권장 사항을 제공합니다. Java, Python을 지원합니다. 

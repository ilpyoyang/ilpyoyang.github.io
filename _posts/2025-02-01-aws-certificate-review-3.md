---
title: DVA-C02 대비자료 4 - Network & CICD
author: ilpyo
date: 2025-02-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## Network

### VPC
- 사용자 지정 VPC 라우트 테이블에 S3, DynamoDB에 대한 Gateway Endpoint를 만들어준다.
- VPC Endpoints에는 interface endpoint와 gateway endpoint가 있습니다.
  - interface endpoint(ENI) 인터넷을 거치고 - private IP
  - gateway endpoint 라우팅 테이블 등록해서 직접
- 퍼블릭 서브넷은 주로 인터넷과 직접 통신해야 하는 리소스(예: 웹 서버, NAT 게이트웨이, ALB 등)를 배치하는 용도로 설계됨
  - Route Table에 Internet Gateway 연결을 위한 경로 추가 필요
- VPC Flow Logs
  - VPC 네트워크 인터페이스에서 들어오고 나가는 IP 트래픽에 대한 정보를 캡처할 수 있는 기능

### API Gateway
- <mark style="background: #FFF3A3A6;">API Gateway API Stage</mark>
  - 테스트의 스테이지 이름에서 prod의 스테이지 이름으로 스테이지 변수 값을 업데이트
  - 스테이지는 API의 수명 주기 상태(예: dev, prod, beta, v2)에 대한 논리적 참조
  - 기존 고객에게 방해를 주지 않으면서 배포가능
  - API를 업데이트할 때마다 API를 기존 스테이지나 새 스테이지에 다시 배포해야 함
- 캐나리아 릴리스 배포는 트래픽의 일부 비율을 새 버전으로 전환하는 방식(Canary 릴리스 배포 옵션)
  - 새 버전으로 사용자 그룹이 이동 가능성 있음
- [API Gateway API 통합 유형](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/api-gateway-api-integration-types.html)
  - AWS: API에서 AWS 서비스 작업을 공개하며, 통합 요청/응답 매핑이 필요.
  - AWS_PROXY: Lambda 함수 호출 작업에 유연하고 간소화된 설정; 통합 요청/응답 설정 필요 없음.
  - HTTP: 백엔드 HTTP 엔드포인트를 공개하며, 통합 요청/응답 설정 필요.
  - HTTP_PROXY: 간소화된 설정으로 HTTP 엔드포인트에 액세스; 통합 요청/응답 설정 필요 없음.
  - MOCK: <mark style="background: #FFF3A3A6;">백엔드 없이 응답 반환</mark>, API 테스트 및 CORS 테스트에 유용.
    - 다양한 구성 요소의 시뮬레이션을 설정
- usage plan을 이용해서 앱 기능 API 공개
- 성능 개선을 위한 API 캐싱 활성화
- VPC에 인터넷 게이트웨이나 NAT 장치가 필요 없이 Amazon S3 및 DynamoDB에 대한 안정적인 연결을 제공
- Mapping Template으로 특정 API 호출에 대한 쿼리 결과를 반환할 수 있도록 설정 가능
- 인증을 위한 지원
  - Cognito User pool, Lambda Authorizer, IAM

### WebSocket API
- 연결이나 대규모 데이터 교환을 관리하기 위해 서버를 프로비저닝하거나 관리할 필요 없이 안전하고 실시간 통신 애플리케이션을 빌드

### Security Group vs. NACL
- 보안 그룹은 상태가 있는(Stateful) 보안 도구이기 때문에 한쪽 방향만 허용하면 반대 방향의 트래픽은 자동으로 허용
- 네트워크 ACL(NACL)은 상태가 없음(Stateless), 아웃바운드 트래픽도 허용처리 필요
  - ELB는 아웃바운트 트래픽 허용을 위한 포트 범위 1024-65535를 NACL 규칙에 추가

### ELB
- 시간초과 에러 - EC2 방화벽 차단
- 연결 실패 에러 - 서버 다운
- 인스턴스가 비정상인 이유
  - health-check 경로가 잘못됨
  - EC2 인스턴스 보안그룹은 ALB의 보안그룹 트래픽을 비허용
- 공개 트래픽과 비공개 트래픽 분리
- 고가용성 시스템 구툭
- EC2 인스턴스와 개인 IP를 사용하여 통신
- ASG를 연결해서 수평확장 가능
- 크로스 존 로드 밸런싱
  - 모든 인스턴스가 동일하게 트래픽을 수신

#### ALB
- 클라이언트와 서버 사이에서 프록시 역할을 함
- ECS와 ALB를 사용해서 도커화와 멀티 포트 지원 (동적 포트매핑)
- 공개적으로 라우팅 가능한 IP주소를 지정할 수 없음
  - 대상 유형이 IP인 경우 특정 CIDR 블록에서만 IP 주소를 지정
- 인스턴스, IP 및 람다의 세 가지 가능한 대상 유형이 있음
- ALB 엑세스 로그
  - 요청을 수신한 시간, 클라이언트의 IP 주소, 대기 시간, 요청 경로 및 서버 응답과 같은 정보
- 에러 종류
  - [HTTP 로드밸런서 에러 종류](https://docs.aws.amazon.com/ko_kr/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html#load-balancer-http-error-codes)
  - `500` - ACL 규칙 실행시 에러, 사용자 클레임의 크기가 11KB를 초과
  - `503` - 로드 밸런서의 대상 그룹에 등록된 대상이 없거나 등록된 모든 대상이`unused`상태에 있습니다.
- 균일 분산되지 않는 이유
  - Sticky Session, 가용성 영역에 균등하게 분포되지 않은 인스턴스
- 가용성 영역을 비활성화한 후에도 해당 가용성 영역의 대상은 로드 밸런서에 등록된 상태로 유지
  - 등록된 상태로 유지되더라도 로드 밸런서는 트래픽을 라우팅하지 않음
- 클라이언트와 서버 간의 요청을 프록시로 중계하므로 클라이언트의 원래 IP 주소를 전달하기 위해 `X-Forwarded-For`를 추가

#### NLB
- OSI(Open Systems Interconnection) 모델의 네 번째 계층에서 작동
  - 들어오는 연결은 수정되지 않으므로 애플리케이션 소프트웨어는 `X-Forwarded-For`를 지원할 필요가 없음
    - `X-Forwarded-For`는 클라이언트의 원래 IP 주소를 식별하기 위해 HTTP 헤더에 추가되는 정보
    - `X-Forwarded-For: <Client-IP>, <Proxy1-IP>, <Proxy2-IP>`

### Route53
- CNAME 레코드
  - DNS 쿼리를 다른 도메인이나 하위 도메인에 매핑
- A 레코드
  - 도메인을 IP 주소로 연결
- Geolocation routing 지원으로 DNS 쿼리가 시작되는 위치를 기반으로 트래픽을 제공하는 리소스를 선택할 수 있음

---

## CICD

### ElasticBeanstalk
- 서버 프로비저닝, 구성 및 배포에 대해 걱정 없이 <mark style="background: #FFF3A3A6;">애플리케이션 코드 작성에만 집중</mark>할 수 있음
  - 인프라 지식 없이도
- 배포 방식
  - 롤링 배포 실패한 인스턴스 처리를 위해 가장 최근에 성공적으로 배포된 애플리케이션 버전을 실행하는 인스턴스로 교체
  - 추가 롤링 배포를 이용하면 배포시간은 증가하나 가용성 감소를 방지할 수 있음
  - Immutable 배포를 통해 새 인스턴스에 새 배포를 진행해서 영향을 최소화
    - 신속 배포하며 다운 타임은 고려하지 않을 때
- 여러 환경을 지원하기 때문에 ALB 연결해서 개발/테스트 환경과 부하테스트 환경을 분리하는 것을 권장
  - Elastic Beanstalk에서 두 환경을 생성
    - `dev-environment` (개발 및 테스트 환경)
    - `loadtest-environment` (부하 테스트 환경)
  - ALB 설정
    - `dev.example.com` -> `dev-environment`
    - `loadtest.example.com` -> `loadtest-environment`
- CloudFormation을 사용하여 리소스를 프로비저닝
- `.ebextensions/`
  - ElastiCache 정의
  - 구성파일 `.ebextensions/<mysettings>.config`
  - Elastic Beanstalk 템플릿의 일부로 생성된 모든 리소스는`.ebextensions` 환경이 종료되면 삭제
  - SSM 매개변수로 재배포 없이 구성파일 변경
  - 매개변수로 나누는 경우 동일 인스턴스에 구성하는 것으로 환경 분리 테스트에는 부적합
- CD와 무관
- worker environments
  - 애플리케이션이 완료하는 데 오랜 시간이 걸리는 작업이나 워크플로를 수행하는 경우 해당 작업을 전용작업자 환경으로 오프로드
  - 이미지나 비디오 처리, 이메일 전송 또는 ZIP 아카이브 생성과 같이 요청을 완료하는 데 걸리는 시간을 크게 늘리는 모든 작업

### CloudFormation
- CloudFormation으로 앱을 만들지는 못하고 AWS 리소스 정의 및 관리를 위한 도구
  - AWS 리소스를 모델링하고 설정하는 데 도움
  - <mark style="background: #FFF3A3A6;">애플리케이션 배포 또는 관리를 위한 자동화는 제공하지 않음</mark>
- Exported Output Values은 단일 region에서 unique한 이름을 가져야 함
- SAM, ElasticBeanstalk 리소스 프로비저닝 제공
- 다양한 리전에 리소스 배포
  - `create-stack-set` 명령을 활용하여 <mark style="background: #FFF3A3A6;">원하는 리전에 스택 세트 생성</mark>
- AWS Lambda 함수와 AWS CloudFormation 템플릿을 AWS에 업로드
  - `cloudformation package`, `cloudformation deploy`
- 프로비저닝된 스택 삭제 순서
  - 참조로 만들어진 스택부터 삭제 > 참조된 스택 삭제
- 부트스트랩 중 `/etc/ecs/ecs.config` 파일에서 클러스터 이름 매개변수가 업데이트 필요

```
#!/bin/bash
echo "ECS_CLUSTER=MyCluster" >> /etc/ecs/ecs.config
```

- `Conditions`섹션 조건?
  - `Resources`, `Conditions`, `Outputs`
  - `Parameters` 섹션은 Condition과는 직접적인 관계가 없으며, 주로 템플릿에서 사용하는 변수를 정의하는 역할
- 가상 매개변수
  - CloudFormation에서 미리 정의된 매개변수
  - `Value: !Ref "AWS::Region"`
- `!FindInMap [MappingName, TopLevelKey, SecondLevelKey]`
  - 매핑 값 조회를 위해 사용되며 EC2 인스턴스의 AMI((Amazon Machine Image)) 설정시에 다음과 같이 사용됨
    - `MappingName`: `RegionMap`
    - `TopLevelKey`: `us-east-1` 또는 `us-west-1`
    - `SecondLevelKey`: `AMI`

```
Mappings:
  RegionMap:
    us-east-1:
      AMI: ami-0abcdef1234567890
    us-west-1:
      AMI: ami-0fedcba9876543210
```

- 매개변수 유형은 종속 매개변수 유형은 불가, 모든 매개변수는 서로 독립적
- 허용되는 EC2 유형을 규정

```
Parameters:
  ParameterLogicalID:
    Description: Information about the parameter
    Type: DataType
    Default: value
    AllowedValues:
      - value1
      - value2
```

### CDK
- AWS CDK로 애플리케이션을 생성하는 순서
  - AWS CDK에서 제공하는 템플릿에서 앱 생성 - `cdk init`
    -> 스택 내에서 리소스를 생성하기 위해 앱에 코드 추가
    -> 앱 빌드(선택 사항)
    -> 앱에서 하나 이상의 스택 합성
    -> AWS 계정에 스택 배포 - `cdk deploy`
- 익숙한 언어로 인프라를 정의하려고 할 때 사용
  - Python, .NET 및 Javascript
- `cdk synth` 및 `sam local invoke`
  - CDK 프로젝트 개발, 로컬 테스트를 하고자 하는 경우
  - CloudFormation 스택을 생성, 워크스테이션에는 AWS Serverless Application Model(AWS SAM)과 AWS CDK가 로컬에 설치 조건

### SAM
- 간결한 선언적 템플릿으로 서버리스 인프라를 정의하는 것을 선호하는 경우
- EC2 배포해야 하는 웹서비스에 부적합
- Python, Node.js, Java 제공
- <mark style="background: #FFF3A3A6;">YAML로 리소스를 정의</mark>하고, `sam deploy`로 배포
  - 서버리스이며 Amazon API Gateway, Amazon DynamoDB, AWS Lambda를 사용할 수 있음
- 지원 가능한 리소스
  - `AWS::서버리스::API`
  - `AWS::서버리스::애플리케이션`
  - `AWS::서버리스::함수`
  - `AWS::서버리스::HttpApi`
  - `AWS::서버리스::레이어버전`
  - `AWS::서버리스::심플테이블`
  - `AWS::서버리스::스테이트머신`
- 섹션 이 있는 경우`Transform`은 SAM 템플릿임을 나타냄
  - 호환되는 AWS CloudFormation 템플릿으로 변환하고 확장
- `sam sync` 증분변경
- 가벼운 애플리케이션 배포를 위해서는 SAM이 적합
  - EKS, ECS, Elastic BeanStalk은 과다 오버헤드 및 비용 발생

### CodeCommit
- AWS Access Key
- SSH Key
- IAM에서 생성된 Git 자격 증명 사용
  - CodeCommit 리포지토리는 Git 기반이며 Git 자격 증명과 같은 Git의 기본 기능을 지원
  - IAM 사용자 이름과 비밀번호는 지원하지 않음
- 저장소는 저장시 자동으로 암호화

### CodeBuild
- 시간초과 빌드에 대해서는 큐에서 삭제되도록 처리가 가능
- 루트 디렉토리에 `buildspec.yml`
- CloudWatch Logs > S3 > Athena 분석
  - 쿼리를 이용한 분석이 필요한 경우 단순히 Event 처리로는 부족
- 자동으로 확장되므로 조직은 확장이나 병렬 빌드를 위해 아무것도 할 필요가 없음
- 외부 repo 종속성 해결을 위해 S3 캐시 종속성 활용
- `PullRequestSourceBranchUpdated`, `PullRequestCreated`

### CodeDepoly
- In-Placement Deployment, Blue/Green Deployment
  - 롤링 배포는 Elastic Beanstalk에서만 제공
- 지속적인 배포, 요구사항, 배포 프로세스 자동화에 적합
- 루트 디렉토리에 `appspec.yml`
  - hooks 섹션에 이벤트가 발견되면 실행할 스크립트 목록을 검색
- ApplicationStop > BeforeInstall > Install > AfterInstall > ApplicationStart > ValidateService
  - `ValidateService` - 배포가 성공적으로 완료되었는지 확인
- CodeDepoly Agent를 사용해서 최대 두 개의 애플리케이션 개정판을 보관할 수 있음
- `CodeDeployDefault.ECSCanary10Percent15Minutes`
  - ECS 배포
  - 새 버전에 라이브 트래픽의 10%만 노출
  - 그 다음 15분이 지나면 회사는 나머지 모든 라이브 트래픽을 배포된 애플리케이션의 새 버전으로 라우팅

### CodePipeline
- 전체 흐름에 대해 하나의 CodePipeline을 만들고 수동 승인 단계를 추가

### AWS Amplify
- 모바일 및 웹 애플리케이션 개발을 위한 클라우드 기반 개발 플랫폼
- AWS Amplify Hosting을 통해 <mark style="background: #FFF3A3A6;">amplify.yml 빌드 설정에 애플리케이션의 테스트 단계를 추가하면 애플리케이션에 엔드투엔드 테스트가 가능</mark>

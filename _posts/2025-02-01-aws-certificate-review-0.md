---
title: DVA-C02 대비자료 1 - Server & Serverless
author: ilpyo
date: 2025-02-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

### EC2
- EC2 burst balance
  - 기본적으로 제공되는 일정 수준의 CPU 성능 외에 CPU 크레딧을 사용해 성능을 높일 수 있음
  - T2 또는 T3 타입의 EC2 인스턴스에서 발생
  - 기존 인스턴스의 burst credit 초기화 가능성
    - Immutable deployments / Traffic-splitting deployments 소실됨, 초기화됨
    - Rolling deployment / All-at-once deployment 초기화되지 않음
- 기본적으로 사용자 데이터로 입력된 스크립트는 루트 사용자 권한으로 실행
- 사용자 데이터는 처음 시작시 부팅 주기에만 실행
- 전용 인스턴스가 전용 호스트보다 저렴 < 온디맨드 인스턴스 비용
  - 전용 인스턴스는 단일 고객에게 전용된 하드웨어에서 가상 사설 클라우드(VPC)에서 실행되는 Amazon EC2 인스턴스
  - 단일 테넌트로 관리
- Zonal(영역) Reserved Instance는 용량 예약을 제공하지만 Regional(지역) 예약은 용량 예약을 제공하지 않음
- 프로비저닝된 IOPS 대 요청된 볼륨 크기(GiB 단위)의 최대 비율은 50:1
  - 즉 200GiB 볼륨 크기의 경우 가능한 IOPS는 10,000 IOPS
-  모니터링 설정
  - `aws ec2 monitor-instances --instance-ids i-1234567890abcdef0`
- 인스턴스의 퍼블릭 IPv4 주소 알아내는 법
  - `http://169.254.169.254/latest/meta-data/`에서 인스턴스 메타데이터를 쿼리

#### ASG
- S3에 파일 업로드하여 ASG 인스턴스에서 사용할 수 있도록 함
- Target Tracking Scaling Policy Metric - 사전에 정의된 메트릭
  - `ASGAverageCPUUtilization`
  - `ASGAverageNetworkOut`
  - `ALBRequestCountPerTarget`
- ALB와 사용해서 병목현상 해결
- 동일한 region 내의 가용성 영역 하나 이상에 EC2 인스턴스를 포함할 수 있음
- 여러 지역에 걸쳐서 사용하기 위해서는 지정된 모든 지역에 활성화되어야 함
- 최소 인스턴스가 1인 경우 하나의 가용성 영역에서만 작동하기 때문에 사용률이 낮은 기간 가용성 영역 전체가 다운될 가능성이 있음
  - 즉, 이 경우에는 최소 인스턴스 용량을 증가시킬 필요가 있음

![[Pasted image 20250130230219.png]]
- AMI 생성을 최신 상태마다 할 필요는 없고 애플리케이션에 대해서만 최신 상태를 적용할 수 있도록 CodeDeploy를 설정
- 이것도 답이 갈리는데 최신버전의 AMI가 필요하다는 의견과 AMI는 계속 만들 필요 없다는 의견이 있었다..

### Lambda
- memory를 증가시켜서 CPU도  비례하게 증가시킬 수 있음
  - 컴퓨팅 집약적 작업 부하를 처리하기 위한 방법
- 런타임에 사용할 수 있는 최대 메모리 양은 10,240MB
  - RAM이 부족하면 실행이 되지 않고 오류 메시지 발생
- 서버를 프로비저닝하거나 관리하지 않고도 코드를 실행
- Alias
  - 별칭을 가리키는 별칭은 없음
  - 별칭은 Lambda 버전을 가리킴
  - 현재 버전을 가리키는 별칭을 사용하도록 애플리케이션을 설정합니다. 새 버전의 코드를 배포하고 별칭을 구성하여 사용자의 10%를 이 새 버전으로 보냅니다. 배포가 잘못되면 별칭을 재설정하여 모든 트래픽을 현재 버전으로 가리킵니다.
- Lambda는 EC2 인스턴스에서 처리할 수 없음
- <mark style="background: #FFF3A3A6;">RDS 연결을 위해 필요한 개인 서브넷 및 보안 그룹에 VPC와 연결</mark>
- DynamoDB에 쓰기를 위한 IAM 권한 필요
- Lambda Authorizer를 사용하면 API Gateway 클라이언트 호출을 제3자 권한 부여 매커니즘을 적용
- Provisioned Concurrency을 이용해서 ASG와 결합해 자동 스케일링 가능
  - 예측 가능한 트래픽 급증에 대비하기 위해 미리 준비된 인스턴스를 유지
- Reserved Concurrency은 지정된 동시성만큼 리소스를 예약하는 것으로 트래픽을 제한하기 위한 것이 중점
- 컨테이너 이미지 이용하기 위해서는 Lambda Runtime API를 구현
  - 다중 아키텍처 컨테이너 이미지 사용은 지원하지 않음
  - Linux 기반 컨테이너 이미지만 지원
  - 최대 10GB 크키 컨테이너 이미지 배포 가능
- Lambda 함수 코드에 로깅 문을 삽입해야 하며 이는 CloudWatch 로그를 통해 사용
- 초기 실행 컨텍스트 스크립트 이용
  - S3 클라이언트 초기화를 함수 핸들러 밖으로 이동
  - 함수 핸들러 외부에서 SDK 클라이언트와 데이터베이스 연결을 초기화하고 정적 자산을 `/tmp` 디렉터리에 로컬로 캐시
- 환경변수의 총 크기는 4KB를 초과할 수 없고, 변수 수의 제한은 없음
  - <mark style="background: #FFF3A3A6;">환경변수</mark>를 이용해서 Lambda 수정 없이 테이블명 변경
- <mark style="background: #FFF3A3A6;">Lambda Layer로 필요한 라이브러리를 같이 사용할 수 있도록 설정</mark>
- AWS 요청 ID는 <mark style="background: #FFF3A3A6;">Lambda 함수의 컨텍스트 객체(context)</mark>에 포함되어 있는 고유한 식별자
- Lambda 함수는 표준 출력(`console.log` 등)을 통해 로그를 AWS CloudWatch에 자동으로 기록
- <mark style="background: #FFF3A3A6;">destination Lambda</mark> 설정으로 최소한의 개발로 이후 처리를 할 수 있음

### AppSync
- AWS DynamoDB, Lambda 등과 같은 데이터 소스에 안전하게 연결하는 힘든 작업을 처리하여 GraphQL API를 쉽게 개발할 수 있는 완전 관리형 서비스

### ECS
- `STOPPED` 상태 인스턴스에 대한 동기화 문제
  - 컨테이너 인스턴스 종료했지만 컨테이너 인스턴스는 ECS 클러스터에서 리소스로 계속 나타나는 현상 발생
  - Amazon ECS 콘솔이나 AWS 명령줄 인터페이스를 사용하여 STOPPED 상태의 컨테이너 인스턴스를 등록 해제
- ElasticBeanstalk보다 ECS가 더 세밀한 컨트롤이 가능

#### ECS Fargate
- 일반적으로 여러 가용성 영역(AZ)에 분산
- 컨테이너 작업을 위해 구성된 데이터 볼륨에 대한 지속적인 교차 AZ 공유 액세스가 필요
  - EFS 볼륨을 사용
  - 바인트 마운드는 임시 저장소를 제공하기에 부적합
  - Docker 볼륨은 EC2 인스턴스 내의 작업에만 지원

### AMI
- AMI의 암호화를 통해 여러 AWS 지역에서 애플리케이션을 확장
  - <mark style="background: #FFF3A3A6;">새 AMI를 만들고 암호화 매개변수를 지정</mark>
  - <mark style="background: #FFF3A3A6;">암호화된 AMI를 대상 지역으로 복사</mark>
  - 암호화되지 않은 AMI를 삭제

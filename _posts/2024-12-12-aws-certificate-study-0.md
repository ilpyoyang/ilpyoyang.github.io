---
title: 한 번에 알아보는 AWS 시작하며
author: ilpyo
date: 2024-12-12 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

![image](https://github.com/user-attachments/assets/63118a91-7ff5-4b94-a050-83f3c4fd05bf)

AWS 학습을 하면서 정리한 내용으로 제시된 예시 코드와 이미지는 모두 AWS Docs에 출처를 두고 있습니다.

## 포스팅 내용 리스트
- [한 번에 알아보는 AWS 시작하며](/posts/aws-certificate-study-0/)
- [1부. 한 번에 알아보는 AWS - IAM, EC2, EC2 Instance Storage](/posts/aws-certificate-study-1/)
- [2부. 한 번에 알아보는 AWS - ELB, ASG, RDS, Aurora, ElastiCache](/posts/aws-certificate-study-2/)
- [3부. 한 번에 알아보는 AWS - Route53, VPC](/posts/aws-certificate-study-3/)
- [4부. 한 번에 알아보는 AWS - S3, CloudFront](/posts/aws-certificate-study-4/)
- [5부. 한 번에 알아보는 AWS - ECS, ECR, Copilot, EKS](/posts/aws-certificate-study-5/)
- [6부. 한 번에 알아보는 AWS - Elastic Beanstalk, CloudFormation](/posts/aws-certificate-study-6/)
- [7부. 한 번에 알아보는 AWS - SQS, SNS, Kinesis](/posts/aws-certificate-study-7/)
- [8부. 한 번에 알아보는 AWS - CloudWatch, CloudTrail](/posts/aws-certificate-study-8/)
- [9부. 한 번에 알아보는 AWS - Lambda](/posts/aws-certificate-study-9/)
- [10부. 한 번에 알아보는 AWS - DynamoDB](/posts/aws-certificate-study-10/)
- [11부. 한 번에 알아보는 AWS - API Gateway, CICD](/posts/aws-certificate-study-11/)
- [12부. 한 번에 알아보는 AWS - SAM, CDK, Cognito, Other Serverless Services](/posts/aws-certificate-study-12/)
- [13부. 한 번에 알아보는 AWS - Security, ETC](/posts/aws-certificate-study-13/)

## 연관 포스팅 리스트
- [DVA-C02 대비자료 1 - Server & Serverless](/posts/aws-certificate-review-0/)
- [DVA-C02 대비자료 2 - Storage](/posts/aws-certificate-review-1/)
- [DVA-C02 대비자료 3 - Security & Logging & Monitoring](/posts/aws-certificate-review-2/)
- [DVA-C02 대비자료 4 - Network & CICD](/posts/aws-certificate-review-3/)
- [DVA-C02 대비자료 5 - Event Handling & Data Streaming](/posts/aws-certificate-review-4/)

## AWS 서비스별 분류
### 컴퓨팅 (Compute)

| **서비스**                            | **설명**                                                  |
|-------------------------------------|---------------------------------------------------------|
| **EC2 (Elastic Compute Cloud)**     | 가상 서버 인스턴스를 제공하여 애플리케이션 실행.                  |
| **Lambda**                          | 서버리스 컴퓨팅 서비스로, 서버 관리 없이 코드를 실행.            |
| **ECS (Elastic Container Service)** | Docker 컨테이너를 관리하고 배포하는 서비스.                   |
| **EKS (Elastic Kubernetes Service)**| Kubernetes 클러스터를 관리하는 서비스.                      |
| **Fargate**                         | 서버리스 컨테이너 실행 엔진 (ECS와 EKS에서 사용).              |
| **Lightsail**                       | 간단한 웹 애플리케이션 및 사이트 호스팅을 위한 가상 서버 서비스.     |
| **Batch**                           | 대규모 배치 작업을 처리하는 완전 관리형 배치 처리 서비스.          |

### 저장소 (Storage)

| **서비스**                          | **설명**                                                  |
|-----------------------------------|---------------------------------------------------------|
| **S3 (Simple Storage Service)**   | 객체 스토리지 서비스, 파일 저장 및 관리.                     |
| **EBS (Elastic Block Store)**     | EC2 인스턴스에 블록 수준의 스토리지 제공.                    |
| **EFS (Elastic File System)**     | 네트워크 파일 시스템 서비스.                              |
| **FSx**                           | 고성능 파일 시스템 (Windows 및 Lustre 기반).               |
| **Glacier**                       | 아카이브용 데이터 저장소 서비스.                           |
| **Storage Gateway**               | 온프레미스와 클라우드 간 데이터 통합을 위한 서비스.            |

### 데이터베이스 (Database)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **RDS (Relational Database Service)** | 관계형 데이터베이스 관리 서비스.                        |
| **DynamoDB**                      | NoSQL 데이터베이스 서비스.                                |
| **Aurora**                        | 고성능 관계형 데이터베이스 서비스 (MySQL, PostgreSQL 호환). |
| **ElastiCache**                   | 분산 캐시 서비스 (Redis, Memcached 지원).                 |
| **Neptune**                       | 그래프 데이터베이스 서비스.                               |
| **Redshift**                      | 데이터 웨어하우스 서비스.                                |
| **DocumentDB**                    | MongoDB 호환 NoSQL 데이터베이스 서비스.                   |

### 네트워킹 (Networking)

| **서비스**                          | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **VPC (Virtual Private Cloud)**   | 가상 네트워크를 생성하고 관리하는 서비스.                   |
| **Route 53**                      | 도메인 네임 시스템 (DNS) 및 트래픽 라우팅 서비스.            |
| **CloudFront**                    | 콘텐츠 전송 네트워크 (CDN) 서비스.                         |
| **Direct Connect**                | 온프레미스와 AWS 간 전용 네트워크 연결 서비스.              |
| **API Gateway**                   | RESTful API 및 WebSocket API 서비스를 제공하는 서비스.       |
| **Elastic Load Balancing (ELB)**  | 트래픽을 여러 서버에 분배하는 로드 밸런서 서비스.            |

### 보안 (Security & Identity)

| **서비스**                          | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **IAM (Identity and Access Management)** | 리소스에 대한 접근 제어 및 권한 관리 서비스.             |
| **Cognito**                       | 사용자 인증 및 사용자 관리 서비스.                       |
| **KMS (Key Management Service)**  | 암호화 키 관리 서비스.                                    |
| **Secrets Manager**               | 비밀번호 및 비밀 관리 서비스.                              |

### 애플리케이션 서비스 (App Services)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **SQS (Simple Queue Service)**   | 메시지 큐 서비스.                                         |
| **SNS (Simple Notification Service)** | 메시지 및 알림 서비스.                                 |
| **Step Functions**               | 워크플로우 오케스트레이션 서비스.                         |
| **AppSync**                      | GraphQL API 관리 서비스.                                |
| **Simple Email Service (SES)**   | 이메일 발송 및 관리 서비스.                               |

### 분석 (Analytics)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **Athena**                        | S3 데이터에 대해 SQL 쿼리를 실행하는 서비스.              |
| **EMR (Elastic MapReduce)**       | 빅 데이터 분석을 위한 Hadoop 기반 클러스터 관리 서비스.   |
| **Kinesis**                       | 실시간 데이터 스트리밍 처리 서비스.                       |
| **QuickSight**                    | BI(Business Intelligence) 서비스.                        |
| **Glue**                          | 서버리스 ETL(추출, 변환, 로딩) 서비스.                   |

### 기계 학습 (Machine Learning)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **SageMaker**                     | 머신러닝 모델 개발, 훈련 및 배포를 위한 완전 관리형 서비스. |
| **Rekognition**                   | 이미지 및 비디오 분석을 위한 AI 서비스.                   |
| **Comprehend**                    | 자연어 처리(NLP) 서비스.                                 |
| **Lex**                           | 대화형 AI 서비스(챗봇) 서비스.                            |
| **Polly**                         | 텍스트를 음성으로 변환하는 서비스.                        |

### 관리 및 거버넌스 (Management & Governance)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **CloudWatch**                    | 애플리케이션 및 리소스 모니터링 서비스.                   |
| **CloudTrail**                    | API 호출을 기록하여 감사 및 모니터링 서비스.              |
| **AWS Config**                    | AWS 리소스 구성 기록 및 변경 사항 추적 서비스.           |
| **Systems Manager**               | 시스템 관리 및 자동화 서비스.                             |
| **Trusted Advisor**               | AWS 사용 권장 사항 제공 서비스.                          |

### 개발 도구 (Developer Tools)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **CodeCommit**                    | Git 기반 소스 코드 저장소 서비스.                        |
| **CodeBuild**                     | 코드 빌드 및 테스트 서비스.                              |
| **CodeDeploy**                    | 코드 배포 자동화 서비스.                                  |
| **CodePipeline**                  | CI/CD 파이프라인 자동화 서비스.                           |
| **CodeStar**                      | 소프트웨어 개발 관리 서비스.                             |

### IoT (Internet of Things)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **IoT Core**                      | IoT 장치 연결 및 관리 서비스.                            |
| **IoT Greengrass**                | 엣지 컴퓨팅을 위한 IoT 서비스.                            |
| **IoT Analytics**                 | IoT 데이터를 분석하는 서비스.                            |

### 로봇 (Robotics)

| **서비스**                         | **설명**                                                  |
|----------------------------------|---------------------------------------------------------|
| **RoboMaker**                     | 로봇 애플리케이션 개발 및 배포 서비스.                    |

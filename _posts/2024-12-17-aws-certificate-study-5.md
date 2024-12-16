---
title: 5부. 한 번에 알아보는 AWS - ECS, ECR, Copilot, EKS
author: ilpyo
date: 2024-12-17 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## Docker
앱을 배포하기 위한 소프트웨어 플랫폼을 말합니다. 어떤 OS에서든지 컨테이너로 앱이 돌아가게 할 수 있게 됩니다. 도커 이미지는 Docker Hub에 공개 repository로 올리거나 Amazon ECR을 이용해 공개 또는 비공개 repository를 만들어 저장할 수 있습니다.  
VM을 이용한 방식과 달리 OS 위에 Docker Daemon을 사용해서 여러 컨테이너를 구동할 수 있습니다.

---

## ECS(Elastic Cloud Service)
ECS는 아마존의 컨테이너 플랫폼으로 ECS Cluster에서 ECS Tasks를 정의해서 사용할 수 있습니다. EC2 Instance Profile을 이용해서 인스턴스를 만들고 ECS Agent를 이용해서 컨테이너 배포를 합니다. 또는 쳬필요한 CPU, Memory를 정해서 Serverless 방식인 Fargate를 사용할 수도 있습니다.
- ECS, ECR, CloudWatch Logs를 연결해서 사용할 수 있습니다.
- ALB, NLB를 사용해서 ECS Tasks에 연결할 수 있습니다.
- EFS로 EC2 Instance 또는 Fargate에 마운트해서 ECS tasks로 사용할 수 있습니다.
  - <span style="background-color:#fff5b1">S3의 마운트는 불가능합니다.</span>

![](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/images/ecs-lifecycle.png)

### ECS Tasks
#### Task Definition
Task Definition을 이용해서 각각의 역할을 지정할 수 있습니다. Task Definition은 json 형태의 메타데이터로 어떻게 컨테이너를 돌릴지에 대한 내용을 담고 있습니다.
- 이미지 이름
- 컨테이너에 연결할 포트와 호스트
  - <span style="background-color:#fff5b1">무작위 호스트 포트를 활성화하려면 호스트 포트를 0(또는 비어 있음)으로 설정하세요. 이렇게 하면 동일한 EC2 컨테이너 인스턴스에서 동일한 유형의 여러 컨테이너를 실행할 수 있습니다.</span>
- 메모리와 CPU 필요량
- 환경변수
- 네트워크 연결에 필요한 정보
- <span style="background-color:#fff5b1">IAM 역할</span>
- 로깅에 대한 설정(ex. CloudWatch)
  - Bind Mount로 Storage를 공유해서 컨테이너가 같이 사용할 수 있습니다.
  - 또 이 로그 정보를 Sidecar 컨테이너에서 사용할 수도 있습니다.
#### Task Placements
어떤 EC2 인스턴스에 task를 위치할 것인지에 대해 설정하는 부분입니다. Task Placements에도 다양한 전략들이 있습니다. 이 전략들은 혼합해서 사용할 수 있습니다.
- `Binpack` - 하나의 인스턴스를 다 채운 다음에 다른 인스턴스에 task를 두는 방식입니다. (비용절감 방식)
- `Random` - 랜덤으로 배치
- `Spread` - 특정 값에 따라 동일하게 task가 분배되는 방식입니다.
  제약 조건으로 `distinctInstance`는 모두 다른 인스턴스에서 task가 실행되어야 한다는 조건이고, `memberOf`는 어떤 종류의 인스턴스(ex. `t2`)에 해당하는 곳에서 task가 실행되어야 함을 나타낼 수 있습니다.

### Auto Scaling
AWS Application Auto Scaling을 사용합니다. 작업량을 자동으로 조절할 수 있습니다. EC2 인스턴스를 사용하고 있는 경우에는 ECS Cluster Capacity Provider를 이용하거나 ASG를 이용하는 방법이 있습니다.
- CPU Utilization
- Sale on RAM
- ALB Request Count Per Target

### Rolling Updates
task 수와 `minimumHealthyPercent`, `maximumPercent` 설정에 따라 task 버전 업데이트가 가능해집니다.  
예를 들어 `minimumHealthyPercent`가 50%이고, `maximumPercent`가 100%이고, task가 처음에 4개라고 가정합니다. 그럼 최대 4개까지 가능하므로 2개의 이전 버전을 지웁니다. 그리고 2개의 새로운 버전을 실행합니다. 이렇게 총 4개의 task가 있는 상태에서 변경하지 못한 2개의 이전 버전을 지우고 다시 2개의 새로운 버전을 실행합니다. 이렇게 결과적으로 4개의 새로운 버전이 실행될 수 있습니다.

![rolling-update](https://github.com/user-attachments/assets/8487c9cd-7d73-41ec-b58f-d384e4cf1346)

---

## ECR(Elastic Cloud Repository)
도커 이미지를 저장하거나 관리하는데 사용할 수 있고 public 또는 private 저장소로 관리가 가능합니다.
[AWS CLI를 이용해서 ECR 작업](https://docs.aws.amazon.com/ko_kr/cli/v1/userguide/cli_ecr_code_examples.html)을 할 수 있습니다.
```
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
docker pull $ECR_IMAGE_URL
```

---

## AWS Copilot
AWS에서 제공하는 CLI 툴로 서비스는 아닙니다. Copilot을 이용해서 빌드, 배포 등 작업을 하는데 사용합니다.
- [Install Copliot](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/copilot-install.html)
- [AWS Copilot CLI를 사용하여 샘플 Amazon ECS 애플리케이션 배포](https://docs.aws.amazon.com/ko_kr/AmazonECS/latest/developerguide/copilot-deploy.html)

---

## EKS(Elastic Kubernetes Service)
쿠버네티스 클러스터를 쉽게 만들고 관리할 수 있는 서비스입니다. Kubernetes는 컨테이너화된 애플리케이션의 배포, 관리 및 확장을 자동화하는 오픈소스 시스템으로, EKS는 이를 AWS 클라우드 환경에서 손쉽게 사용할 수 있도록 해줍니다.
![](https://d1.awsstatic.com/product-page-diagram_Amazon-EKS%402x.ddc48a43756bff3baead68406d3cac88b4151a7e.ddc48a43756bff3baead68406d3cac88b4151a7e.png)
### Node Types
- Managed Node Groups - 노드 생성과 관리를 제공
- Self-Managed Nodes - 사용자에 의한 노드 생성
- AWS Fargate

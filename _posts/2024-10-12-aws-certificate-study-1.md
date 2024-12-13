---
title: 1부. 한 번에 알아보는 AWS - IAM, EC2, EC2 Instance Storage
author: ilpyo
date: 2024-10-12 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

AWS에는 다양한 리전이 있는데 서비스나 사용자가 많은 위치로 지정해주면 됩니다. [region table 참조](https://aws.amazon.com/ko/about-aws/global-infrastructure/regional-product-services/)

## IAM & AWS CLI
> Users, Groups, Policies, Roles, Security, AWS CLI, AWS SDK, Access Key, Audit

### IAM
사용자를 생성하고 그룹을 할당하는 서비스입니다.

AWS 계정을 사용할 권한을 그룹으로 묶어서 역할을 지정하는데 사용합니다. 그룹으로 역할을 설정하고 사용자를 그룹에 지정해서 자동으로 역할을 부여할 수 있도록 하는 방식입니다. 당연하게도 그룹없이도 인라인 방식으로 정책을 부여할 수 있습니다.
- <span style="background-color:#fff5b1">IAM 그룹은 사용자를 포함하지만 그룹을 포함하지는 않습니다.</span>

Sign in IAM user로 로그인한 경우에는 오른쪽 상단에 IAM User 정보가 있음을 알 수 있습니다.
#### IAM Policies Structure
정책 구조에서 IAM에서 여떤 역할을 가지고 있고, 유효한지 여부 등을 확인할 수 있습니다. Statement는 Version을 포함하지는 않고 Effect, Action, Resource, Principle을 포합합니다.
```
{
  “Version”: “2024–10–12”,
  “Statement”: {
    “Effect”: “Allow”,
    “Action”: [
      “iam:RemoveUserFromGroup”,
    ],
    “Resource”: [
      “arn:aws:iam::609103258633:group/Developers”,
      “arn:aws:iam::609103258633:group/Operators”
    ]
  }
}
```
#### IAM Roles
역할을 생성할 수도 있는데 서비스, 계정 등에 대해 역할을 선택할 수 있고, 권한을 설정해서 역할을 만들 수 있습니다. 예를 들어 서비스, EC2의 IAMReadOnlyAccess와 같이 권한을 지정한 'NewRole'을 만들 수 있는 셈이죠.
- Access Provider를 통해 현재 권한 설정과 IAM 관리에 대해 살펴볼 수 있습니다.
#### IAM 접근 보안을 위한 정책 제공
- IAM Password Policy
  - 암호를 어떻게 정하게 할지
  - 90일 이후 변경 정책 등
- MFA, Muti Factor Authentication
  - 패스워드 로그인 외에 제 2의 수단을 가지고 이중 잠금하는 형태
  - MFA 방식을 정하고 장치에 설치
- <span style="background-color:#fff5b1">IAM Credential Report</span>

#### IAM Best Practice
- 루트 계정을 되도록 사용하지 않도록 합니다.
- 같이 작업할 동료가 있는 경우 계정 정보가 아닌 User를 하나 만들어서 접근할 수 있도록 합니다.
- 강력한 비밀번호 정책을 사용합니다.
- [IAM 접근 보안을 위한 정책](# IAM 접근 보안을 위한 정책 제공)을 활용합니다.
- IAM user와 Access Key를 공유하지 않습니다.
### AWS CLI
AWS 로그인 방식에는 password+MFA를 사용하는 방식, CLI, SDK를 이용하는 방식들이 있습니다.

#### AWS CLI
AWS CLI를 이용하는 방식은 자동으로 Access Key를 발급받아 사용합니다. 이 키는 절대 공유되지 않도록 주의합니다. `aws iam list-users`와 같은 방식 사용가능합니다.

#### AWS CloudShell
간편하게 AWS CloudShell을 이용하는 방법도 있습니다. 일부 지역에서 사용할 수 있다는 특징이 있습니다.

### AWS Shared Responsibility Model
책임 모델과 관련해서 AWS는 인프라와 관련된 보안 책임을 지고, 개개인의 사용자는 사용하는 서비스에 대한 보안의 책임을 갖습니다. 예를 들어 키를 관리한다거나 패스워드를 변경하거나 IAM 사용자를 관리하는 등과 같은 것을 의미합니다.

## AWS Budget
Billing and Cost Management 접근 권한이 있는 IAM 유저로 들어가서 보면 비용과 청구 내역에 대해 볼 수 있습니다. Free Tier에서도 현재 사용량과 얼마나 사용할지에 대한 내역을 볼 수 있습니다.
예산을 설정하면 정해놓은 예산에 일정량(85%)에 도달하거나 예상되는 금액이 100% 예산에 충족되는 경우에는 그 알림을 메일로 받아볼 수 있습니다.

## EC2
> EC2는 Elastic Compute Cloud로 인프라적 개념입니다. 머신 자체인 `EC2`를 포함하고, 데이터를 저장하는 `EBS`, 로드밸런서 `ELB`, 자동 스케일링을 도와주는 도구인 `ASG`가 있습니다.

EC2 Instance는 다음과 같은 구성요소를 선택할 수 있는 옵션을 제공합니다.
- OS
- CPU
- RAM(random-access memory)
- EBS&EFS, EC2 Instance Store
- Firewall rules
- Network card
- Bootstrap script
  - 부팅시 할 작업을 작성해 놓을 수 있습니다.
  - <span style="background-color:#fff5b1">EC2 User Data is used to bootstrap your EC2 instances using a bash script.</span>

[EC2 Instance Types](https://aws.amazon.com/ko/ec2/instance-types/?gclid=CjwKCAiAjeW6BhBAEiwAdKltMmF0XWyIU0yTlYy2J4zKGrDdc3mGAOn1oStYkq4FlGb8B5it5_jtIhoCOGkQAvD_BwE&trk=68913a17-4967-41f6-a766-0f2eb338dd04&sc_channel=ps&ef_id=CjwKCAiAjeW6BhBAEiwAdKltMmF0XWyIU0yTlYy2J4zKGrDdc3mGAOn1oStYkq4FlGb8B5it5_jtIhoCOGkQAvD_BwE:G:s&s_kwcid=AL!4422!3!588924203178!p!!g!!aws%20ec2!16390049454!133992835579)과 [EC2 Instance Info](https://instances.vantage.sh/)에서 각 유형에 대한 정보과 비교 자료를 볼 수 있습니다.

### Security Group
보안 그룹은 EC2 Instance와 통신하기 위한 룰을 설정한 방화벽을 의미합니다. 포트, IP range(IPv4, IPv6), 프로토콜(TCP, UDP), Source(0.0.0.0/0)를 지정할 수 있습니다. EC2 Instance 접근을 위한 인바운드와 EC2 Instance에서 다른 인스턴스 접근을 위한 아웃바운드 규칙으로 나뉩니다.

보안그룹에 의해 접근이 불가한 경우는 타임아웃이 발생합니다.
- SSH 접근을 위한 보안그룹 설정을 하는 것이 좋습니다.
- <span style="background-color:#fff5b1">region과 VPC에 영향을 받습니다.</span>

보안그룹에 주로 사용되는 포트의 종류과 그 프로토콜들
- 22 - SSH
- 21 - FTP
- 22 - SFTP
- 80 - HTTP
- 443 - HTTPS
- 3389 - RDP(윈도우 로그인)

### SSH로 접근하기
SSH(Secure Shell)는 네트워크 상의 다른 컴퓨터에 로그인하거나, 원격 시스템에서 명령을 실행하고 파일을 전송할 수 있도록 해주는 통신 프로토콜입니다.
```
ssh -i key.pem ec2-user@3.435.33.356
```
- EC2 Instance 접근시 IAM User 권한을 부여해 필요한 정보만 제공할 수 있도록 합니다.

### Purchasing Options
EC2 Instance에는 다양한 구매옵션이 있습니다.
#### On-Demand
On-Demand로 사용한만큼 청구를 받는 방법이 일반적입니다. 하지만 어느정도 사용할지(<span style="background-color:#fff5b1">1 or 3년</span>)에 대한 계획이 있다면 Reserved 또는 시간 단위 부과가 되는 Saving Plans를 사용해서 지정할 수도 있습니다.
#### Spot Instance
워크로드가 작은 경우에는 Spot Instance로 저렴하게 사용할 수 있습니다. 이 옵션은 경쟁 입찰과 같이 빈 인스턴스를 차지하지만 언제든지 다른 bidder에 의해 사용이 불가능할 수 있다는 단점이 있습니다.
#### Dedicated Hosts
Dedicated Hosts는 전체 물리적 서버를 호스트가 사용하는 형태입니다. 비용은 On-Demand와 동일합니다.
- <span style="background-color:#fff5b1">데이터베이스 기술 배포로 물리적 코어와 네트워크 소켓 가시성이 필요한 경우</span>
  - 컴퓨팅 시스템에서 네트워크 통신을 수행하는 끝점(endpoint)인 소켓에 대한 상호작용을 관찰하고 모니터링하는 능력
  - on-demand에서는 가상화된 환경에서 작용하기 때문에 세부적 통제가 어려울 수 있습니다.
#### Capacity Reservations
EC2 Capacity Reservations은 On-Demand처럼 청구되나 운영여부와 상관없이 비용이 부과되기 때문에 짧은 기간 특정 지역에서 사용할 경우에 적합합니다  Reserved 또는 Saving Plans과 결합해 사용할 수 있습니다.

### IPv4 address에 대한 청구
2024년 2월 변경사항
- 모든 인스턴스는 프리티어 기간 동안 total 750hr/month까지 무료이며 그 이상 사용분에 대해서는 비용이 발생합니다.
- LB에 경우에는 지역당 하나 IPv4 address를 가질 수 있으며, 프리티어를 제공하지 않습니다.
- RDS Database는 하나의 IPv4 address를 가질 수 있으며, 프리티어를 제공하지 않습니다.
#### 추가 참고사항
- 많은 ISP(Internet Service Provider)들은 아직 IPv6를 지원하지 않습니다.
- IPAM으로 Amazon에서 사용되는 IP들를 관리할 수 있습니다.


## EC2 Instance Storage
> EBS, AMI, EFS

#### EBS(Elastic Block Store)
EBS 볼륨은 네트워크 드라이브입니다. 특정 가용영역에 사용되며, 스냅샷으로 볼륨을 이동할 수 있습니다. CCP level에서 한 번에 한 인스턴스에만 마운트될 수 있습니다.
- EC2 종료시 EBS 설정에 따라 사용을 중단할 수 있습니다. - `Delete on Termination`
- Make an Amazon EBS volume available for use on Linux
##### EBS Snapshots
EBS를 스냅샷을 통해 다른 AZ에 복원시켜서 사용할 수 있습니다. 이 때, 스냅샷을 Archive에 관리하게 되면 75% 저렴하다는 이점이 있습니다. 스냅샷을 삭제한 경우에도 Recycle Bin에서 복원이 가능합니다. Fast Snapshot을 이용한 복원도 있는데 이 경우에는 돈이 많이 들지만 큰 스냅샷을 빠르게 복원할 수 있다는 장점이 있습니다.
##### EBS Volume Types
- gp3는 gp2와 달리 볼륨 사이즈와 IOPS(초당 입출력 작업 수)와 별개로 독립적으로 설정될 수 있습니다.
- gp2는 IOPS의 크기가 볼륨 크기에 따라 자연스럽게 증가되는 구조입니다. 즉 직접적으로 연결(link)되어 있다고 표현합니다.
##### EBS Multi-Attach
`io 1`  또는 `io 2` 볼륨에 경우에는 다중 연결로 같은 가용영역 내에서 여러 인스턴스(<span style="background-color:#fff5b1">16개 한도</span>)에 EBS 볼륨을 연결할 수 있습니다.

#### AMI(Amazon Machine Image)
아마존에서 제공하는 Public AMI를 사용할 수도 있고 원하는대로 만들 수도 있습니다. AMI를 생성하는 과정에서 EBS 스냅샷을 만들어 다른 AZ에서 인스턴스를 AMI를 사용해서 만들 수 있습니다.
- 인스턴스 생성 > 이미지 생성(AMI) > 인스턴스 생성에서 `My AMIs`를 사용한 생성

#### EC2 Instance Store
네트워크 드라이버로 제한된 성능을 지니는 EBS의 단점을 해결할 수 있습니다. 고성능에 하드웨어 디스크로 I/O 성능 향상을 이용해서 사용됩니다.

#### EFS(Elastic File System)
이 파일시스템은 여러 인스턴스에 마운트되어 사용될 수 있고, 여러 가용영역에서 작동합니다. 탄력성이 있어 자동적으로 확장되고 축소됩니다. 처리량, 성능, 규모 등을 선택할 수 있습니다.
- Lifecycle  Policy - Tier가 있어 일정 기간이 지나면 Storage Classes에 따라 이동될 수 있도록 설정이 가능합니다.
- 사용할 경우에만 비용이 지불됩니다.
- EBS과 비교
  - EBS `io 1`  또는 `io 2` 볼륨을 제외하고는 EBS와 달리 여러 인스턴스에 연결할 수 있다는 특징이 있습니다.
  - EBS에 비해 더 가격이 높으나 저장소 계층으로 비용 절감이 가능합니다.














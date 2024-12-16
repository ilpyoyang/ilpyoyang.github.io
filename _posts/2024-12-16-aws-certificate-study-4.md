---
title: 4부. 한 번에 알아보는 AWS - S3, CloudFront
author: ilpyo
date: 2024-12-16 08:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## Amazon S3
백업, 저장, 복구용, 아카이브 등으로 사용됩니다. Bucket에 Object를 저장하고 각 Object는 Key 값을 가집니다. 여기서 Key란 Full Path를 의미하는데 S3에 경로를 뜻하고 `prefix + object name`으로 표현됩니다.
- Object는 자격증명이 있는 url로 접근이 가능합니다.
- Bucket 레벨에서 버저닝이 가능합니다. <span style="background-color:#fff5b1">이전의 Object 버전은 `null`입니다.</span>
- 업로드 파일
  - <span style="background-color:#fff5b1">5TB 제한</span>
  - <span style="background-color:#fff5b1">Multi-Part 업로드시에는 100MB 이상</span>
  - 큰 파일은 나눠서 업로드를 병렬처리할 수 있으며, Edge Location을 이용해 더 빠르게 문서를 전달할 수 있습니다.
- Analytics를 통해 `.csv` 파일로 Storage Class의 각 Object에 대한 내용을 확인할 수 있는 기능을 제공합니다.

### S3 Security
S3의 보안을 위해서는 IAM의 특정 사용자만 접근이 가능하게 설정할 수 있습니다. 또는 Bucket 정책, Bucket Access Control List, Object Access Control List를 이용할 수 있습니다.
```
{
  “Version”: “2024–10–16”,
  “Statement”: {
    “Effect”: “Allow”,
    "Principal": "*"
    “Action”: [
      “s3:GetObject”,
    ],
    “Resource”: [
      “arn:aws:s3::accessbucket/*”
    ]
  }
}
```
- [정책 생성기](https://awspolicygen.s3.amazonaws.com/policygen.html)

#### Object Encryption
##### Server-Side Encryption(SSE)
- SSE-KMS
  - KMS Key를 가지고 Object를 암호화처리해서 Bucket에 저장
    - 기본 외에 KMS Key를 만드는 경우에는 비용이 발생합니다. Default KMS Key는 무료로 시용가능합니다.
  - "x-amz-server-side-encryption":"aws:kms"
  - <span style="background-color:#fff5b1">quota를 증가시키고 싶은 경우 Service Quotas Console를 이용해서 증가시킬 수 있습니다.</span>
  - GenerateDataKey KMS API, Decrypt KMS API
- DSSE-KMS
  - KMS로 두 번 암호화 과정을 거쳐서 저장
- SSE-C
  - Client가 제공한 Key를 이용해서 암호화하는 방법
##### Client-Side Encryption(CSE)
암호화된 데이터 자체를 S3에 저장하는 방법을 말합니다.

#### SecureTransport(SSL/TLS)
https로 들어온 요청에 대해서만 데이터를 줄 수 있도록 정책상 설정할 수 있습니다. 이 외에도 정책상 원하는 헤더가 있을 때 Bucket에 저장될 수 있게 하는 방식으로 보안처리를 할 수도 있습니다.
```
{
  “Version”: “2024–10–16”,
  “Statement”: {
    “Effect”: “Allow”,
    "Principal": "*"
    “Action”: [
      “s3:GetObject”,
    ],
    “Resource”: [
      “arn:aws:s3::accessbucket/*”
    ],
    "Condition": {
      "Bool": {
        "aws:SecureTransport": "false"
      }
    }
  }
}
```

#### S3 CORS(Cross-Origin Resource Sharing)
요청이 Origin이 아닌 Cross-Origin과 같은 S3 Bucket에 오는 경우, Origin의 데이터를 접근가능하도록(`Access-Control-Allow-Origin`) 합니다. 
- Bucket CORS 수정에서 `AllowedOrigins` 설정 추가

#### MFA Delete
Object 삭제와 같은 보안이 필요한 부분에 대해서는 MFA를 이용해서 삭제가 가능하게 설정할 수 있습니다.
```
aws s3api put-bucket-versioning --bucket amzn-s3-demo-bucket1 --versioning-configuration Status=Enabled,MFADelete=Enabled --mfa "SERIAL 123456"
```

#### Access Log
S3 Bucket에 일어난 접근에 대한 로그를 확인할 수 있습니다. Logging Bucket은 App Bucket과 분리해서 loop되지 않도록 주의합니다.

#### Pre-Signed URLs
private S3 Bucket에 대해 Pre-Signed URLs을 만들어서 다른 사용자가 일정 시간동안 다운로드를 하거나 사용할 수 있도록 할 수 있습니다.
다른 사용자의 접근을 가능하게 하면서도 Bucket 자체를 공개하지 않아도 된다는 장점이 있습니다.

### S3 Replication
Replication Rule을 설정하므로써 Object 복제를 할 수 있습니다. 복제는 같은 region이 아니더라도 가능합니다. 다른 지역의 복제를 CRR(Cross-Region Replication), 같은 지역의 복제를 SRR(Same-Region Replication)이라고 합니다. 복제는 새로운 Object에 대해서 비동기적으로 발생합니다. 만약 이전 Object 복제를 위해서는 S3 Batch Replication을 사용할 수 있습니다.
- delete하게 되면 복제 Bucket에 delete marker가 표시됩니다.
- 체이닝이 제공되지 않습니다. 1 > 2 > 3, not 1 > 3

### S3 Storage Classes
다양한 액세스 패턴에 대해 가장 저렴한 스토리지를 제공합니다. 모든 클래스에 대해 높은 내구성과 차별화된 가용성을 제공합니다. ([Amazon S3 스토리지 클래스](https://aws.amazon.com/ko/s3/storage-classes/) 종류)
- Amazon S3 Standard
- Amazon S3 Intelligent-Tiering
  - Auto tiering으로 자주 접근하지 않는 Object를 관리
- Amazon S3 Standard-Infrequent Access
  - 비용은 작지만 회수 비용이 듭니다.
- Amazon S3 One Zone-Infrequent Access
- Amazon S3 Glacier
  - Instant Retrieval - 최소 저장기간 90일, 자주는 아니지만 즉각적으로 액세스해야 하는 경우
  - Flexible Retrieval - 최소 저장기간 90일, 연간 1~2회 조회되며 비동기식으로 액세스 되는 경우의 아카이브에 해당
    - <span style="background-color:#fff5b1">Expedited, Standard, Bulk model</span>을 가지고 있습니다.
  - Deep Archive - 최소 저장기간 180일, 거의 액세스되지 않지만 보관을 해야하는 데이터집합을 위한 경우

#### Lifecycle Rules
- Transition, Expiration Action을 설정할 수 있습니다. 
- 삭제된 object를 다시 일정 시점 이후에 복구해야 하는 경우에는 `deleted marker`로 가려두었다가 다시 `Standard IA`로 전환하는 방법을 사용할 수 있습니다.
![lifecycle-transitions-v4](https://github.com/user-attachments/assets/de3e12eb-10b3-464f-8d89-8ad6b8b81924)

### Event Notifications
Object의 변화에 따라 Event Notifications를 발생시킬 수 있습니다. 이 때 다른 리소스에서 Event Notifications을 받을 수 있도록 서비스별(<span style="background-color:#fff5b1">SNS, SQS, Lambda Function</span>) Access Policy를 추가해줍니다. 
또는 Amazon EventBridge를 이용하는 방법도 있습니다.

### S3 Object Lambda
Lambda Function을 이용해서 S3에서 기존 데이터베이스 정보를 추가하거나 일부 데이터를 수정해서 S3 Object Lambda Access Point를 이용해서 전달할 수 있습니다.
수정을 위해 새로운 Bucket을 만들지 않아도 된다는 장점이 있습니다.

---

## CloudFront
CDN이라고 생각하면 됩니다. 요청에서 가까운 지역의 CloudFront를 거쳐 S3 데이터를 가지고 오도록 하며, S3 Cross Region Replication과 달리 Bucket의 복제가 일어나지 않습니다.
그리고 정적 콘텐츠를 전세계 어디서나 요청해서 받아볼 수 있다는 장점이 있습니다.
- CloudFront 생성시 Region을 선택하지 않습니다.
- CloudFront Caching
  - 캐시 리프레시로 전체 또는 일부 무효화를 진행할 수 있습니다.
  - Cache Behaviors: URL 경로에 따라 특정 Origin 어디로 연결할지에 대해 설정이 가능합니다.
- 그냥 EC2를 연결해야 하는 경우에는 EC2가 public 되어 있어야 하지만 ALB로 연결을 거치는 경우에는 ALB에서 private EC2 접근이 가능하기 때문에 private으로 생성이 가능합니다.
- 지역적인 제한이 가능합니다.(geographic restrictions) 
- Signed-URL / Signed-Cookies(여러 파일에 대해 사용가능)
- Key Management
- Price Classes - Regional/Multiple/Edge
- Kinesis Data Stream를 이용한 Real Time Logs 관리가 가능합니다.

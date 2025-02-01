---
title: DVA-C02 대비자료 3 - Security & Logging & Monitoring
author: ilpyo
date: 2025-02-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

### IAM
- IAM에서 유일하게 리소스 기반 정책으로는 Trust Policy가 있음
  - `"Effect": "Allow"`
- Cross-Account Access
  - AWS에서 한 계정의 리소스에 다른 계정의 사용자나 서비스가 액세스할 수 있도록 하는 기능
  - IAM 역할과 리소스 기반 정책은 단일 파티션 내의 계정에 대한 액세스를 위임합니다.
  - 리소스(S3 등)에 접근권한이 있는 역할을 신뢰할 수 있는 엔티티에 한해서 엑세스 위임이 가능하도록 설정하는 것이 바람직
- IAM Access Analyzer
  - 사용되지 않는 액세스에 대한 검사를 간소화하여 최소 권한으로 안내
  - S3 버킷이나 IAM 역할과 같이 외부 엔터티와 공유되는 조직 및 계정의 리소스를 식별하는 데 도움
- IAM 콘솔의 Access Advisor
  - 비 IAM 엔터티에 대한 정보를 제공하지 않으며
  - IAM은 AWS 요청을 하는 데 마지막으로 역할이 사용된 시간을 나타내는 마지막으로 사용된 타임스탬프를 보고
- Billing and Cost Management에 대한 엑세스 설정 가능
- STS(Security Token Service)를 이용한 임시적이고 제한된 권한의 자격 증명을 요청할 수 있는 웹 서비스 지원
- SSL/TLS 인증서 배포
  - IAM은 ACM에서 지원하지 않는 지역에서 HTTPS 연결을 지원해야 하는 경우에만 인증서 관리자로 사용
- IAM Policy Variables 구성으로 어떤 리소스에 어떤 사용자가 사용할 수 있게 할지를 정할 수 있음
  - `${aws:username}`
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],      
      "Resource": ["arn:aws:s3:::amzn-s3-demo-bucket"],
      "Condition": {"StringLike": {"s3:prefix": ["${aws:username}/*"]}}
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],      
      "Resource": ["arn:aws:s3:::amzn-s3-demo-bucket/${aws:username}/*"]
    }
  ]
}
```

### ACM
- SSL/TLS 인증서 배포

### Amazon Inspector
- 개별적인 보안 평가 및 취약점 분석에 중점을 두는 서비스

### AWS Security Hub
- 여러 보안 경고를 통합하여 보안 상태를 한 눈에 모니터링하는 서비스

### AWS Trusted Advisor
- 전체 리소스 최적화와 비용 절감을 위한 가이드를 제공하는 도구로, 리소스가 AWS 베스트 프랙티스에 맞게 구성을 도움

### CloudWatch
- CloudWatch custom metric 설정으로 요청 API call 중 실패량을 파악해서 일정 수준 이상이 되는 경우 SNS 알람 처리
  - High resolution `1sec`
    - 10초마다 EC2 인스턴스의 CPU 사용률을 추적하고자 하는 경우
  - Standard resolution `1min`
  - `1sec`, `5sec`, `10sec`, `30sec`, `60sec` 단위로 검색 가능
- Detailed Monitoring는 일부 리소스와 서비스에 대해 특화된 기능
  - EC2 Detailed Monitoring `1min` 간격으로 제공
  - 외부 결제처리 API 호출 측정불가
- Lambda 트리거를 위해서 CloudWatch event 또는 Cron 표현식 지정
- 매트릭에서 통계를 추출하는 것보다는 통계를 사용자 정의 메트릭으로 푸쉬하는 것으로 선택
  - EC2 RAM 통계를 사용자 정의 메트릭으로 CloudWatch에 푸시하는 인스턴스에서 Cron 작업
- CloudWatch에 대한 권한이 있는 IAM 사용자 자격 증명을 사용해서 <mark style="background: #FFF3A3A6;">CloudWatch 에이전트</mark>를 온프레미스 서버로 다운로드
  - 온프레미스 서버에 AWS SDK를 설치하는 방식은 수동 구성이 필요하고 부적합

### AWS Glue
고객이 분석을 위해 데이터를 준비하고 로드하기 쉽게 해주는 완전 관리형 추출, 변환 및 로드(ETL) 서비스

### SSE(Server-Side Encryption)
- 서버 측 암호화는 객체 메타데이터가 아닌 객체 데이터만 암호화
- SSE-C
  - S3는 SSE-C를 사용할 때 HTTP를 통해 이루어진 모든 요청을 거부
  - 보안을 위해 AWS는 HTTP를 사용하여 잘못 보낸 모든 키가 손상된 것으로 간주할 것을 권장
- SSE-KMS
  - buildspec.yml > configure
  - CMK를 저장하고 클라이언트로부터 데이터를 수신하여 암호화하고 다시 전송
  - `'x-amz-server-side-encryption': 'aws:kms'`
  - Envelope Encryption을 사용해서 큰 크기의 데이터를 Lambda에 전달
    - Lambda API로는 4KB 페이로드 상한을 가짐
    - 그 이상되는 것을 전달하기 위한 방식
  - IAM 사용자의 정책을 수정하여`kms:GenerateDataKey`작업을허용해야 함
    - 객체 암호화를 위해 일반 텍스트 키와 데이터 키의 암호화된 사본을 반환하는 API 호출
    - 일반 텍스트 키를 사용해서 데이터를 암호화
  - full control to create, rotate and remove the encryption keys
  - CloudWatch Logs는 암호화된 데이터가 요청될 때마다 CMK에 대한 권한이 있어야 함
    - AWS CLI`associate-kms-key`명령을 사용하고 KMS 키 ARN을 지정
    - `aws logs associate-kms-key --log-group-name my-log-group --kms-key-id "key-arn"`
- SSE-S3
  - 마스터키 로테이션 가능
  - Amazon S3 서버 측 암호화는 사용 가능한 가장 강력한 블록 암호 중 하나인 256비트 고급 암호화 표준(AES-256)을 사용하여 데이터를 암호화
  - `"s3:x-amz-server-side-encryption": "AES256"`

```yml
env: 
	variables: 
		S3_BUCKET_NAME: "your-bucket-name" 
		KMS_KEY_ID: "arn:aws:kms:region:account-id:key/key-id" 
```

```
{
  "Version": "2012-10-17",
  "Id": "PutObjectPolicy",
  "Statement": [
    {
      "Sid": "DenyIncorrectEncryptionHeader",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "DenyUnencryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*",
      "Condition": {
        "Null": {
          "s3:x-amz-server-side-encryption": "true"
        }
      }
    }
  ]
}
```

- `StringNotEquals`를 사용하면 `s3:x-amz-server-side-encryption` 값이 `aws:kms`가 아닌 경우 요청을 거부합니다.
```
{
   "Version":"2012-10-17",
   "Id":"PutObjectPolicy",
   "Statement":[{
         "Sid":"DenyUnEncryptedObjectUploads",
         "Effect":"Deny",
         "Principal":"*",
         "Action":"s3:PutObject",
         "Resource":"arn:aws:s3:::examplebucket/*",
         "Condition":{
            "StringNotEquals":{
               "s3:x-amz-server-side-encryption":"aws:kms"
            }
         }
      }
   ]
}
```

### Cognito
- 제3자 인증 제공자를 연동하려면 OIDC나 SAML 설정이 필요하며, 이로 인해 추가적인 복잡성이 발생
- [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- User pool
  - OpenID Connect(OIDC) 개방형 표준에서 정의한 대로 ID, 액세스 및 새로 고침 토큰을 구현
  - JWT 반환 인증 매커니즘
  - 웹 또는 앱 로그인
- Identity pool
  - 사용자에게 다른 AWS 서비스에 대한 액세스 임시 자격 증명을 부여
  - ID 풀을 사용하여 사용자를 관리하거나 IAM 사용자를 만들 수 없음
  - S3나 DynamoDB와 같은 서비스에 접근하기 위한 액세스 임시 자격을 제공
- Sync 기능으로 자체 백엔드가 필요 없이 모바일 기기와 웹에서 사용자 프로필 데이터를 동기화

### Step Function
- 각 단계의 상태를 추적하기 때문에 회사가 원하는 모든 과정의 추적이 가능
- long-running, durable, and auditable workflows
- human approval steps
- 데이터 흐름의 오케스트레이션을 관리하고 자동화
- 시각화 자료 제공
- 이벤트 비율이 높고 기간이 짧은 워크로드에는 Express Workflows를 사용
  - 초당 100,000개 이상의 이벤트 비율을 지원
- Statemachine의 단일 작업단위 - `Task`

```
"HelloWorld": {
  "Type": "Task",
  "Resource": "arn:aws:lambda:us-east-1:123456789012:function:HelloFunction",
  "Next": "AfterHelloWorldState",
  "Comment": "Run the HelloWorld Lambda function"
}
```

### AWS Secrets Manager
- 데이터베이스 자격증명 자동으로 주기적 갱신하도록 할 수 있음 (Auto Rotation)
- Secrets Manager가 Lambda 함수를 통해 처리하므로 수동 개입이 필요 없음
- SDK로 런타임에 API 자격증명을 가져와서 사용
- 최소한의 관리 오버헤드로 자격 증명을 저장하고 검색하기 위해 어떤 솔루션

### AWS Systems Manager
- 인프라에 대한 가시성과 제어를 제공
- SSM Parameter Store
  - CloudTail과 사용해서 애플리케이션에서 사용되는 모든 비밀 문자열을 암호화하여 값을 일반 텍스트로 노출하는 것을 방지하고 복호화 이벤트를 감사
  - 일반 텍스트 매개변수 이름과 암호화된 매개변수 값을 갖는 매개변수인 <mark style="background: #FFF3A3A6;">SecureString</mark> 매개변수를 생성 가능
  - 액세스 토큰을 암호화된 형태로 저장하고 다른 AWS 계정에서 접근할 수 있도록 할 수 있음
  - <mark style="background: #FFF3A3A6;">AWS Secrets Manager보다 비용효율적임</mark>

### CloudTail & X-ray
- CloudTrail은 AWS 계정 활동의 이벤트 기록을 제공
  - 누가 이 리소스를 수정하기 위해 API 호출을 했는가?
- 계정 전반의 데이터를 디버깅하고 추적하기 위해서는 X-ray를 사용
  - 엔드 투 엔드 트랜잭션 추적
  - 시각화 자료 제공
  - IAM 읽기 권한 필요
- X-ray 샘플링을 활성화해서 매초 첫 번째 요청을 기록
- 온프레미스 서버에 X-Ray 데몬을 설치하고 실행하여 데이터를 캡처하고 X-Ray 서비스로 전달
- <mark style="background: #FFF3A3A6;">애플리케이션 코드에 X-Ray SDK를 수동으로 계측</mark>
  - EC2 인스턴스에서 PII를 안전하게 처리하고 X-Ray 추적 메시지에 PII가 포함되지 않도록 하는 방법

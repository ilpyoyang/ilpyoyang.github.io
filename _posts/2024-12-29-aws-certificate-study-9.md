---
title: 9부. 한 번에 알아보는 AWS - Lambda
author: ilpyo
date: 2024-12-29 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

Serverless에 대한 관심도 높아지고 있는 추세이고 직접 관리할 필요가 없기 때문에 코드 자체에 좀 더 중점을 둔 애플리케이션 개발이 가능합니다.

## AWS Lambda
자동으로 스케일링되며, 실행될 때만 청구가 되는 주문형 방식입니다. 대부분의 언어를 제공하며, Rust, Golang과 같은 언어도 커뮤니티 support가 됩니다. (주로 Node.js, Python) 다른 AWS 서비스들과 통합기능을 제공합니다.

예를 들어, 정적 콘텐츠를 S3, CloudFront에서 얻고 Cognito에 로그인하고 API는 API Gateway를 거쳐 Lambda 함수를 호출하는 식으로 Serverless 운영이 가능합니다.
- 처음 1,000,000 요청은 무료지만, 이후 요청당 0.0000002 달러 비용이 발생합니다.
- 매달 첫 400,000기가바이트의 compute time 시간을 무료로 얻을 수 있고 RAM 크키에 따라 당연히 소비량은 차이가 발생합니다. 이후에는 600,000GB당 1달러 비용이 발생합니다.
- Lambda Function의 Configuration 설정에서 메모리는 1기가에서 28기가 사이로 변경할 수 있습니다. 메모리가 더 많을수록 더 CPU를 사용할 수 있습니다. <span style="background-color:#fff5b1">CPU를 따로 설정할 수는 없습니다.</span>

### Synchronous Invocations
동기호출에서는 응답을 기다리고 에러에 대해 클라이언트가 해결책을 찾아야 합니다.   
동기 테스트는 CLI나 SDK로 테스트할 수 있지만 ALB를 이용해서 HTTP, HTTPS endpoint를 적용할 수 있습니다. 이 때 Lambda는 Target group으로 설정이 필요합니다.
- Multi-Header values를 가지는 경우 json 쿼리 파라미터로 변환되어 람다에 전달됩니다.
  - `"queryStringParameters": {"name":["alb", "lambda"]}`

### Asynchronous Invocations
비동기호출의 예로는 S3 Bucket에 새로운 파일이 들어왔을 때 SQS 이벤트가 발생해서 Lambda 서비스가 작동하는 경우를 의미합니다.
- 비동기 서비스를 제공하는 서비스
  - S3, SNS, CloudWatch Events / EventBridge, CodeCommit, CodeCommit, IoT 등
- SQS DLQ(Dead Letter Queue)를 이용한 에러 핸들링이 가능합니다.

### Event Source Mapping
[Event Source Mapping](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/invocation-eventsourcemapping.html)은 스트림 또는 큐 기반 서비스에서 레코드 배치로 함수를 간접 호출하기 위한 Lambda 리소스입니다.
- 사용하지 않은 Trigger는 삭제해서 polling 비용을 방지해야 합니다.

#### Trigger와의 차이점
Trigger는 개별 이벤트와 실시간 처리해야할 사항들에 대해 Lambda 이벤트를 호출하는데 적합합니다. Trigger는 실제로 Lambda가 아니라 이벤트를 생성하는 서비스에 의해 저장되고 관리됩니다.  
반면, Event Source Mapping은 Lambda 서비스 내에서 생성되고 관리되는 Lambda 리소스입니다. 스트리밍 데이터 또는 메시지를 일괄처리할 수 있도록 합니다.

#### Streams (Kinesis, DynamoDB)
Kinesis와 DynamoDB에서 샤드 레벨 순서대로 아이템을 처리합니다. 실행된 아이템들은 스트림에서 삭제되지 않고 다른 Consumer도 읽을 수 있도록 합니다.
- 샤드 당 최대 10개 배치 프로세서가 가능하고 샤드 내 키 순서대로 읽습니다.
- 오류는 성공시까지 재시도되는데 불필요한 재시도를 막기 위해 오래된 이벤트를 삭제하거나 (Destination 이동) 재시도 횟수를 제한하는 등의 처리를 할 수 있습니다.

#### Queue (SQS, SQS FIFO)
동일하게 Event Source Mapping를 이용한 레코드 처리를 위해서 큐에 배치 사이즈를 지정하고 DLQ도 설정할 수 있습니다. 이 때, DLQ는 람다가 아니라 동기적 처리를 위해 SQS 생성에서 적용합니다. (람다 설정에서는 비동기 처리를 위한 DLQ 설정)
- SQS에서는 기본적으로 분당 60개 인스턴스를 추가하고 초당 최대 1,000 메시지를 동시에 처리합니다.
- SQS FIFO에서는 큐 처리를 위한 Lambda 함수 수는 활성 메시지 그룹 개수와 동일합니다.

### Context Objects
Lambda가 이벤트에 대한 내용을 받을 때는 Event Object와 Context Object를 받게 됩니다. `def def lambda_handler(event, context)`처럼 함수를 작성하는 것에서 알 수 있습니다. 여기서 Event Object는 다른 리소스의 데이터라고 할 수 있고, Context Object는 Lambda의 메타데이터를 가지고 있습니다. 두 객체는 상호보완적이며 json 형태로 표현합니다.

아래 예시 코드처럼 context 내 정보를 확인할 수 있습니다. 호출 데이터와 런타임 환경에 대한 메서드를 제공하며 AWS 요청 ID와 함수 이름 메가바이트의 메모리 한도 등에 대한 정보를 얻을 수 있습니다.
```
import time

def lambda_handler(event, context):   
    print("Lambda function ARN:", context.invoked_function_arn)
    print("CloudWatch log stream name:", context.log_stream_name)
    print("CloudWatch log group name:",  context.log_group_name)
    print("Lambda Request ID:", context.aws_request_id)
```

### Lambda Configurations

#### Destinations
DLQ 사용보다는 Destinations 사용이 권장됩니다. SNS, SQS 뿐만 아니라 Event Bridge로도 성공, 실패에 대한 데이터를 보낼 수 있기 때문입니다.  
Event Source Mapping는 이벤트 배치가 있지만 처리할 수 없어서 폐기될 때만 사용됩니다.
(이런 말이 있어서 찾아봤는데 정확하게 이해된 부분은 아닙니다. 실제 Event Source Mapping가 이벤트 배치 폐기가 주기능이라고는 볼 수 없을 것 같습니다.)

![](https://d2908q01vomqb2.cloudfront.net/1b6453892473a467d07372d45eb05abc2031647a/2019/11/25/lambda-destinations1.png)

#### Permissions
실행권한에 대한 부여로 다른 리소스로부터의 접근, 리소스로의 접근을 허용할 수 있습니다. 예를 들어 함수가 DynamoDB에 액세스해야 하는 경우`AWSLambdaDynamoDBExecutionRole`관리형 정책이 필요합니다. Lambda에서 SQS를 호출하기 때문에 Lambda에 SQS에 대한 실행권한이 적용해야 합니다.  
IAM Access Analyzer를 이용해 필요한 권한만 부여하는 최소 권한 정책을 적용할 필요가 있습니다. 하나의 함수당 하나의 실행권한을 부여하는 것이 Best Practice입니다.

#### Environment Variables
환경변수를 Configuration에서 작성해서 보안키나 Lambda 함수에 필요한 변수들을 적용할 수 있습니다.

### Logging & Monitoring
Lambda는 CloudWatch 로그와 통합되어 자동적으로 저장됩니다. Configure에서 모니터링 툴 추가하는 부분에서 X-Ray를 trace 활성화해서 사용이 가능합니다. `AWS_XRAY_DAEMON_ADDRESS`를 사용해서 X-Ray daemon과 소통할 수 있습니다.

### Lambda Storage

#### `/tmp`
VPC에서 Lambda를 실행중이라면 EFS 접근이 가능하고 이를 로컬 디렉토리로 마운트가 가능합니다. 임시적으로 `/tmp` 스토리지를 사용할 수 있는데 이 경우 동적으로 컨텐츠 적용이 가능하며 Lambda 비용으로 책정됩니다.

#### Lambda Layer
Lambda Layer를 사용해서 외부 종속성에 필요한 라이브러리를 레이어에 두고 다른 패키지에서도 동일하게 사용할 수 있도록 할 수 있습니다. 즉, 라이브러리를 매번 같이 배포할 필요가 없어 효율적입니다. 함수당 5개 Layer를 제공하며 250MB 최대 한도를 갖습니다. 영구적이나 정적 컨텐츠만을 저장할 수 있습니다. 이것도 당연히 Lambda 비용으로 청구됩니다. 
- <span style="background-color:#fff5b1">종속성으로 인한 컴파일 소요 시간을 줄이는데 효과적인 방식입니다.</span>

#### S3
크기는 제한이 없으며, 데이터는 영구적으로 보관되고 동적 컨텐츠 보관이 가능합니다. Object 형태로 저장됩니다.

#### EFS
크기는 제한이 없으며, 데이터는 영구적으로 보관되고 동적 컨텐츠 보관이 가능합니다. FS 형태로 저장됩니다. IAM과 NFS 권한 적용이 필요합니다.

### Lambda and Concurrency
최대 1,000개 함수가 동시 실행될 수 있습니다. 동시성 한계 지점의 호출은 Throttle을 발생시킵니다. 동기적 호출인 경우에는 ThrottleException이 발생하고 비동기 호출에서는 재시도하거나 DLQ로 갑니다. 여기서 limit의 주의할 점은 계정의 모든 함수가 동시성 한계가 적용된다는 점입니다.

#### Provisioned Concurrency
새로운 인스턴스가 실행될 때에는 init이 새로 많이 발생하게 되고 이 프로세스는 시간이 걸릴 수 있습니다.(Cold Starts) 따라서 초기 요청은 지연이 더 발생할 수 있습니다. 이 때 Provisioned Concurrency를 이용해서 함수 호출 전에 동시성을 할당하므로써 Cold Starts에 의한 지연을 방지할 수 있습니다. 

### Container Image
Lambda는 컨테이너 이미지를 사용할 수 있도록 지원합니다. Lambda Runtime API를 사용해서 ECR을 통해서 Lambda로 배포가 가능합니다. Best Practice로 AWS에서 제공하는 기본 이미지를 사용하고 Multi-Stage 빌드를 사용하고 하나의 Repository를 이용해서 여러 Layer를 가지는 함수를 사용하는 것이 권장됩니다.

### ETC

#### Lambda@Edge
CloudFront 기능으로 좀 더 사용자와 가까운 곳에서 함수를 실행할 수 있게 합니다. 트리거로 CloudFront 요청을 변경하고 Viewer Request와 Origin Request를 응답하는데 사용합니다. CloudFront 함수와 달리 Node.js, Python 런타임을 지원하고 속도는 다소 느리지만 네트워크 접근과 Request Body 접근도 가능합니다. 프리티어를 제공하지 않습니다.

#### Lambda & VPC
Lambda는 기본적으로 AWS가 소유하는 VPC 안에 있습니다. Private Subnet에 접근하기 위해 Lambda는 <span style="background-color:#fff5b1">ENI(Elastic Network Interface)</span>를 거칩니다. 또는 VPC Endpoint를 이용할 수 있습니다. 인터넷 엑세스를 위해서는 <span style="background-color:#fff5b1">NAT 게이트웨이 혹은 NAT 인스턴스</span>가 필요하고 이는 외부 API에 대한 액세스를 제공합니다.

#### External Dependencies
외부 종속성이 필요한 경우 코드와 함께 압축해서 50MB보다 작은 경우에는 Lambda로, 그 이상인 경우는 S3에 업로드합니다.

#### Version & Alias
Lambda 함수를 이용해서 여러 버전들을 만들 수 있고 가장 최신 버전을 `$LATEST`로 적용할 수 있습니다. Alias를 사용하면 각 함수에 대해서 prod, dev 환경을 구분해서 사용할 수 있으며 각 Alias 내에서 버전 비율을 변경해서 적용할 수 있다는 장점이 있습니다. 즉 배포 전 일부 트래픽을 최신 버전으로 이동하게 함으로써 배포시 점차 반영이 가능하도록 반영할 수 있습니다. (+ CodeDeploy)

#### with CloudFormation
CloudFormation 템플릿을 이용해서 Lambda 함수 생성이 가능합니다. 코드를 zip 압축하여 S3 버킷에 업로드하고 그 객체를 `AWS::Lambda::Function`에 기록합니다.
- `lambda/function.zip`

#### with CodeGuru
Lambda 런타임 성능에 대한 정보를 얻기 위해서 CodeGuru를 사용합니다. CodeGuru를 사용하기 위해서 `AmazonCodeGuruProfilerAgentAccess`를 사용합니다. 

#### Function URL
앞서 URL 접근으로 Lambda함수를 실행하기 위해서 ALB, API Gateway와 같은 별도 설정 없이도 URL 엔드포인트를 생성해주는 기능입니다. IPv4, IPv6 모두 지원하고 Public Internet만을 이용한 접근이 가능합니다.

#### AWS account 실행권한 추가
다른 계정도 Lambda 함수 실행권한을 부여하기 위해서 `Lambda Resource-based Policy`와 `Cross-account IAM Role` 적용이 필요합니다.

---

## AWS Lambda Best Practice
- 큰 역할이 필요한 작업과 DB 연결과 같은 작업들은 Lambda function handler 밖에서 실행하는 것이 좋습니다.
- 환경변수를 이용해서 DB 연결에 필요한 변수들을 지정하는 것이 좋습니다.
- 비밀번호와 같은 민감한 정보는 KMS를 이용해서 암호화합니다.
- 배포 패키지를 줄이고 다른 패키지에서도 사용되는 종속성은 Layer를 사용합니다.
- span style="background-color:#fff5b1">AWS Lambda limits을 알아둡니다.</span>
  - 실행 기준
    - 메모리할당량: 128MB – 10GB (1MB increments)
    - 최대 실행시간: 900seconds (15minutes)
    - 환경변수 크기: 4KB
      - 초과하는 환경변수가 필요한 경우에는 `.zip` 파일로 적용
    - 함수 컨테이너의 `/tmp` 디스크 용량: 512 MB to 10GB(10,240MB)
    - 동시 실행 개수: 1,000개
  - 배포 기준
    - Lambda 함수 배포 사이즈: 50MB
    - 압축 해제시 사이즈: 250MB
- 반복되는 코드 사용을 피하고 Lambda 함수가 다시 자신을 호출하지 않도록 주의합니다.

### 참고자료
- [일정에 따라 Lambda 함수 간접 호출](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents.html)
- [실전에서 AWS Lambda 적극 활용해본 이야기](https://blog-tech.tadatada.com/2022-09-02-use-lambda-well)

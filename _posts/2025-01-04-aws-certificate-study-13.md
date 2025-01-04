---
title: 13부. 한 번에 알아보는 AWS - Security, ETC
author: ilpyo
date: 2025-01-04 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## AWS Managed Microsoft Active Director (AD)
AWS Managed Microsoft AD는 AWS에서 제공하는 완전 관리형 Microsoft Active Directory 서비스입니다. 쉽게 말해, Microsoft Active Directory(AD)를 AWS 클라우드에서 관리하지 않고 사용할 수 있게 해주는 서비스입니다. 이를 통해 온프레미스(자체 데이터센터에 있는) Active Directory와 클라우드 상의 Active Directory를 연동하고, 관리하는 일이 쉬워집니다.

---

## Encryption
HTTPS 통신에서 TLS를 이용해서 암호화와 해독으로 보안을 유지합니다. TLS를 이용하면 MITM(man in the middle attack) 문제를 방지할 수 있습니다. 

### Key Management Service, KMS
암호화를 위한 키를 관리하는 AWS KMS를 이용합니다. SDK, CLI를 이용한 API 호출로 KMS 키로 문서를 암호화할 수 있습니다. KMS Key에서는 Symmetric(AES-256 keys), Asymmetric(RSA & ECC key pairs) 타입이 있습니다. 자동으로 Key rotation 기능을 제공(90~2560일)합니다. AWS에서 관리하는 Key는 매년 rotation되고, Import 키는 수동으로 rotation 처리를 해주어야 합니다. 키로 암호화된 EBS를 snapshot으로 다른 region에 옮겨서 EBS 볼륨을 만들 수 있습니다. 
- 기본적으로 KMS 정책은 모든 AWS 계정에서 접근가능합니다. 

```
aws kms encrypt \
    --key-id 1234abcd-12ab-34cd-56ef-1234567890ab \
    --plaintext fileb://ExamplePlaintextFile \
    --output text \
    --query CiphertextBlob | base64 \
    --decode > ExampleEncryptedFile
    
aws kms decrypt \
    --ciphertext-blob fileb://ExampleEncryptedFile \
    --output text \
    --query Plaintext | base64 --decode > ExampleDecryptedFile
```

#### Envelope Encryption
KMS Encrypt API 호출은 4KB 제한이 있는데, 그보다 큰 크기의 암호화를 필요로 하는 경우에는 Envelope Encryption를 사용합니다. Envelope Encryption에서는 두 가지 키를 사용하는데 DEK, KEK를 이용합니다. 이 DEK 자체를 저장하는 것이 아니라 암호화한 KEK를 이용해서 저장합니다. `GenerateDataKey` API를 사용해서 DEK를 생성합니다.

#### Lambda를 이용한 암/복호화
람다 함수 코드 내에 scret을 넣어두는 것은 좋지 않으므로 os 환경변수로 넣어두고 이를 KMS를 이용해서 암/복호화 처리할 수 있습니다.
```python
ENCRYPTED = os.environ['DB_PASSWORD']
DECRYPTED = boto3.client('kms').decrypt(
  CipertextBlob=b62decode(ENCRYPTED),
  EncryptionContext={'LambdaFunctionName':os.environ['AWS_LAMBDA_FUNCTION_NAME']}
)['Plaintext'].decode('utf-8')
```

### S3 Bucket Key
S3 Bucket Key는 KMS를 이용해서 만들고 사용되는데 이 S3 Bucket Key를 이용하면 데이터 암호화를 위한 KMS API를 매번 호출할 필요가 없습니다. 즉, S3 Bucket Key를 이용하면 KMS 관련 CloudTrail 이벤트를 줄일 수 있습니다.

### CloudHSM
하드웨어 보안 모듈(Hardware Security Module, HSM) 서비스입니다. 이는 고유한 물리적 장치에서 암호화 작업을 처리하고, 높은 보안성을 제공하는 관리형 서비스입니다. KMS와의 차이점은 고객이 직접 CloudHSM를 관리하고 더 높은 보안성과 유연성을 제공합니다. 하지만 상대적으로 비용이 더 높을 수 있습니다. AWS KMS는 CloudHSM에 저장된 키를 사용하여 암호화 및 복호화 작업을 수행합니다.

### SSM Parameter Store
AWS Systems Manager에서 애플리케이션과 인프라에서 중요한 설정 값을 안전하게 저장하고 관리하는 서비스입니다. `SecureString`으로 저장된 파라미터는 KMS 키로 암호화됩니다. AWS Secrets Manager는 자동으로 암호화되고 비밀번호와 같은 민감한 정보들을 관리할 수 있고 SSM Parameter Store에 의해 상대적으로 비쌉니다. 비밀 관리와 회전이 필요한 경우에는 AWS Secrets Manager가 적합하고, 일반적인 구성 값이나 비보안 정보는 SSM Parameter Store를 사용하는 것이 좋습니다.
- `boto3`를 사용하면 Python 코드에서 AWS 리소스를 쉽게 관리하고 작업할 수 있습니다.

```
aws ssm get-parameters --names "/my/app/password" --with-decryption --region us-west-2
```

### Secrets Manager
Secrets Manager를 이용해서 다른 지역에 secret을 복사할 수 있습니다. 
- 예를 들어, Secrets Manager는 데이터베이스 자격 증명과 같은 비밀을 관리하고, 이 정보를 저장할 때 KMS(mandatory)를 사용하여 암호화합니다.
- SSM Parameter Store는 rotation을 제공하지 않고 EventBridge를 이용한 rotation이 가능합니다. KMS 적용이 optional이고 Secrets Manager에 비해 저렴합니다. 

### 다른 서비스와의 암호화
- Secrets Manager과 SSM Parameter Store 데이터를 가지고 template으로 CloudFormation을 만들 때 적용할 수 있습니다.
- CloudWatch Log에서는 로그 그룹에 KMS key ID를 설정하므로써 로그 그룹에 해당하는 로그들에 대한 암호화가 가능합니다.
- CodeBuild에서 환경변수를 그냥 작성하는 것이 아니라 AWS Systems Manager 또는 Secrets Manager으로 적용할 수 있습니다. (`Plaintext` 사용시 유출 가능성 방지)
- Nitro Enclaves를 이용해서 아주 민감한 데이터를 관리할 수 있습니다. 고립된 가상머신으로 데이터 프로세싱을 위해 사용됩니다. 

---

## AWS 보안 서비스 비교

| 서비스                     | 설명                                                            | 주요 사용 사례                                                                                       | 주요 특징                                         |
|----------------------------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------|
| **AWS KMS (Key Management Service)** | 암호화 키를 생성, 관리하고 데이터를 암호화 및 복호화하는 서비스           | - 데이터 암호화 및 복호화<br>- 다른 AWS 서비스와 통합하여 보안 관리<br>- 키 회전 관리                  | - **대칭 키** (AES-256)와 **비대칭 키** (RSA, ECC)를 지원<br>- 키 회전 (자동/수동)<br>- CloudTrail 통합 |
| **AWS Secrets Manager**     | 비밀 정보(비밀번호, API 키 등)를 안전하게 저장, 관리하고 자동 회전 지원     | - 데이터베이스 자격 증명<br>- API 키<br>- 비밀번호 등 민감한 정보 저장 및 관리<br>- 자동 회전 필요시 | - KMS로 암호화<br>- 자동 비밀 회전 지원<br>- 여러 리전 간 비밀 복사<br>- 높은 비용                    |
| **SSM Parameter Store**     | 애플리케이션 설정 값, 인프라 구성 정보를 저장하고 관리하는 서비스            | - 환경 변수, 애플리케이션 설정 값 저장<br>- 민감하지 않은 정보 관리<br>- 자동화된 인프라 관리          | - KMS로 암호화된 `SecureString` 지원<br>- 비밀번호 회전은 직접 관리<br>- **비용이 저렴**                 |
| **CloudHSM**                | 하드웨어 보안 모듈(HSM)을 사용하여 암호화 키를 관리하고 높은 보안 제공          | - 고보안 암호화 키 관리<br>- 높은 보안 요구 사항을 가진 기업 환경                                   | - 물리적 장치에서 키 관리<br>- KMS와 통합하여 암호화 및 복호화 수행<br>- 비용이 상대적으로 높음        |

---

## Other AWS Services

### Simple Email Service, SES
이메일 전송을 위한 서비스로 S3, SNS, Lambda와 함께 사용될 수 있습니다. 

### OpenSearch Service
OpenSearch는 Elastic Search의 후속 서비스로 Elastic N.V이 라이선스를 변경한 이후 Elastic Search를 fork하여 OpenSearch 서비스를 제공하고 있습니다. 부분 매치 기능을 제공하며 분석적 쿼리도 가능합니다.

![](https://d2908q01vomqb2.cloudfront.net/b3f0c7f6bb763af1be91d9e74eabfeb199dc1f1f/2021/10/18/VMware-Cloud-AWS-OpenSearch-1.png)

### Athena
서버리스 서비스로 S3의 데이터 분석을 도와줍니다. S3 데이터를 쿼리하고 분석하는데 사용되고 고정 금액으로 $5.00/TB로 저렴합니다. 주로 QuickSights 서비스에 연결되어 사용됩니다.
- `s3://athena-examples/flight/parquet/year=2025/month=1/day=4`
- [점점 커지는 RDB Table, S3로 귀양 보내고 Athena로 불러오기 - feat. Optimization with Spark Bucketing](https://blog.banksalad.com/tech/data-optimization-with-bucketing/)
- [Amazon S3 서버 액세스 로그를 사용하여 요청 식별](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/using-s3-access-logs-to-identify-requests.html)

#### Federated Query
Lambda에서 Federated Query를 이용해서 S3 데이터를 접근할 수 있습니다. 

```python
import boto3
import time

athena_client = boto3.client('athena')
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    database = 'database_name'
    query = '''
        SELECT * FROM "table_name" LIMIT 10;
    '''

    query_execution_context = {
        'Database': database
    }
    
    response = athena_client.start_query_execution(
        QueryString=query,
        QueryExecutionContext=query_execution_context,
        ResultConfiguration={
            'OutputLocation': 's3://results-bucket/',
        }
    )
    
    query_execution_id = response['QueryExecutionId']

    status = 'RUNNING'
    while status in ['RUNNING', 'QUEUED']:
        result = athena_client.get_query_execution(QueryExecutionId=query_execution_id)
        status = result['QueryExecution']['Status']['State']
        print(f"Query status: {status}")
        time.sleep(2)

    if status == 'SUCCEEDED':
        result = athena_client.get_query_results(QueryExecutionId=query_execution_id)
        print("Query Results:")
        for row in result['ResultSet']['Rows']:
            print(row)
    else:
        print(f"Query failed with status: {status}")
```

### Managed Streaming for Apache Kafka, MKS
Apache Kafka는 AWS Kinesis의 대안으로 사용되며 MSK를 이용해서 관리할 수 있씁니다. Producer로 보낸 topic을 MSK Cluster의 여러 Broker로 복제되고 Broker는 이를 Consumer에 전달해서 AWS 서비스들(EMR, S3 등)에서 이용할 수 있게 합니다.
- Kinesis Data Stream은 1MB 사이즈를 제한하고 있고, 샤드를 가지는 데이터 스트림입니다. 작은 규모의 실시간 분석에 적합합니다.
- 반면, MSK는 분산 스트리밍 플랫폼으로 1MB 보다 더 큰 사이즈를 가질 수 있으며, Kafka Topic과 파티션으로 구성됩니다.

### Certificate

#### AWS Certificate Manager, ACM
SSL/TLS 인증서를 관리하는데 사용합니다. 사용자가 HTTPS로 ALB에 요청할 때 필요한 인증서 ACM에서 관리하고 필요한 AWS 리소스를 사용할 수 있도록 해줍니다. ACM 제공 공개 인증서는 무료입니다.

#### Private CA
AWS에서 제공하는 관리형 사설 인증서 기관입니다. 이 서비스는 내부 네트워크, 애플리케이션, 또는 클라우드 환경 내에서의 보안 연결을 위한 사설 SSL/TLS 인증서를 발급하고 관리하는 데 사용됩니다. 

### Macie
S3 버킷에 저장된 데이터를 스캔하여 민감한 정보(예: 이름, 주소, 이메일, 신용카드 번호 등)를 자동으로 식별합니다. 특히 PII(Personally Identifiable Information)와 같은 중요한 데이터를 모니터링하고 이를 보호하는 데 중요한 역할을 합니다. 

### AppConfig
AWS Systems Manager의 기능 중 하나로 앱에 동적으로 Configuration 구성을 정하고 실시간으로 업데이트하는데 사용합니다. 


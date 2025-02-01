---
title: DVA-C02 대비자료 2 - Storage
author: ilpyo
date: 2025-02-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

### S3
- S3 Transfer Acceleration + Multipart Upload
  - 빠르게 압축 파일을 S3에 업로드하는 방식
  - S3 Transfer Acceleration은 Amazon CloudFront의 전 세계적으로 분산된 엣지 로케이션을 활용
  - Multipart Upload 사용은 대용량 파일 업로드와 병렬처리에 장점
- CloudWatch와 사용해 로그 저장
- 소스 버킷과 대상 버킷이 동일한 경우 버킷에 기록된 로그에 대한 추가 로그 생성
- IAM 역할과 리소스 기반 정책은 단일 파티션 내의 계정에 대한 액세스를 위임
- S3 객체 소유권을 사용하여 기본 버킷 소유자를 버킷의 모든 객체 소유자로 지정
  - Amazon Cognito ID 접두사 내에서 IAM 정책을 사용하여 사용자가 Amazon S3에서 자신의 폴더를 사용하도록 제한
- 데이터 엑세스 제어
  - 쿼리 문자열 인증, 엑세스 제어 목록(ACL), 버킷 정책, ID 및 엑세스 관리 정책(IAM)
  - IAM 데이터베이스 인증은 MySQL 및 PostgreSQL에서만 작동
- 복제
  - S3 라이프사이클 작업은 S3 복제로 복제되지 않음
  - 동일 지역 복제(SRR) 및 교차 지역 복제(CRR)는 S3 버킷 수준, 공유 접두사 수준 또는 S3 개체 태그를 사용하는 개체 수준에서 구성
- <mark style="background: #FFF3A3A6;">S3 이벤트 알람 > Lambda 트리거 > DynamoDB 레코드 삽입</mark>
- S3 Object Lambda는 객체를 요청할 때마다 데이터를 변환하거나 처리
  - 예를 들어, 고객의 개인 정보가 포함된 데이터에서 PII를 제거
- 중앙 집중식 구성 저장소에 고가용성을 제공하는 가장 비용 효율적인 솔루션
  - <mark style="background: #FFF3A3A6;">기존 .xml 파일을 S3 버킷으로 마이그레이션하고, AWS SDK를 사용하여 Amazon S3에서 구성 파일을 읽고 쓰도록 애플리케이션 코드를 업데이트</mark>
- 모든 데이터 검색 요청이 전송 중 암호화를 제공하도록 강제
  - 요청이 `"aws:SecureTransport": "false"` 조건을 충족할 때 액세스를 거부하도록 S3 버킷에서 리소스 기반 정책을 정의
- <mark style="background: #FFF3A3A6;">1MB 이상 크기를 갖는 보고서를 저장하고 만료 날짜가 포함된 사전 서명된 URL을 생성하고, S3 Lifecycle 구성 규칙을 추가하여 오래된 보고서를 삭제하는데 적합</mark>
  - RDS는 비용이 많이 부과
  - DynamoDB는 용량 큰 보고서를 저장할 수 없음
- <mark style="background: #FFF3A3A6;">Macie는 S3 버킷 내에서 PII를 자동으로 감지하고, 이를 보호하거나 숨길 수 있음</mark>

### RDS
- RDS storage auto-scaling
  - 자동으로 storage scale을 조정하는데에는 도움
- IAM 데이터베이스 인증을 사용 - MySQL, PostgreSQL
- 읽기용 복제본 생성으로 SQL 쿼리 최적화 읽기 가능
- IOPS(Input/Output Operation Per Second), 스토리지 성능지표
  - EBS, RDS, EFS 리소스에서 적용
- 대기 모드에서 유지 관리를 수행한 다음 대기 모드를 기본 모드로 승격하고 마지막으로 새 대기 모드가 되는 이전 기본 모드에서 유지 관리를 수행하여 OS 업데이트를 적용
- 자동 백업시 I/O 작업이 중단되지 않음
- Multi-AZ 스탠바이는 읽기 요청을 처리할 수 없음
- 가용성 영역에서 대기 인스턴스로 동기적으로 복제됨
- 재해 복구를 위한 방안
  - Cross-Region Read Replicas
  - Multi-AZ deployment that creates backups in a single AWS Region
- <mark style="background: #FFF3A3A6;">프록시를 사용하면 매번 연결을 열 필요 없이 프록시를 통해 연결되므로 재사용이 가능</mark>

#### Aurora
- 같은 VPC 내에서 Lambda 함수가 Amazon Aurora 데이터베이스에서 데이터를 안전하게 검색하는 방법
  - Lambda 함수와 Aurora 데이터베이스에 서로 다른 보안 그룹(SG1, SG2)을 할당
  - SG1에 포트 3306에 대해 TCP 트래픽을 허용하는 인바운드 규칙을 추가
    - 답이 갈리는데 여기서 SG2의 아웃바운드 설정이 없다는 문제를 제기하는 견해도 있었음

### DynamoDB
- 완전 관리형, 서버리스, 키-값 NoSQL 데이터베이스
- 효율적인 쿼리를 위해 파티션 키, 정렬 키를 기본 키로 테이블을 만들고, 글로벌 보조 인덱스(GSI)로 파티션 키, 정렬 키를 설정
  - LSI는 이미 존재하는 테이블에서 생성할 수 없음
- 중복 처리 요청을 피하기 위해 미리 Lambda 체크
- 접근을 위해 `AmazonDynamoDBReadOnlyAccess` 정책 IAM 역할 생성해서 EC2 프로필에 적용 필요
- Unit 계산하기
  - WCU는 최대 1KB 아이템에 초당 1개의 유닛을 사용
  - Eventually Consistent Read에서 RCU는 최대 4KB 아이템에초당 2개의 유닛을 사용
    - 6KB 크기의 초당 10개의 강력하게 일관된 읽기의 처리량 > 10개 유닛 필요
  - Strongly Consistent Read에서 RCU는 최대 4KB 아이템에초당 1개의 유닛을 사용
  - Transaction의 경우 기존 유닛 계산시 CU보다 2배가 필요
- VPC Endpoint를 이용해서 내부 VPC에서 연결, without Internet Gateway
- on-demand 방식과 point-in-time recovery 방식으로 S3 백업을 만들 수 있지만 S3에 접근할 수는 없음
  - AWS는 다른 리소스(Data Pipeline, EMR, Glue)에 백업하는 방식을 제안
- 최대 항목 크기는 400KB
  - 이미지 저장을 위해서는 S3를 사용하는게 바람직함
  - 사원들 사진은 S3에 넣고 메타데이터 정보는 DynamoDB 활용
- 조건부 쓰기 `PutItem`, `UpdateItem`, `DeleteItem`
- 트랜잭션 읽기 및 쓰기 API 테이블 항목에 단일 작업으로 사용
  - `TransactWriteItems` - 단일 작업 또는 전부 아니면 전무, 멱등적 작업
  - `GetItem`, `UpdateItem`
- `ConsistentRead`를 `true`로 설정하면 DynamoDB는 강력한 일관성(strong consistency)을 사용하여 데이터를 읽습니다.
  - 데이터는 최신이지만 부하 증가
  - `GetItem`, `Query`, `Scan`을 사용하는 경우에 해당
- `BatchGetItem`
  - 저수준 API에서 직접 일괄 요청을 하는 경우에 UnprocessedKeys 포함된 경우 해결방안
  - 백오프, 프로비저닝 읽기 용량 증가
  - <mark style="background: #FFF3A3A6;">특정 항목을 가져오기 위해 좋은 수단</mark>
- DynamoDB Streams를 활성화로 변경사항을 파악
- 데이터 흐름 문제 제한을 막기 위해 SQS를 사용해서 대기열 메시지를 Lambda로 보내는 방법이 존재

### ElastiCache
- 영구적 데이터 저장할 수 없음, 데이터 손실 가능성
- 컴퓨팅 집약적 성능을 개선
- 읽기 작업이 많은 애플리케이션 작업 부하에 대한 대기 시간과 처리량을 개선
- `.ebextensions/`
- Redis는 스냅샷 기능, 복제를 제공하며 Memcached에서는 할 수 없는 트랜잭션을 지원
  - <mark style="background: #FFF3A3A6;">Memcached를 사용하여 세션 데이터를 저장하고 관리</mark>
  - RDS for MySQL DB 인스턴스를 사용하여 애플리케이션 데이터를 저장
- 클러스트 모드 ElastiCache Redis
  - RDS를 위한 안정적인 완전 관리형 캐싱 계층
  - 수평적 확장 가능

### EBS
- 서버리스 환경에서 부적합
- EBS 볼륨의 stage 보안처리 > KMS, in-flight 암호화(TLS, IPsec, SSH, VPN) 지원
  - 암호화되는 데이터는 볼륨 내의 데이터, 볼륨의 스냅샷, 그 스냅샷으로 만든 데이터, 다른 인스턴스로 이동된 데이터가 있다.
- CLI로 인스턴스가 실행중일 때, `DeleteOnTermination` 속성 변경 가능
- EBS 볼륨은 수백 개의 EC2 인스턴스에서 동시에 액세스할 수 없습니다.
- 범용 SSD(gp2) 볼륨은 최소 100 IOPS(33.33GiB 이하)에서 최대 16,000 IOPS(5,334GiB 이상) 사이에서 기준 성능은 볼륨 크기 1GiB당 3 IOPS로 선형적으로 확장
  - 즉, 5.3TiB에서 최대 IOPS에 도달
- S3보다 훨씬 비쌈

### EFS
- Amazon EFS는 Amazon 컴퓨팅(EC2, 컨테이너, 서버리스) 및 온프레미스 서버에서 사용할 수 있는 파일 스토리지 서비스
  - Fargate 또는 Amazon EC2 인스턴스에서 호스팅되는 작업에 지원
  - <mark style="background: #FFF3A3A6;">다른 리소스에서 접근할 수 있도록 설계</mark>
- EFS Standard–IA(Infrequent Access) 스토리지 클래스
- EFS Standard 스토리지 클래스는 자주 접근하는 경우에 사용하는 FS
- 윈도우 작동 하지 않음

### Serverless Application Repository
- 서버리스 아키텍처를 쉽게 조립하고 배포

### CloudFront
- 정적 콘텐츠 로딩 시간 단축
- Client - CloudFront 간 통신, CloudFront - Backend 간 통신 모두에 HTTPS 설정
- AWS 루트 사용자만 CloudFront 키 페어를 만들 수 있음, 최대 2개
- Signed URL
  - 파일이나 비디오를 스트리밍할 때 특정 조건에서만 유효하도록 하는 것
  - signer는 서명자로 공개/개인 키 쌍을 관리하는 주체입니다.
    - CloudFront API로 관리 가능
    - signer를 생성할 때, 공개 키는 CloudFront에 저장되고 개인 키는 URL의 일부를 서명하는데 사용된다.
    - 서명자는 개인 키를 사용하여 URL이나 쿠키를 서명하고, CloudFront는 공개 키를 사용하여 서명을 검증
    - 루트 사용자는 키 페어를 생성한 뒤, 개인 키를 서명용으로 필요한 주체(Signer)에게 전달 가능
  - Signed URL은 Signed Cookie보다 우선
- Signed Cookie는 복수의 리소스 제한 설정에 사용
- AWS WAF는 CloudFront로 전달되는 HTTP 및 HTTPS 요청을 모니터링하고 콘텐츠에 대한 액세스를 제어할 수 있는 웹 애플리케이션 방화벽
  - CloudFront에서 ACM 인증서를 사용하려면 <mark style="background: #FFF3A3A6;">미국 동부(버지니아 북부) 리전(us-east-1)</mark> 인증서 필요

### CORS
- cross-origin access 가능하게 하는 법
  - `<CORSConfiguration>` `<CORSRule>`
- 비인가 도메인 접근 제한
- 다른 무단 도메인이 귀하의 API에 액세스하는 것을 방지하기 위해서는 CORS 비활성화

---
title: DVA-C02 대비자료 5 - Event Handling & Data Streaming
author: ilpyo
date: 2025-02-01 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

### EventBridge
- 메인 계정의 권한을 설정해 모든 계정이 메인 계정의 EventBridge로 이벤트를 보내게 할 수 있음
  - 각 계정에서 직접 전달 X

### SQS
- 최대 메시지 크기 256KB
  - SQS Extended Client를 사용해서 최대 2GB 메시지를 저장하고 사용하는데 유용
  - 큐에 데이터를 저장하는 경우가 아니라면 S3 고려
- 대기열의 가시성 시간 초과 값은 초 단위이며 기본값은 30초 (0~43,200(12시간)의 정수)
- 최대 저장 메시지 제한은 없음
  - 인플라이트 메시지(소비자가 큐에서 수신했지만 큐에서 삭제되지 않은 메시지)의 제한은 최대 약 120,000개로 규정
- 생성 후 큐 유형 변경불가
- 대기열 태그는 대소문자를 구분
- FIFO 큐의 데드 레터 큐도 FIFO 큐여야 합니다. 마찬가지로, 표준 큐의 Dead-Letter Queue도 표준 큐여야 합니다.
  - 처리되지 않은 오류 처리를 위한 메시지 격리
  - 비동기 호출과 모든 재시도에 실패한 Lambda의 처리
- `DeleteQueue` - SQS 테스트 후 대기열과 모든 내용을 삭제
- `PurgeQueue` - 지정된 큐의 메시지를 삭제하고 큐는 그대로 유지
- `DelaySeconds` - 대기열에 있는 모든 메시지의 전달이 지연되는 시간(초)
  - Delay Queue 생성됨
- `MessageRetentionPeriod` -  Amazon SQS가 메시지를 보관하는 시간(초)을 제어
- SQS KMS 활성화
  - AWS Key Management Service(KMS)에서 제공하는 암호화 키를 사용하여 표준 및 FIFO 대기열에 저장된 메시지를 SQS에서 암호화하도록 선택 가능
- `ApproximateNumberOfMessagesVisible`
  - [Amazon SQS 기반 확장 정책](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html)
  - SQS 큐에 처리되지 않고 대기 중인 메시지 수
  - 인스턴스당  백로그와 인스턴스당 허용 가능한 백로그 비교
    - 인스턴스당  백로그
      - `ApproximateNumberOfMessagesVisible` / 인스턴스 수
    - 인스턴스당 허용 가능한 백로그
      - 메시지 수와 처리 시간과 허용 가능한 지연 시간 모두 고려할 필요가 있음
      - 허용 가능한 지연 시간 / 메시지 처리 시간
    - 인스턴스당 백로그 > 허용 백로그
      - 인스턴스를 추가해 메시지 처리 속도를 높입니다.
    - 인스턴스당 백로그 < 허용 백로그
      - 인스턴스를 줄여 과도한 리소스를 방지합니다.
  - Target Tracking Scaling Policy
    - Target Value에 도달하면 ASG 처리
- Polling
  - 기본값은 짧은 폴링을 갖음
  - 폴링으로 새로운 메시지가 메시지 큐에 왔는지 주기적으로 확인하는 프로세스를 의미
  - 롱 폴링을 이용해서 SQS 사용 비용을 최소화할 수 있음
- 확장성이 뛰어나 많은 양의 작업을 처리하기 위한 어떠한 조치도 필요 없음
- 롤링 평균 구하기
  - <mark style="background: #FFF3A3A6;">Lambda의 예약된 동시성을 1로 설정(인스턴스 1개 동작)</mark>
  - Lambda에서 롤링 평균을 계산
  - 계산된 롤링 평균을 Amazon ElastiCache에 저장

### SNS
- SNS 알림 후 실패처리를 SQS로 처리가능
- SNS 주문 생성 알림을 수신해서 SQS 대기열에서
- SNS 토픽 필터로 필요한 구독자에게 알림이 가게 할 수 있음
- SNS + Lambda
  - 이 경우 Lambda가 EC2 인스턴스 주문 이행 처리를 하도록 할 수 없음 >> 서버리스 한계

### SES
- `Throttling – Maximum sending rate exceeded` 에러 해결방안을 위해 Exponential Backoff 사용
  - 즉시 공격적으로 재시도하는 대신, 클라이언트는 시도 사이에 일정 시간 동안 기다림
  - `Throttling` 오류로 거부된 요청은 나중에 재시도할 수 있으며 성공할 가능성이 높다.

### Kinesis

#### Kinesis Data Stream
- Kinesis Data Firehose보다 다운스트림 애플리케이션을 통합하는 데 더 큰 유연성을 제공하고, 상대적으로 저렴
- Kinesis Data Stream은 수집과 저장에 더 중점을 두고 있으며, Kinesis Data Firehose는 처리 및 전송에 중점을 두고 있음
- PutRecords API
  - 단일 호출에서 여러 레코드 작성
  - 최대 500개
- `ProvisionedThroughputExceededException`
  - 스트림에 대한 요청 속도가 너무 높거나 요청된 데이터가 사용 가능한 처리량에 비해 너무 크다는 것
  - "Hot" partition
  - 요청 빈도나 크기를 줄이기
  - 오류 재시도 및 지수 백오프 메커니즘 사용
  - 데이터 스트림 내의 샤드 수를 증가시켜 충분한 용량 제공

#### Kinesis Data Firehorse
- S3, Elasticsearch Service, Redshift, Splunk와 같은 목적지에 실시간 데이터 스트리밍 데이터 전송을 위한 서비스
  - ElastiCache는 지원 대상이 아님
- Kinesis Data Firehose는 데이터를 대상에 전달하기 전에 데이터 변환을 위해 AWS <mark style="background: #FFF3A3A6;">Lambda 함수를 사용</mark>할 수 있도록 지원

#### Kinesis Data Analytics
- SQL 쿼리와 정교한 Java 애플리케이션을 빌드하는 데 사용

| **Kinesis 서비스**            | **설명**                                               | **주요 특징**                                                                    | **용도**                                            |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| **Kinesis Data Streams**   | 실시간 스트리밍 데이터를 캡처하고 처리하는 서비스                          | - 데이터를 스트림으로 캡처하여 여러 소비자가 처리<br> - 자동 확장 가능<br> - 지속적인 데이터 처리                | - 실시간 분석<br> - 로그 데이터 스트리밍 처리<br> - 이벤트 기반 애플리케이션 |
| **Kinesis Data Firehose**  | 실시간으로 데이터를 스트리밍하여 S3, Redshift, Elasticsearch 등으로 전송 | - 자동으로 데이터 전송 및 적재<br> - 데이터 변환 기능 제공<br> - 데이터를 여러 타겟으로 전송                  | - 실시간 데이터 적재 및 분석<br> - 로깅 및 모니터링 데이터 전송          |
| **Kinesis Data Analytics** | Kinesis 스트림 및 Firehose 데이터를 실시간으로 분석하는 서비스           | - SQL 쿼리로 실시간 데이터 처리<br> - 스트림 데이터에 대한 실시간 분석 및 처리<br> - Lambda와 연동 가능       | - 실시간 데이터 스트리밍 분석<br> - 대시보드 업데이트 및 알림 시스템 구축     |
| **Kinesis Video Streams**  | 비디오 스트리밍 데이터를 캡처, 저장 및 처리하는 서비스                      | - 실시간 비디오 스트리밍 및 데이터 캡처<br> - Amazon Rekognition과 연동 가능<br> - 안전한 비디오 데이터 저장 | - 비디오 분석 및 모니터링<br> - IoT 카메라에서 데이터 수집            |

---

### ETC
- AWS Marketplace에서 Amazon Machine Images(AMI)를 사용하여 Amazon EC2에 확장 가능한 Oracle Real Application Clusters(RAC)를 배포
- 비용 예산 알림은 예측을 위한 5주간 사용 데이터가 필요
- CMS(Content Management System) 애플리케이션은 디지털 콘텐츠를 생성, 관리, 편집, 저장하는 소프트웨어 애플리케이션
  - WordPress, Wix. 등
- AWS CLI `--dry-run` 옵션 사용
  - `--dry-run` 옵션은 실제로 요청을 하지 않고도 작업에 필요한 권한이 있는지 확인하고 오류 응답을 제공
  - 필요한 권한이 있으면 오류 응답은 DryRunOperation
  - 그렇지 않으면 UnauthorizedOperation
- 개인 SSH키에서 공개 SSH키를 생성한 다음, 새로운 지역에서 사용가능

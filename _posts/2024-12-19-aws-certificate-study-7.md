---
title: 7부. 한 번에 알아보는 AWS - SQS, SNS, Kinesis
author: ilpyo
date: 2024-12-19 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

비동기로 전달하는 것이 동기적 소통에서 오는 트래픽 이슈를 방지하는데 도움이 될 수 있습니다. 그래서 AWS에서는 메시징 방식으로 SQS, SNS, Kinesis를 이용해서 비동기적 그리고 이벤트 발생에 따라 메시지를 전달하는 방식을 취할 수 있습니다.

## SQS (Simple Queue Service)
### Standard Queue
Producer가 queue 방식으로 메시지를 전달하면(send) Consumer에 메시지를 받는(poll) 방식입니다. 기본적으로 4일의 보존 기간을 갖으며 최대 14일까지 보관이 가능합니다. 중복된 메시지가 가끔 발생할 수도 있으며 메시지는 순서를 보장하지는 않습니다. 
- 메세지당 최대 256KB 크기 제한을 두고 있습니다.
  - 제한된 양보다 더 큰 메시지를 보내고 싶은 경우에는 SQS Extended Client를 이용해서 전송합니다.
- queue의 메시지 많은지 CloudWatch로 확인하고 ASG로 EC2 인스턴스 개수를 조절할 수도 있습니다.
- frontend, backend 사이에 SQS를 두어 애플리케이션을 분리할 수도 있습니다.
- 암호화를 진행하거나 IAM, SQS 접근 권한 조정으로 보안처리합니다.
- API
  - `CreateQueue`, `PurgeQueue`, `SendMessage`, `ReceiveMessage`, `DeleteMessage`, `MaxNumberOfMessage`(max 10), `ReceiveMessageWaitTimeSeconds`, `ChangeMessageVisibility`

#### message visibility timeout
message visibility timeout은 기본적으로 30min이며 이 때 이 메시지는 다른 Consumer에게 보이지 않습니다. 30min이 지나면 메시지를 볼 수 있습니다. Consumer는 ChangeMessageVisibility API를 호출하여 추가 시간을 받을 수 있습니다.
- 가시성 타임아웃이 너무 길면, 재처리가 지연될 수 있습니다.
- 가시성 타임아웃이 너무 짧으면, 중복된 메시지를 받을 수 있습니다.

#### Dead Letter Queue (DLQ)
message visibility timeout 되어 poll에 실패하는 경우에는 몇 번의 재시도를 하게 됩니다. 그리고 일정 재시도 수를 제한할 수 있습니다. DLQ의 보존 기간은 14일로 설정하는 것이 좋습니다.
- 코드 수정 후 DLQ의 작업을 SQS로 다시 redrive할 수 있습니다.

#### Delay Queue
메시지를 바로 poll 받는게 아니라 지연시킬 수 있는데 15min까지 가능합니다. 기본값은 바로 poll될 수 있도록 0sec로 지정되어 있습니다.

#### Long Polling
Consumer 입장에서 메시지가 오지 않으면 기다릴 수 있는데 이 때 이 대기시간은 20초(1~20초)로 권장됩니다. `ReceiveMessageWaitTimeSeconds`로 활성화할 수 있습니다.

### FIFO Queue
처음 들어온 메시지가 가장 먼저 poll되는 방식의 queue입니다. Standard queue와 다르게 처리량 제한이 있고 순서가 있습니다.

#### Deduplication
중복 제거가 가능한데 간격은 5분입니다. 제거방식은 콘텐츠를 기반으로 SHA-256 해시를 이용하는 방법과 명시적으로 메시지 중복 제거 ID 제공해서 제거하는 방법이 있습니다.

#### Message Grouping
같은 `MessageGroupID`를 가지고 있는 경우 FIFO Queue에서는 그 그룹에 대한 Consumer를 하나만 가지며, 각기 다른 Consumer를 갖습니다. 

---

## SNS (Simple Notification Service)
SNS는 Pub/Sub 방식으로 메시지를 발행하고, 이를 여러 구독자들에게 전달하는 서비스입니다. 즉 메시지가 하나이고 여러 receiver를 가지는 형태입니다. 
- 한 topic에 최대 12,500,000개의 구독을 할 수 있습니다.
- topic은 100,000개를 제한으로 합니다.
- 한 번에 보내는 메시지 크기는 최대 256KB입니다.
- 발행자는 다양한 AWS가 해당할 수 있으며, CloudWatch, AWS Budget, Lambds, S3, ASG, DynamoDB 등이 될 수 있습니다.
- 구독자는 SQS, Lambda, Kinesis, HTTP endpoint, SMS, Email 등이 될 수 있습니다.
- 보안방식은 SQS와 동일한 방식들을 제동합니다.
- SQS와 함께 사용이 가능합니다. 이벤트 발생을 SQS가 받으면 메시지를 각 queue에서 여러 서비스로 전달하는 방식입니다.

#### FIFO Topic
여기서도 선입선출 방식으로 메시지를 전달할 수 있는 FIFO Topic 방식이 있습니다. 순서대로 메시지를 전송하고 SQS와 동일하게 처리량 제한이 됩니다.

#### Filtering Policy
SNS Topic의 구독자들이게 메시지가 보내질 때 필터링을 거칠 수 있습니다. 필터가 없다면 구독자는 모든 메시지를 받게 됩니다.

---

## Kinesis
Kinesis는 대규모 실시간 데이터 스트리밍 플랫폼으로, 데이터를 실시간으로 수집하고 처리하는 데 사용됩니다. 데이터를 모으고, 처리하거나 실시간으로 분석하는데 유용합니다.
- Kinesis Data Streams
- Kinesis Data Firehose
- Kinesis Data Analytics
- Amazon Kinesis Video Streams

### Kinesis Data Streams
Kinesis Data Streams는 실시간 데이터 스트리밍을 위해 설계된 서비스로, 데이터를 스트림으로 수집하고 이를 여러 소비자가 동시에 처리할 수 있습니다. 주로 로그 데이터나 실시간 분석, 모니터링에 사용됩니다.
- retention은 1~365일 사이에 설정이 가능합니다.
- 데이터가 Kinesis에 들어가면 영구적이며, 삭제가 불가능합니다.

#### Capacity Modes
- Provisioned mode
  - 샤드 수를 선택하고 스케일을 조정할 수 있습니다.
  - 프로비저닝된 샤드 수에 대해 시간당 비용을 지불합니다.
  - 샤드는 초당 1MB의 입력 또는 초당 1000개의 레코드를 처리합니다.
- On-demand mode
  - provision을 필요로 하지 않으며 기본 capacity를 가지므로 별도 관리가 필요 없습니다.
  - 최근 30일 동안의 관찰된 처리량 피크에 따라 자동으로 스케일링됩니다.
  - 스트림에 대해 시간당 요금 및 데이터 입출력에 대해 GB당 요금을 지불합니다.

#### ProvisionedThroughputExceeded
사용자가 설정한 프로비저닝된 처리량(Provisioned Throughput)을 초과해서 발생하는 문제입니다.
해결법으로는 샤드 수를 증가시키거나 파티션 키를 고르게 분배할 필요가 있습니다. 지속적으로 재시도 텀을 늘려가는 backoff를 수행하는 방법도 있습니다.

#### Consumer Type
##### Shared (Classic) Fan-out Consumer (Pull 방식)
소비자 수가 작은 방식에서 주로 사용되며, 여러 소비자가 동일한 스트림에서 데이터를 가져올 때, 각 소비자는 단일 샤드에서 제공되는 데이터의 속도에 제한을 받습니다. 
따라서 성능이 일정한 한계가 있을 수 있지만 상대적으로 저렴합니다.
##### Enhanced Fan-out Consumer (Push 방식)
Kinesis가 데이터를 실시간으로 전송하기에 비용이 많이 발생합니다. 데이터는 HTTP/2로 push합니다.

#### Kinesis Client Library (KCL)
여러 애플리케이션 인스턴스가 Kinesis 스트림의 데이터를 병렬로 읽을 수 있도록 돕는 라이브러리입니다. 각 샤드는 하나의 KCL 인스턴스에서만 읽을 수 있으며, 이를 통해 중복 읽기를 방지하고 효율적으로 작업을 분배합니다.
레코드의 진행 상태는 DynamoDB에 체크포인트로 저장되고, KCL은 여러 환경(EC2, Elastic Beanstalk, 온프레미스)에서 실행할 수 있습니다.
`KCL 1.x`는 shared consumer만 지원하며, `KCL 2.x`는 enhanced fan-out을 지원하여 성능을 더욱 향상시킬 수 있습니다.

#### Operation
##### Shard Splitting
샤드를 나눠서 스트림 capacity를 증가시키고 싶을 때 사용합니다. "hot shard"라고 불리는 쓰임이 많은 샤드를 나누는데 2개 이상으로 분리는 불가능합니다.
##### Merging Shards
위와 반대로 샤드를 합치는 것인데 트래픽이 낮은 "cold shard"를 합쳐줍니다. 2개 이상의 샤드를 하나로 합칠 수는 없습니다.

### Kinesis Data Firehose
Kinesis Data Firehose는 데이터를 실시간에 가깝게 수집하고 AWS 서비스(예: S3, Redshift, Elasticsearch 등)에 직접 전달하는 서비스입니다. 스트림의 데이터를 자동으로 적재하고 처리할 수 있어, 데이터를 저장하고 분석하는 데 유용합니다.
Kinesis Data Streams와 달리 Firehose는 스트림 데이터를 AWS 서비스에 직접 전달하고, 완전 관리형이며, 스케일링도 자동 제공합니다. 바로 목적지까지 이동하기 때문에 별도 재시도 기능을 제공하지 않습니다. 
- Kinesis Data Analytics for Apache Flink를 이용한 실시간 분석이 가능합니다.
- Kinesis에 데이터를 보낼 때, 파티션 키를 이용해서 보내면 항상 같은 키는 같은 샤드로 들어갑니다.
- SQS FIFO와 비교한다면, Kinesis로는 샤드 수 만큼의 Consumer를 병렬로 갖을 수 있고, SQS FIFO는 그룹 ID 수만큼의 Consumer를 갖을 수 있습니다.

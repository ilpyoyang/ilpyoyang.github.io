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
Producer가 queue 방식으로 메시지를 전달하면(send) Consumer에 메시지를 받는(poll) 방식입니다. 기본적으로 4일의 보존 기간을 갖으며 최대 14일까지 보관이 가능합니다. 중복된 메시지가 가끔 발생할 수도 있으며 메시지는 순서를 보장하지는 않습니다. 메세지당 최대 256KB 크기 제한을 두고 있습니다.
- queue의 메시지 많은지 CloudWatch로 확인하고 ASG로 EC2 인스턴스 개수를 조절할 수도 있습니다.
- frontend, backend 사이에 SQS를 두어 애플리케이션을 분리할 수도 있습니다.
- 암호화를 진행하거나 IAM, SQS 접근 권한 조정으로 보안처리합니다.

### message visibility timeout
message visibility timeout은 기본적으로 30min이며 이 때 이 메시지는 다른 Consumer에게 보이지 않습니다. 30min이 지나면 메시지를 볼 수 있습니다. Consumer는 ChangeMessageVisibility API를 호출하여 추가 시간을 받을 수 있습니다.
- 가시성 타임아웃이 너무 길면, 재처리가 지연될 수 있습니다.
- 가시성 타임아웃이 너무 짧으면, 중복된 메시지를 받을 수 있습니다.

### Dead Letter Queue (DLQ)
message visibility timeout 되어 poll에 실패하는 경우에는 몇 번의 재시도를 하게 됩니다. 그리고 일정 재시도 수를 제한할 수 있습니다. DLQ의 보존 기간은 14일로 설정하는 것이 좋습니다.
- 코드 수정 후 DLQ의 작업을 SQS로 다시 redrive할 수 있습니다.

### Delay Queue
메시지를 바로 poll 받는게 아니라 지연시킬 수 있는데 15min까지 가능합니다. 기본값은 바로 poll될 수 있도록 0sec로 지정되어 있습니다.


## SNS (Simple Notification Service)
SNS는 Pub/Sub 방식으로 메시지를 발행하고, 이를 여러 구독자들에게 전달하는 서비스입니다. SNS는 다양한 프로토콜을 통해 메시지를 전달할 수 있어 분산 시스템에서 알림 및 이벤트를 처리하는 데 유용합니다. 메시지 전송을 트리거하는 Producer와 메시지를 받는 Consumer가 서로 독립적으로 동작할 수 있도록 도와줍니다.
- 메시지 전송 방식: Publish-Subscribe (Pub/Sub) 모델을 사용하여, 하나의 메시지가 여러 구독자에게 전달됩니다.
- 프로토콜 지원: HTTP, HTTPS, Email, SMS, Lambda, SQS 등 다양한 프로토콜을 통해 메시지를 전달할 수 있습니다.
- 메시지 크기: 한 번에 보내는 메시지 크기는 최대 256KB입니다.
- 지속성: SNS는 기본적으로 메시지를 디스크에 저장하지 않고, 수신자에게 메시지를 실시간으로 전달하는 서비스입니다. 메시지의 처리 실패 시 다른 시스템에 의해 재처리될 수 있습니다.

## Kinesis
Kinesis는 대규모 실시간 데이터 스트리밍 플랫폼으로, 데이터를 실시간으로 수집하고 처리하는 데 사용됩니다. Kinesis는 Kinesis Data Streams, Kinesis Data Firehose, Kinesis Data Analytics와 같은 서비스를 통해 다양한 방식으로 데이터를 처리할 수 있습니다.

### Kinesis Data Streams
Kinesis Data Streams는 실시간 데이터 스트리밍을 위해 설계된 서비스로, 데이터를 스트림으로 수집하고 이를 여러 소비자가 동시에 처리할 수 있습니다. 주로 로그 데이터나 실시간 분석, 모니터링에 사용됩니다.
- 메시지 처리: 데이터를 일정 크기의 레코드로 스트리밍하여 처리합니다. 레코드는 최대 1MB 크기입니다.
- 파티션 키: Kinesis 스트림은 데이터를 파티션 단위로 나누어 처리합니다. 파티션 키를 사용하여 레코드를 특정 파티션으로 라우팅할 수 있습니다.
- 가시성: Kinesis는 스트리밍 데이터가 일정 시간 동안 저장되어 여러 소비자들이 이 데이터를 처리할 수 있게 해줍니다. 기본 보존 기간은 24시간이며, 최대 7일까지 연장할 수 있습니다.
- 데이터 처리: Kinesis 스트림에 저장된 데이터를 소비자가 병렬로 처리할 수 있어 실시간 분석 및 데이터 파이프라인에 적합합니다.

### Kinesis Data Firehose
Kinesis Data Firehose는 데이터를 실시간으로 수집하고 AWS 서비스(예: S3, Redshift, Elasticsearch 등)에 직접 전달하는 서비스입니다. 스트림의 데이터를 자동으로 적재하고 처리할 수 있어, 데이터를 저장하고 분석하는 데 유용합니다.
- 자동 데이터 전송: 데이터를 수집한 후 지정된 대상에 자동으로 전달할 수 있습니다.
- 변환 및 배치 처리: Firehose는 데이터를 배치 단위로 처리하며, 데이터를 S3 버킷에 저장하거나, Redshift나 Elasticsearch로 전송할 수 있습니다.

### Kinesis Data Analytics
Kinesis Data Analytics는 Kinesis 스트림에서 수집된 실시간 데이터를 SQL 쿼리로 분석하고 처리할 수 있는 서비스입니다.
- SQL 쿼리 지원: SQL 쿼리를 사용하여 스트리밍 데이터를 실시간으로 분석하고 집계할 수 있습니다.
- 결과 스트리밍: 처리된 결과를 다른 Kinesis 서비스나 AWS의 다른 서비스로 실시간으로 전달할 수 있습니다.

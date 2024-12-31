---
title: 10부. 한 번에 알아보는 AWS - DynamoDB
author: ilpyo
date: 2024-12-31 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## DynamoDB
DynamoDB는 NoSQL 데이터베이스로 여러 AZ를 지원하고 AWS에서 완전 관리됩니다. 데이터 모델링을 어떻게 하고 응용 프로그램의 형태에 따라 어떤 방식의 데이터베이스를 선택할지 고려해야 합니다.
- 기본키 전략은 파티션 키(HASH)를 사용하는 방법과 파티션 키(HASH)와 정렬 키를 같이 사용하는 방법이 있습니다.
- DynamoDB는 [PartiQL](https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/ql-functions.html)을 쿼리 언어로 사용합니다.
- TTL은 WCU를 소모하지 않습니다. (추가 비용이 발생하는 부분이 아님) - [epoch Converter](https://www.epochconverter.com/)
- `--projection-expression`를 CLI에서 사용해서 일부 속성을 가지고 올 수 있습니다.
- S3에 큰 데이터를 담고 그 메타데이터를 DynamoDB에 저장하는 방식을 이용할 수 있습니다.
- IAM에 의해 완전히 제어가 가능합니다.

### Capacity with RCU & WCU
Provisioned는 기본값으로 free tier를 제공합니다. 미리 계획한 프로비저닝 용량에 대한 비용을 지불해야 합니다. On-Demand 모드는 사용자의 작업에 따라 자동으로 스케일 업/다운이 발생하기 때문에 프로비저닝이 별도 필요하지 않지만 비용이 훨씬 더 비쌉니다. 예측 불가능한 경우에 사용할 것을 권장합니다. 24시간 마다 다른 모드로의 전환이 가능합니다. 

#### Burst Capacity
Burst Capacity가 있기 때문에 Provisioned 모드에서도 초과하는 용량에 대해 RCU(Read Capacity Units), WCU(Write Capacity Units) 처리가 가능합니다. `ProvisionedThroughputExceededException`이 발생하면 Burst Capacity가 다 사용되었다는 의미입니다.

#### Write Capacity Units
- WCU는 최대 1KB 아이템에 초당 1개의 유닛을 사용합니다.
  - 5개 아이템을 초당 써야하고 그 아이템 사이즈가 4.5KB이라면, 필요한 WCU의 개수는 25WCU입니다. <span style="background-color:#fff5b1">4.5KB는 5KB로 올림해서 계산합니다.</span>

##### Write Type
- Concurrent write
- Conditional write
- Atomic write
- Batch write

#### Eventually Consistent Read vs Strongly Consistent Read
기본 Consistent Read와 달리 쓰기된 후 바로 그 데이터도 읽고 싶은 경우에 사용됩니다. `ConsistentRead`를 True로 설정해서 사용할 수 있는데 이 때 RCU가 두 배로 들기 때문에 대기시간도 증가합니다.
- Eventually Consistent Read에서 RCU는 최대 4KB 아이템에 <span style="background-color:#fff5b1">초당 2개</span>의 유닛을 사용합니다.
- Strongly Consistent Read에서 RCU는 최대 4KB 아이템에 <span style="background-color:#fff5b1">초당 1개</span>의 유닛을 사용합니다.
  - 5개 아이템을 초당 읽어야 하고 그 아이템 사이즈가 4.5KB이라면, 필요한 RCU의 개수는 10RCU입니다. <span style="background-color:#fff5b1">4.5KB는 8KB로 2개의 RCU를 필요로 합니다.</span>

### Operations 
#### 기본 Operations
- `Scan` - 테이블 전제를 내보냄
- `DeleteItem`
- `DeleteTable`
- `BatchWriteItem` - 배치에서 Update 기능은 없으며 Put, Delete에서 최대 25개, Write 기준 최대 16MB 데이터 배치 작업이 가능합니다.
- `BatchGetItem` - 최대 100개의 아이템, 최대 16MB의 데이터를 Get할 수 있습니다.

#### Conditional
- `attribute_exists`
- `attribute_not_exists`
- `attribute_type`
- `contains` (for string)
- `begins_with` (for string)
- `IN` (:a, :b), `and`, `between` :low `and` :high
- `size` (string length)

다음과 같이 사용할 수 있는데 `ProductCatalog` 테이블에서 아이템을 삭제하기 위한 AWS CLI 예제입니다. `condition-expression`으로 특정 조건의 아이템에 대해서 삭제할 수 있도록 조건을 건 모습을 볼 수 있습니다.
```
aws dynamodb delete-item \
    --table-name ProductCatalog \
    --key '{"Id":{"N":"456"}}' \
    --condition-expression "(ProductCategory IN (:cat1, :cat2)) and (Price between :lo and :hi)" \
    --expression-attribute-values file://values.json
```

#### Copying DynamoDBTable
AWS Data Pipeline으로 AWS EMR Cluster를 실행하고 여기서 테이블을 읽어서 S3에 데이터를 쓰는 방식을 이용할 수 있습니다. 또는 Backup, Scan + PutItem / BatchWriteItem 을 이용하는 방식도 있습니다. 

### Index
#### Local Secondary Index (LSI)
하나의 스칼라 속성(String, Number, Binary)을 갖는 인덱스로 한 테이블당 최대 5개의 LSI를 갖습니다. LSI 변경은 불가능하며 기본 테이블과 동일하게 Write Capacity를 갖습니다. 동일한 파티션 키를 사용하면서 다른 정렬 키로 데이터를 인덱싱하는 방식입니다.
#### Global Secondary Index (GSI)
스칼라 속성(String, Number, Binary)을 갖는 인덱스로 기본 파티션 키와 정렬 키와는 독립적으로 작동합니다. 별도의 읽기 쓰기 용량을 설정해야 하며 초과시에는 성능 문제가 발생할 수 있습니다. <span style="background-color:#fff5b1">GSI의 성능제한은 주 테이블에 성능에 영향을 미칠 수 있습니다.</span> 자체적인 용량을 가지고 있지만 데이터를 비동기적으로 복제하기 때문에 쓰기 용량이 충분히 크지 않다면 GSI 쓰기 작업이 지연될 수 있고 이 부분이 주 테이블 쓰기 작업 속도에 영향을 미칠 수 있습니다.

### Optimistic Locking
충돌 가능성이 작다고 생각되는 경우 즉 읽기 작업 비율이 더 높은 경우에 대해 사용됩니다. 평소에는 충돌 가능성이 없다고 보고 수정시점에만 충돌여부를 확인합니다. 버전 번호나 타임스탬플를 기준으로 데이터 변경여부를 확인합니다. AWS DynamoDB에서 Optimistic Locking을 구현하기 위해서 버전 번호 필드를 추가해서 수정시마다 버전 번호를 갱신할 수 있습니다. 충돌시에는 `ConditionCheckFailedException` 예외가 발생합니다.

### DynamoDB Accelerator, DAX
DynamoDB를 위한 고가용성 캐시로 별다른 로직변환이 필요하지 않으며 Hot Key 이슈를 해결할 수 있습니다. cache 당 5분의 TTL을 갖습니다. DAX는 최대 클러스터에 5개 노드를 둘 수 있으며 최소 3개 노드가 권장됩니다.(AZ당 1개씩) Elastic Cache에는 DAX처럼 단순 쿼리를 위한 작업보다는 집계나 데이터 처리를 통한 결과값을 저장해서 가지고 오는 상황에 더 적합합니다. 
- No Free Tier
- security group port `8111` or `9111`

### Streams
table에 대한 작업 내역을 DynamoDB 스트림으로 Kinesis나 Lambda로 정보를 보낼 수 있습니다. Kinesis Data Stream과 마찬가지로 샤드로 구성되어 있고 AWS에서 자동으로 하기 때문에 별도의 provision이 필요하지 않습니다.
- Lambda DynamoDB trigger 이용

![](https://d2908q01vomqb2.cloudfront.net/887309d048beef83ad3eabf2a79a64a389ab1c9f/2021/03/04/Screen-Shot-2021-03-04-at-09.22.51.png)

### Transaction
여러 작업이 진행될 때 중간에서 실패하면 이전 작업까지 초기화될 수 있도록 Transaction 처리가 필요합니다. 이 경우 운영 비용 2배 더 작용하기 때문에 기존에 CU를 계산하는 방식보다 2배의 CU가 필요합니다.
- 5개 트랜잭션을 초당 써야하고 그 아이템 사이즈가 5KB이라면, 필요한 WCU의 개수는 50WCU입니다. <span style="background-color:#fff5b1">트랜잭션은 2배의 비용이 듭니다.</span>
- 5개 트랜잭션을 초당 읽어야 하고 그 아이템 사이즈가 5KB이라면, 필요한 RCU의 개수는 20RCU입니다. <span style="background-color:#fff5b1">RCU는 4KB를 처리할 수 있습니다.</span> (위에 RCU 계산 참조)



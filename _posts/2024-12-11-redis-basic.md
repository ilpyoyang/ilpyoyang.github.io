---
title: Redis 기초
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Database]
tags: [Redis]
pin: false
math: true
mermaid: true
---

오픈 소스 기반의 인메모리 데이터 저장 및 캐싱 시스템으로, 메모리 내에서 데이터를 빠르게 저장하고 검색할 수 있는 데이터 구조 서버입니다. 주로 다양한 데이터 구조(문자열, 해시, 리스트, 셋, 정렬된 셋 등)를 지원하며, 주로 높은 처리량과 낮은 지연 시간을 필요로 하는 응용 프로그램에 사용됩니다. 또한 Redis는 영속성을 제공하여 메모리에 저장된 데이터를 디스크에 지속적으로 저장할 수 있습니다.
> Cache Register / Cache / Main Memory(DRAM) - In-Memory database / Storage(SSD, MDD)  

### Redis Collections
> String, List, Sets, Sorted Sets, Hash  

### Redis Replication
1. Secondary에 replicaof 또는 slaveof 명령어 전달
2. Primary에 sync 명령
3. Primary는 fork헤서 disk에 해당 정보를 전달하고 fork 이후 데이터를 계속 secondary에 전달

### Redis Cache를 사용하기 적합한 경우의 예
+ 인증 token 저장
+ Ranking Board 이용
+ 유저 API Limit
+ 자료(list) 잡 큐

### 사용시 주의사항
##### 1. key 값이 int의 최대값을 넘는 경우, 장애 발생 가능성 고려
##### 2. 메모리 관리의 중요성
메모리 파편화가 일어나기 때문에 이론적으로 copy write가 발생하면 최대 2배 이상의 메모리 공간 확보가 필요할 수도 있습니다.
+ 즉 Redis 캐싱 서버는 작은 인스턴스 여러 개로 두는 것이 좋습니다.
+ 파편화 자체는 유사한 데이터 크기들이 있을 때, 메모리 파편화 가능성이 낮아집니다.
##### 3. swap 지양하기
Physical 이상의 메모리를 사용하는 경우 위험하며 실제로 swap이 있어서 이상의 메모리를 사용해도 문제가 없는 것 같지만 swap을 사용한다면, 계속 디스크에 접근하기 때문에 효율이 좋지 않을 수 있습니다.  
##### 4. Replication-Fork  
##### 5. RSS 값을 모니터링
+ Redis 메모리 자체는 작게 사용한다고 해도 실제 많은 key 삭제가 발생하거나 하는 이슈가 있을 수 있습니다.
##### 6. Single Thread기 때문에 발생하는 문제점들
Pocket으로 하나의 Command가 완성되면 process Command에서 실행
##### 7. 하나의 작업을 실행하기 때문에 ```O(N)```의 다음 작업들은 피하기
```KEYS```, ```FLUSHALL```, ```FLUSHDB```, ```DELETE COLLECTIONS```, ```GET ALL COLLECTIONS```

---
+ [디디의 Redis](https://www.youtube.com/watch?v=Gimv7hroM8A&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)  
+ [[우아한테크세미나] 191121 우아한레디스 by 강대명님](https://www.youtube.com/watch?v=mPB2CZiAkKM&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)  
+ [[NHN FORWARD 2021] Redis 야무지게 사용하기](https://www.youtube.com/watch?v=92NizoBL4uA&ab_channel=NHNCloud)


---
title: 백엔드 개발자 면접대비 질문정리 - Algorithm & Data Structure
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [CS]
tags: [면접대비]
pin: false
math: true
mermaid: true
---

### Stack, Queue, List, Tree, Hash Table
+ ```Stack```이란 LIFO 선형데이터 구조, push 추가, pop 제거, 후위표기법 계산에 사용
+ ```Queue```란 FIFO 선형데이터 구조로 enqueue 추가, dequeue 제거, 스케줄링, 이벤트 처리에 사용
+ ```List```는 순서를 유지하는 동시에 항목의 빠른 추가와 제거를 가능하게 하는 선형 데이터 구조
  + 배열 또는 연결 리스트로 구현
+ ```Tree```는 계층적 구조를 가진 비선형 데이터 구조, 노드와 엣지로 구성
  + 이진 검색 트리, AVL 트리, B-트리 등
+ ```Hash Table```은 키를 값에 매핑하는 효율적인 데이터 구조로, 빠른 검색, 삽입, 삭제를 지원
  + <span style="background-color:#fff5b1">해시함수를 사용하여 키를 해시 값으로 변환하고 이 해시 값이 저장되는 배열의 인덱스로 사용</span>

### 정렬 알고리즘
+ <span style="background-color:#fff5b1">주어진 데이터를 특정 순서로 재배열하는 알고리즘</span>
+ 버블정렬, 선택정렬, 삽입정렬, 병합정렬, 퀵정렬
  + ```버블정렬```은 인접 항목을 비교해 교환 정렬하는 것
  + ```선택정렬```은 배열의 각 위치에 대해 나머지 배열에서 최솟값을 찾아 해당 위치에 놓는 알고리즘
  + ```삽입정렬```은 각 요소를 이미 정렬된 부분 배열의 올바른 위치에 삽입하여 정렬합니다.
  + ```병합정렬```은 배열을 두 개의 균등한 크기의 부분 배열로 분할하고, 각 부분 배열을 재귀적으로 정렬한 다음 병합합니다. 
  + ```퀵정렬```은 피벗을 선택하고 피벗보다 작은 요소들을 왼쪽에, 큰 요소들을 오른쪽에 위치시킨 후, 각 부분 배열에 대해 재귀적으로 정렬합니다.



## Database
### 각 데이터 베이스별 종류
+ MSSQL
  + Window 생태계에서 좋은데 특정 운영 체제 종속될 수 있다는 단점
+ MariaDB
  + MySQL 오픈소스 포크로 일부 스토리지엔진 Aria, TokuDB와 같은 스토리지 엔진 추가
  + 빠른 쿼리 지원
  + 보안 강화
  + NoSQL 지원
+ MySQL
  + InnoDB 로우레벨 락으로 트랜잭션 동시성 향상과 데드락 이슈를 줄여줌
  + 데이터 압축을 지원하여 디스크 공간을 줄이고 I/O 성능향상
+ Redis
  + Remote Dictionary Server
  + SSD, HDD가 아닌 RAM을 사용하기 때문에 속도가 빠르다.

### 데이터베이스의 정규화
+ <span style="background-color:#fff5b1">관계형 데이터베이스에서 설계 중복을 막기 위한 프로세스</span>
+ 데이터 무결성과 효율성, 복잡성을 줄이는데 사용
+ 1정규형: 데이터 원자값
+ 2정규형: 부분 함수 종속성이 제거
+ 3정규형: 이행 함수 종속성이 제거
+ 보이스-코드 정규형(BNCF): 모든 비 기본키 속성이 기본 키에 대해 이행적 종속
+ 4정규형: 다치 종속성 제거
+ 5정규형: 조인 종속성 제거

### Outer join이란?
+ <span style="background-color:#fff5b1">두 테이블 결합에서 일치하는 값이 없는 경우(null)에도 레코드를 반환</span>
+ left outer join, right outer join, full outer join

### View란?
+ DBMS에서 하나 이상의 테이블에서 파생된 가상 테이블을 의미
+ 기본 테이블의 데이터를 참조하지만 실제로 데이터를 저장하지 않습니다.

```sql
CREATE VIEW EmployeeView AS
SELECT EmployeeName, EmployeeDepartment
FROM EmployeeTable;
```

### Index란?
+ 데이터베이스 검색 속도를 높이기 위한 책의 색인과 같은 존재
+ 잘못 설정시 오히려 성능 저하가 발생하기 때문에 설정이 중요
  + 빈번한 조회가 발생하는 열
  + 고유값이 많은 열
  + 인덱스 크기 최소화
  + 복합 인덱스
    + page lock 걸림, 성능 저하될 수도 있음

### Stored procedure란?
+ 저장 프로시저
+ <span style="background-color:#fff5b1">데이터베이스에서 실행할 수 있는 저장된 코드 블록</span>
+ <span style="background-color:#fff5b1">캐시 저장</span> 후 실행하므로 성능을 높일 수 있고, 특정 권한을 부여해서 보안관리에도 좋습니다.

### Transaction이란?
+ <span style="background-color:#fff5b1">데이터베이스에서 일련의 연산들을 하나의 논리적 작업 단위로 묶은 것</span>
+ ```ACID``` 속성 만족
  + 원자성, 일관성, 고립성, 영구성
  + ```read uncommitted```에서는 고립성 성립 안 됨.
    + ```dirty read```, ```non-repeatable read```, ```phantom read``` 발생 가능성

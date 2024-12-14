---
title: 2부. 한 번에 알아보는 AWS - ELB, ASG, RDS, Aurora, ElastiCache
author: ilpyo
date: 2024-12-13 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## Scalability & Availability
- Vertical Scalability - t2.micro > t2.large
- Horizontal Scalability - distributed system
- High Availability - more than 2 AZ

## ELB
> ALB, NLB, GWLB, Sticky Sessions

로드밸런서는 여러 서버에서 오는 트래픽을 부하 분산을 해주는 역할을 합니다. 여러 AWS 서비스와 연결되어 EC2, ECS의 자동확장, CloudWatch, Route53 등과 통합된 기능을 제공합니다.
- Health Check로 응답이 제대로 오는 인스턴스로 요청을 전달합니다.
- ELB Type - CLB(deprecated), ALB, NLB, GWLB
- <span style="background-color:#fff5b1">provide static DNS name we can use in our application</span>

### ELB Types

<img alt="Screenshot 2024-12-13 at 4 19 05PM" src="https://github.com/user-attachments/assets/014a4df0-1b0b-407d-8650-4669f8df3639" />
#### ALB
ALB는 고정된 hostname을 가지며, 애플리케이션이 직접 클라이언트와 소통하지 않기 때문에 클라이언트오 IP를 알 수는 없습니다. 하지만 `X-Forwarded-For`를 헤더에 넣어 실제 클라이언트의 IP를 전달합니다. 
- Listener Rule을 설정해서 특정 요청에 대해서는 Action으로 어떤 응답을 보낼지에 대해서도 작성할 수 있습니다. 

![ELB](https://github.com/user-attachments/assets/9af868e7-10f4-423e-8867-c177f30c20b0)

##### Target Group
ALB에서는 Target Group을 설정해서 사용할 수 있는데 이 Target Group은 EC2 인스턴스일 수도 있고, ECS task, Lambda functions, IP일 수도 있습니다.
- URL Path, Hostname, Http Headers, QueryString에 따라 Target Group을 지정합니다.

#### NLB
네트워크 로드밸런서는 고성능 TCP, UDP 트래픽을 이용한 통신에 적용됩니다. 가용영역당 하나의 고정 IP를 사용하며, Free Tier에 해당되지 않습니다.

#### GWLB
IP 패킷을 사용한 낮은 계층을 통신을 합니다. GENEVE 프로토콜(포트 6081)을 사용해야 합니다.

### Sticky Sessions
쿠키를 이용해서 사용자가 요청시마다 같은 인스턴스에 요청을 보내게 합니다. Sticky Sessions을 사용하면 쿠키 만료 전까지 사용자의 세션 데이터를 인스턴스가 잃지 않도록 한다는 장점이 있습니다.
- Application-Based Cookie
  - target에 의해 만들어지는 쿠키는 애플리케이션 내부에서 설정됩니다.
  - 로드밸런서에 의해 만들어지는 쿠키는 `AWSALBAPP`이라는 이름을 갖습니다.
- Duration-Based Cookie
  - 로드밸런서에 의해 만들어지며 `AWSALB`, `AWSELB`라는 이름을 갖습니다.

### Cross-Zone Load Balancing
AZ 구분 없이 모든 인스턴스에 동일한 트래픽으로 분산이 가능해집니다. 만약 Cross-Zone Load Balancing를 사용하지 않는 경우에는 요청에 따라 각 가용영역에 있는 인스턴스 수에 비례하는 분산이 발생합니다.
- ALB에서는 Cross-Zone Load Balancing가 활성된 것이 default이기 때문에 inter AZ data에 대해 비용을 부과하지 않습니다.
- 다른 로드밸런서에서는 Cross-Zone Load Balancing가 비활성된 것이 default

### SSL / TLS
SSL은 소켓 계층에서 암호화 연결이 되지만, TLS에서는 전송계층에서 암호화 연결이 되는 SSL의 새로운 버전입니다. 대부분 TLS가 사용되지만 실제로 대부분의 경우에서 SSL로 표현합니다.
- 로드밸런서는 X.509 certifiacate를 사용합니다.
- ACM(Amazon Certificate Manager)를 통해서 관리할 수 있습니다.
- SNI(Server Name Indication)를 사용하면 여러 웹사이트에서의 SSL 처리를 가능하게 합니다. CLB에서는 지원하지 않습니다.

## Auto Scaling Group
스케일 아웃을 위한 설정을 ASG를 이용해서 할 수 있습니다. 인스턴스의 대체, 증가를 가능하게 합니다. 로드밸런서를 이용하는 경우 연결된 인스턴스의 health check에 의해 인스턴스가 정상적이지 않다고 판단되면 ASG 설정대로 인스턴스를 대체할 수 있습니다.
- Launch Template를 이용해서 AMI, EC2 User data, EBS, ELB 등 세팅을 할 수 있습니다.
- Scaling Policies로 CPU 사용량에 따라 인스턴스를 추가하는 등의 정책을 설정할 수 있습니다.
  - <span style="background-color:#fff5b1">Target Tracking Policy</span>로 평균 어느 정도의 수치의 연결에 대한 설정을 지정 가능합니다.
- Scaling Cooldowns으로 300sec default 값을 갖습니다.
- 정책에 따른 CPU 기준을 넘어서는 사용이 발생해도 설정한 `maximum capacity`를 증가시키지 않습니다.
- CloudWatch 알림에 따른 스케일 아웃을 설정할 수 있습니다.

## Database
> RDS, Aurora, ElastiCache

RDS, Aurora의 Audit log는 CloudWatch로 전달해서 더 오랜 기간 보관할 수 있습니다.

### RDS
관계형 데이터베이스로 <span style="background-color:#fff5b1">MySQL, PostgreSQL, MariaDB, Oracle, MS SQL Server, Amazon Aurora</span>를 제공합니다.
- 지속적인 백업과 복원을 제공합니다.
- 모니터링도 제공하나 SSH는 불가합니다.
- Auto Scaling을 제공합니다.
- Read Replica를 이용해서 복제본으로 읽기에 사용하거나 원본 DB를 대체하는데 사용할 수 있습니다.
  - 최대 15개 Read Replica
- 다른 AZ로 데이터를 이동해야하는 경우에는 비용이 발생하지만 같은 AZ 기준에서는 별도 네트워크 비용이 발생하지 않습니다.
- 수정에서 멀티 AZ를 가능하게 하면 스냅샷 기능을 이용해서 원래 RDS를 멀티 AZ로 변경하게 됩니다.

### Aurora
Postgres, MySQL와 호환되는 고성능의 RDS로 지원합니다. Aurora는 MySQL의 5배, PostgreSQL의 3배 처리량을 제공한다고 합니다.
- 최대 15개 Read Replica를 갖습니다.
- 비용이 RDS보다 높습니다.
- Aurora DB Cluster에서 Writer Endpoint로 Master DB와 Reader Endpoint로 Reader DB들과 연결할 수 있습니다. 

### RDS Proxy
RDS Proxy를 RDS와 Aurora에서 사용할 수 있는데 데이터베이스에 직접 연결하지 않고 프록시에 연결하게 되므로 데이터베이스 효율성이 높여줍니다. 그리고 RDS와 Aurora의 failover 시간을 줄여주고
IAM 인증과 보안 관리를 AWS Secret Manager에서 가능하게 합니다.
또한 RDS Proxy는 VPC에서만 연결할 수 있기 때문에 보안상 안전합니다.

### ElastiCache
캐시 히트가 발생하면 ElastiCache에서 직접 데이터를 가지고 오고 캐시 미스가 발생하면 데이터베이스에서 데이터를 가지고 옵니다. 그리고 다시 ElastiCache에 캐시를 저장하게 됩니다.
이렇게 하면 직접 데이터베이스 조회 없이 ElastiCache로 확인할 수 있기 때문에 부하가 줄고, 빈번하게 조회되는 데이터에 대해서 더 빠르게 데이터를 가지고 올 수 있다는 장점이 있습니다.
- Redis는 multi-AZ에 복제 데이터베이스를 만들 수 있습니다. 그리고 AOF(Append-On-File) 영속성을 이용해 데이터 지속성도 지원합니다.
- Memcached는 여러 노드로 데이터를 샤딩해서 관리할 수 있습니다. 데이터 지속성이 없고, 복제를 이용한 고가용성을 제공하지 않습니다. 멀티 스레드를 지원합니다.
- 참고로 Redis-compatable API를 이용해서 인메모리 고성능을 제공하는 `Amazon MemoryDB`도 있습니다.
- <span style="background-color:#fff5b1">5 Read Replicas you can add in an ElastiCache Redis Cluster with Cluster-Mode-Disabled</span>
- <span style="background-color:#fff5b1">Read Replica uses Asynchronous Replication and Multi-AZ uses Synchronous Replication</span>

#### ElastiCache Strategy
- 캐싱을 하는 것이 좋은가?
- 보안이 갖춰져 있는가?
- 캐싱을 하기 위한 데이터 설계가 되어 있는가?
- 어떤 캐싱 모델을 사용할 것인가?

##### lazy loading / cache aside / lazy population
캐시 미스일 경우 RDS에서 읽어오고 다시 캐시를 쓰는데 이 과정에서 지연 로딩으로 보이는 사용자 경험이 생길 수 있습니다.

##### write through
데이터를 쓸 때, RDS와 캐시에 둘 다 쓰는 것을 말합니다. 데이터가 RDS와 캐시가 일치하지 않을 수도 있기 때문에 lazy loading 전략을 함께 사용할 수도 있습니다.
읽히지 않을 캐시들이 많이 생성될 수 있다는 단점이 있습니다.

##### cache evictions and ttl
캐시를 명시적으로 삭제하거나 시간이 일정기간 지난 캐시는 삭제되도록 할 수 있습니다.

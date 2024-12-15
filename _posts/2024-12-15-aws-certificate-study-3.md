---
title: 3부. 한 번에 알아보는 AWS - Route53, VPC
author: ilpyo
date: 2024-12-15 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## Route53
> DNS, Records, Routing Policy,

DNS 통제권을 제공하며 IP 주소를 전달해 인스턴스에 연결할 수 있도록 도와줍니다. 리소스의 상태 체크와 100% 서비스 수준 계약(SLA)이 가능합니다. `53`은 DNS 기본 포트번호입니다.
- 타사에서 도메인을 구입한 뒤 네임서버를 Route53에 등록해서 사용할 수 있습니다. (ex. goDaddy)

### DNS
사람들이 쉽게 이해할 수 있는 hostname에서 IP 주소로 변환시켜주는 역할을합니다.
- TLD(Top Level Domain) - `.com`
- SLD(Second Level Domain) - `.github.com`
- Sub Domain - `api.github.com`
#### DNS의 작동원리
먼저 클라이언트가 웹 브라우저에서 DNS 요청을 보내면 로컬 DNS 서버가 캐시에 해당하는 DNS 정보가 있는지 확인하고 IP 주소로 바꿔서 전달합니다.   
없다면 로컬 DNS 서버에서 질의를 해서 Root DNS 서버에서 TLD 정보를, TLD DNS 서버에서 SLD 정보를, SLD DNS 서버에서 IP 주소에 대한 정보를 전달 받아 옵니다. 즉 순차적으로 IP를 얻을 수 있는 정보를 찾고 이를 로컬 DNS 서버에 캐시 처리해두고 결과 IP주소를 웹 브라우저에 전달합니다. 그리고 이 주소를 바탕으로 웹 서버에 연결할 수 있게 됩니다.

### Records
레코드는 도메인/서브도메인 이름, 레코드 타입, 값, 라우팅 정책, TTL을 포함합니다. 여기서 레코드 타입으로는 A, AAAA, CNAME, NS 등이 있습니다.
- A - hostname을 IPv4에 매핑
- AAAA - hostname을 IPv6에 매핑
- CNAME - hostname을 다른 hostname에 매핑
- NS - Hosted Zone의 네임서버
  - Hosted Zone은 도메인 이름을 관리하기 위한 컨테이너 역할을 하는 리소스입니다.
  - AWS에서 자동으로 네임서버를 할당하고 이를 도메인 등록기관에 등록해 해당 DNS 요청이 Route53로 전달되게 합니다.
    - 공용 Hosted Zone과 달리 VPC 내 리소스에서의 쿼리를 위해 Private Hosted Zone를 사용할 수도 있습니다.

#### TTL
TTL을 이용해서 클라이언트에 제공하는 레코드의 정보를 캐시로 가지고 있을 수 있도록 합니다. 이렇게 하게 되면 클라이언트에서 Route53으로 쿼리하는 트래픽이 줄어들게 됩니다.
```
nslookup api.github.com
dig api.github.com
// ANSWER SECTION
```

#### Alias
CNAME은 루트 도메인을 위한 기능입니다. 반면, Alias는 CNAME과 달리 루트 도메인이 아닌 경우에도 동작합니다.  Alias은 아래 [리소스의 값](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html)으로 응답할 수 있습니다. 하지만 Records Target으로는 EC2 DNS name을 사용할 수 없습니다.
- Amazon API Gateway 사용자 지정 리전 API 또는 엣지 최적화 API
- Amazon VPC 인터페이스 엔드포인트
- A CloudFront 배포
- Elastic Beanstalk 환경
- Elastic Load Balancing 로드 밸런서
- AWS Global Accelerator 액셀러레이터
- 정적 웹사이트로 구성되는 Amazon S3 버킷
- 동일한 호스팅 영역에 있는 같은 유형의 다른 Route 53 레코드
- AWS AppSync 도메인 이름

#### 라우팅 정책
Route53가 쿼리에 응답하는 방식을 결정하기 위해 라우팅 정책을 지정할 수 있습니다. Traffic Policy를 통해 만들 수도 있으며 이 경우 설정시에 좀 더 시각화된 자료로 확인이 가능합니다.
- Simple routing policy
- Failover routing policy
  - health-check 결과에 따라 리소스가 정상인 경우에 연결을 할 수 있도록 하고 unhealthy시에는 리소스의 secondary 설정에 따라 연결됩니다.
- Geolocation routing policy
  - 사용자 위치 기반 라우팅 정책입니다.
- Geoproximity routing policy
  - 리소스 위치 기반 라우팅 정책입니다.
  - Bias에 따라 더 많은 사용자가 해당 리소스로 라우팅될 수 있도록 설정할 수 있습니다.
- Latency routing policy
  - 가까운 ALB로 리다이렉트될 수 있도록 설정하는 정책입니다.
- IP-based routing policy
  - 사용자의 위치에 기반하여 트래픽을 라우팅하고 트래픽이 시작되는 IP 주소가 있는 경우에 사용합니다.
- Multivalue answer routing policy
  - 최대 8개의 정상 레코드를 임의로 선택하여 DNS 쿼리에 응답하는 경우에 사용합니다.
- Weighted routing policy
  - 가중치를 정해서 요청의 몇 %를 특정 리소스로 보낼지 정합니다.
  - 모든 가중치 값이 0인 경우 요청에 동일한 %로 리소스가 분배됩니다.

## VPC
가상 사설 네트워크로 서브넷으로 VPC 내에 파티셔닝을 할 수 있습니다. Internet Gateway를 사용하면 VPC에 있는 서브넷에도 접근이 가능합니다. 하지만 private 서브넷에 접근하려고 하는 경우에는 NAT Gateway를 거쳐 Internet Gateway에 접근할 수 있습니다.
- VPC Flow log를 이용한 네트워크 트래픽 로그를 보여줍니다.
- VPC Peering
  - 두 VPC가 서로 비공개 IP 주소를 사용하여 통신할 수 있게 됩니다.
  - 연결은 단방향으로 한 개의 Peering VPC를 대상으로 합니다.
  - 또한 연결시에는 두 VPC의 CIDR 블록(ex. `192.168.1.0/24`)이 겹쳐서는 안 됩니다.
- VPC Endpoint
  - VPC Endpoint Gateway를 이용해서 S3 또는 DynamoDB에 연결할 수 있습니다.
  - VPC Endpoint Interface를 이용하면 Cloudwatch와 같은 서비스와 연결될 수 있습니다.
- Site to Site VPN은 인터넷을 통해 암호화 연결되지만 Direct Connect는 물리적 연결로 안전하고 빠르지만 구축되는데 몇 달이 걸릴 수 있습니다.

---
title: 8부. 한 번에 알아보는 AWS - CloudWatch, CloudTrail
author: ilpyo
date: 2024-12-28 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

모니터링을 통해 이슈를 예방하거나 성능, 비용에 대해 확인할 수 있고 스케일링 방안에 대해 내부적으로 고려할 자료를 제공받을 수 있습니다.

## AWS CloudWatch
모든 AWS 클라우드 리소스와 애플리케이션의 모니터링, 로그 수집, 메트릭 분석, 경고 설정 및 자동화된 응답을 관리하는 서비스입니다. Metric을 수집하거나 로그를 관리하는 역할로 사용합니다. 그 외에도 CloudWatch를 이용한 ASG, Lambda, Function 연계하여 자동화된 작업을 수행합니다.  
기본적으로 EC2 메모리 사용량에 대한 정보는 제공되지 않기 때문에 따로 설정이 필요합니다.
- `PutMetricData`

### Custom Metric
Metric은 특정 리소스에 대한 지표를 의미합니다. 예를 들어 'EC2 인스턴스 CPU 점유율'에서 CPU 점유율과 같은 값을 말합니다.
- CPU, Disk Metrics, RAM, Netstat, Processes, Swap Space
- <span style="background-color:#fff5b1">High-Resolution Custom Metrics: 1초 단위 세분화 데이터</span>
  - <span style="background-color:#fff5b1">High-Resolution Custom Metrics에 대한 알람설정: 10초 or 30초 단위 or 60초 배수 알람 설정 가능</span>

AWS CloudWatch에서 기본적으로 제공하는 Metric 외에도 사용자가 특정 지표를 만들어서 규정할 수 있습니다. Custom Metric을 생성할 때, `dimensions`을 이용해서 지표에 대한 설정을 더 명확하게 할 수 있습니다. 이름과 값을 측정기준으로 하며 인스턴스를 그룹화할 수 있습니다.
```
aws cloudwatch put-metric-data --metric-name Buffers --namespace MyNameSpace --unit Bytes --value 231434333 --dimensions InstanceId=1-23456789,InstanceType=m1.small
```

### AWS CloudWatch Log
#### Log Insights
실시간 데이터가 아니며 쿼리 기반 엔진입니다.  
로그는 기본적으로 암호화되고 키를 KMS 기반으로 암호화할 수 있습니다. 로그 데이터는 12시간이 지나면 S3에 저장할 수 있으며 이를 `CreateExportTask` 설정으로 할 수 있습니다.
```  
fields @timestamp, @message  
| filter requestParameters.instancesSet.items.0.instanceId="i-abcde123"  
| sort @timestamp desc  
```  

#### CloudWatch Log Subscriptions
실시간 로그를 확인하고 싶은 경우에는 CloudWatch Log Subscriptions를 사용하면 됩니다. 이 로그 데이터를 Subscription Filter를 거쳐서 Kinesis나 Lambda로 보낼 수도 있습니다.
- `LiveTail`을 이용해서 실시간으로 해당하는 로그들을 받아볼 수 있는데 매일 1시간은 무료로 사용이 가능합니다.

![](https://cloudwellserved.com/wp-content/uploads/2020/06/kinesis1.png)

### CloudWatch Alarms
기본적으로 하나의 지표에 대한 알람을 제공하지만 Composite Alarm을 사용하면 여러 지표에 대해 알람을 받을 수 있습니다. `AND`, `OR` condition을 제공합니다. 이렇게 여러 지표에 대한 알람으로 정확한 알람만을 제공받으므로써 불필요한 알람을 방지할 수 있습니다.
- [`set-alarm-state`](https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/set-alarm-state.html)으로 전세계적인 트래픽 증가 테스트용으로 활용

### CloudWatch Synthetics Canary
일정에 따라 실행되는 스크립트 Canary를 사용해서 모니터링이 가능합니다. 문제가 될 수 있는 엔드포인트 지연을 확인하거나 로드 시간 데이터나 UI 스크린샷을 저장할 수 있습니다. AWS X-Ray와 함께 서비스에 대한 전체적인 뷰를 제공하며, 성능 병목 현상을 파악하는데 사용됩니다.

### AWS EventBridge
이전에는 CloudWatch Event로 불리던 서비스입니다. EventBridge는 AWS 리소스의 변경 사항을 설명하는 시스템 이벤트의 스트림을 거의 실시간으로 제공합니다. Cron job을 이용한 스케쥴링 또는 Event Pattern에 따른 방법, Trigger에 따른 발생 등으로 작동합니다. EventBus를 메인 Account에만 설정하고 다른 Account에서 발생한 이벤트들을 모아서 EventBus에 적용시킬 수도 있습니다.
- AWS 리소스에 따라 반응하는 Default Event Bus
- AWS SaaS 파트너스(zendesk, DATADOG 등)에 따라 반응하는 Partner Event Bus
- Custom App에 따라 반응하는 Custom Event Bus

Sandbox라는 새로운 기능이 생겼는데 이걸 사용해서 새로운 규칙을 만들거나 편집할 필요 없이 이벤트 패턴을  정의하고 샘플 이벤트를 사용하여 원하는 이벤트와 일치하는지 확인할 수 있습니다.

### CloudWatch Evidently 
애플리케이션의 기능을 변경하거나 새로 도입할 때, 실시간으로 사용자의 반응을 모니터링하고 데이터 기반으로 결정을 내리도록 도와줍니다. 기능을 활성/비활성화 할 수 있는 Feature Flags와 A/B 테스트 실험이 가능합니다. 

---

## AWS X-Ray
애플리케이션의 성능을 분석하고 디버깅할 수 있는 서비스로 분산 트레이싱(distributed tracing)을 통해 애플리케이션의 요청 흐름을 추적하고, 서비스 간 상호작용을 표현하는 서비스 맵을 제공합니다. 트랜잭션의 세부적인 흐름을 요청해서 각 서비스에서 얼마나 소요되었는지, 오류나는 부분이 어디인지를 파악할 수 있습니다.
- [APIs](https://docs.aws.amazon.com/pdfs/xray/latest/api/xray-api.pdf#Welcome)
- Elastic Beanstalk 생성시 AWS X-Ray deamon 설정이 가능합니다.
  - `.ebextensions/xray-daemon.config` 설정 파일이 필요
- ECS Cluster에서의 AWS X-Ray deamon 설정 옵션들
  - 각 EC2에서 하나의 deamon을 설정
  - 여러 애플리케이션마다 Side-car 형태로 deamon을 하나씩 실행
  - Fargate Cluster에서 애플리케이션 컨테이너마다 Side-car 형태로 deamon을 하나씩 실행
- trace에 추가정보를 넣기 위해서 <span style="background-color:#fff5b1">annotation</span>을 사용

#### X-Ray 작동원리
X-Ray는 애플리케이션 코드에 AWS X-Ray SDK가 있어서 trace를 X-Ray Daemon에서 실행하고 이를 배치로 AWS X-Ray에 정기적으로 전달하므로써 작동이 됩니다. X-Ray Daemon은 낮은 수준의 UDP 패킷으로 작동합니다.

#### X-Ray Instrumentation
Instrumentation은 제품의 성능을 측정하고 에러를 진단하는 것을 의미합니다. 애플리케이션 Instrumentation을 위해서는 OpenTelementry를 이용하는 방식과 X-Ray SDK를 이용하는 방식이 있습니다. SDK를 이용해서 종속성을 추가해서 간단하게 이용할 수 있습니다.

```java
dependencies { 
	compile("com.amazonaws:aws-xray-recorder-sdk-core")
	compile("com.amazonaws:aws-xray-recorder-sdk-aws-sdk") 
	compile("com.amazonaws:aws-xray-recorder-sdk-aws-sdk-instrumentor") 
	compile("com.amazonaws:aws-xray-recorder-sdk-apache-http") 
	compile("com.amazonaws:aws-xray-recorder-sdk-sql-postgres") 
	compile("com.amazonaws:aws-xray-recorder-sdk-sql-mysql")
	testCompile("junit:junit:4.11") 
} 
dependencyManagement { 
	imports { 
		mavenBom('com.amazonaws:aws-xray-recorder-sdk-bom:2.11.0')
	} 
}
```

#### X-Ray Sampling Rule
[Sampling rule](https://docs.aws.amazon.com/ko_kr/xray/latest/devguide/xray-console-sampling.html)에 따라 초당 적어도 한 개의 요청은 반드시 기록합니다. <span style="background-color:#fff5b1">기본적으로 X-Ray SDK는 매초 첫 번째 요청과 추가 요청의 5%를 기록합니다.</span> 예를 들어 초당 10개 요청이 들어오면, 첫 번째 요청은 반드시 기록되고 나머지 9개 요청 중 5%인 0.45개, 반올림해서 1개 요청을 기록합니다.

```json
{ 
	"version": 2, 
	"rules": [
		{ 
			"description": "Player moves.", 
			"host": "*", 
			"http_method": "*", 
			"url_path": "/api/move/*", 
			"fixed_target": 0, 
			"rate": 0.05 
		} 
	], 
	"default": { 
		"fixed_target": 1, 
		"rate": 0.1 
	} 
}
```

너무 많은 요청을 다 기록하는 것은 비용적으로 부담이 될 수 있기 때문에 필요한 요청을 기록할 수 있도록 X-Ray Sampling Rule을 정하는 것은 중요합니다. 임의로 X-Ray Sampling Rule을 생성할 수 있습니다.

---
## AWS Distro for OpenTelementry
애플리케이션의 분산 trace와 metric을 얻기 위한 모니터링 툴입니다. 물론 AWS 리소스와 서비스의 메타데이터를 수집할 수도 있습니다. X-ray와 유사하지만 코드 수정없이 trace와 metric 정보를 AWS 서비스나 파트너 솔루션에 제공할 수 있습니다.
![](https://aws-otel.github.io/static/img18-d16285359fd80134740fef110ac4f867.png)

---

## AWS CloudTrail
AWS 계정에서 발생하는 모든 API 호출을 기록하고 저장하는 서비스입니다. 이 로그를 통해 누가 언제 어떤 AWS 리소스를 변경했는지를 추적할 수 있으며, 보안, 감사, 규정 준수 및 문제 해결을 위한 중요한 데이터를 제공합니다. 이 로그들을 CloudWatch나 S3로 보낼 수 있습니다.
- Event options
  - Management Event은 정책을 설정하거나 보안설정 등의 사항입니다.
  - Data Event는 기본적으로 볼륨이 크기 때문에 기본사항은 아닙니다.
  - CloudTrail Insight Event는 평소와 다른 특이사항이 포착된 경우 기록되는 이벤트입니다.
- 이벤트들은 기본적으로 90일 저장되고 이후 삭제됩니다. 더 긴 기간 저장하고 싶을 때는 S3를 사용해서 long-term retention 설정할 수 있습니다.
- EventBridge를 사용해서 특정 API라는 event가 발생하면 이에 맞는 rule로 alert를 SNS를 사용해서 보낼 수 있습니다.
- CloudTrail는 API call 감사로그를 남길 때, CloudWatch는 모니터링을 할 때, X-ray는 세분화된 trace 기반 분석을 제공하는 서비스라는 점에서 차이가 있습니다.

---
title: 6부. 한 번에 알아보는 AWS - Elastic Beanstalk, CloudFormation
author: ilpyo
date: 2024-12-18 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

## AWS Elastic Beanstalk
Elastic Beanstalk는 웹 애플리케이션 및 서비스의 배포 및 조정을 위한 서비스입니다. 거의 모든 앱의 배포 환경은 비슷한 경우가 많습니다. 따라서 관리하는 앱이 여러 개이지만 비슷한 인프라 구조를 갖춰야 하는 경우에는 기본 Preset 또는 Custom Configure 세팅을 통해 Elastic Beanstalk를 이용해서 편리하게 배포가 가능합니다.
- Elastic Beanstalk 무료 서비스를 제공하지만 사용되는 서비스들은 비용이 발생합니다.
- Application, Application Version, Environment(Worker, Web-Server)으로 구성
- 다양한 언어를 제공
- Elastic Beanstalk을 설정하면 CloudFormation에서 생성된 이벤트 확인가능

### Rolling updates and deployments
- `AllAtOnce` - 모든 인스턴스에 한 번에 배포, 가장 빠르지만 무중단 배포는 불가능한 방식
- `Rolling` - 표준 롤링 배포방식
- `RollingWithAdditionalBatch`- 배포를 시작 전, 인스턴스의 추가 배치로 전체 용량을 유지
- `Immutable`- 모든 배포에 대해변경 불가능한 업데이트를 수행
- `TrafficSplitting`- 트래픽 분할 배포를 수행하여 애플리케이션 배포를 <span style="background-color:#fff5b1">Canary 테스트 진행</span>

![elastic-beanstalk-deploy-options](https://github.com/user-attachments/assets/cf13fcc0-864a-4562-a702-532559a04030)

### Lifecycle Policy
1000개 애플리케이션 버전을 저장할 수 있고, 이후 다른 버전을 만들기 위해서는 이전 버전을 삭제해야 합니다. Lifecycle Policy을 통해 이전 버전을 어떻게 관리할 것인지 정할 수 있습니다.
- limit by total count
- limit by age

### Extensions
`./ebextensions/`에서 YAML/JSON 형태의 파일로 Elastic Beanstalk에 필요한 설정을 추가해줄 수 있습니다. 예를 들어 `.config` 설정에 따라 환경변수 주입이 가능합니다. 또는 아래 예시와 같이 로드밸런서 유형을 설정할 수도 있습니다.
```
option_settings: 
	aws:elasticbeanstalk:environment: 
		LoadBalancerType: network
```

##  Migration
Elastic Beanstalk 환경 세팅 후에는 로드밸런서를 변경할 수 없는데 만약 변경하고 싶다면 마이그레이션을 통해 새로운 환경에 애플리케이션을 배포해야 합니다. 그 후 CNAME Swap이나 Route53 업데이트 처리를 해서 연결할 수 있습니다.

---

## CloudFormation
인프라 관리와 복제 및 이벤트와 같은 사항들을 확인할 수 있게 하는 서비스입니다. 템플릿 및 스택으로 작업합니다. 템플릿은 json, yaml과 같은 형식의 텍스트 파일로 아래와 같은 [예시](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/cloudformation-overview.html)를 AWS에서 제공하고 있습니다. 아래 json 파일은 `t2.micro` 타입의 EC2 인스턴스를 프로비저닝합니다.
```json
{
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "A sample template",
    "Resources": {
        "MyEC2Instance": {
            "Type": "AWS::EC2::Instance",
            "Properties": {
                "ImageId": "ami-0ff8a91507f77f867",
                "InstanceType": "t2.micro",
                "KeyName": "testkey",
                "BlockDeviceMappings": [
                    {
                        "DeviceName": "/dev/sdm",
                        "Ebs": {
                            "VolumeType": "io1",
                            "Iops": 200,
                            "DeleteOnTermination": false,
                            "VolumeSize": 20
                        }
                    }
                ]
            }
        }
    }
}
```

### CloudFormation 이용시 장점
- Git으로 인프라 구조에 대한 코드를 관리할 수 있다는 장점이 있습니다.
- 비용이 어디서 발생하는지 쉽게 확인이 가능하고 예측 또한 할 수 있습니다.
- VPC, Network, App 스택을 따로 두어 관심사 분리를 통해 여러 앱과 계층을 관리할 수 있습니다.

### CloudFormation 동작원리
Template을 S3에 업로드 하면 이 내용을 바탕으로 CloudFormation에서 스택을 생성합니다. 그리고 AWS에 리소스를 생성하게 됩니다. 스택을 삭제하면 같이 생성된 리소스도 같이 사라집니다.
- [Template를 만드는 방법](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/template-guide.html)은 여러가지 있는데 인프라 컴포저나 Designer를 이용한 방법과 직접 Template을 작성하는 방법이 있습니다.

### CloudFormation 설정

#### Resources
Template을 구성하는 핵심요소로 `service-privider::service-name::data-type-name`으로 표기됩니다. (ex. `AWS::EC2::Instance`) 모든 리소스를 지원하지는 않습니다.

#### Parameters
예를 들어 인스턴스를 만들 때도 어떤 인스턴스를 선택할지 `AllowedValues`라는 값을 두어 타입을 정할 수 있습니다. 파라미터 값으로 레퍼런스를 둘 때는 `!Ref`와 같은 표현을 앞에 두어 참고하게 할 수 있습니다.
템플릿에서 Pseudo 파라미터 값을 갖는 경우 기본값으로 그 값을 갖게 됩니다.
```
Parameters:
  ParameterLogicalID:
    Description: Information about the parameter
    Type: DataType
    Default: value
    AllowedValues:
      - value1
      - value2
```
#### Mappings
미리 매핑 값을 지정해두고 참조할 수 있도록 변수처럼 사용할 수 있습니다. 파라미터와 달리 여러 군데서 값을 사용하는 경우 편리합니다.
```
AWSTemplateFormatVersion: 2010-09-09
Mappings: 
  AMIIDMap: 
    us-east-1:
      MyAMI1: ami-0ff8a91507f77f867
      MyAMI2: ami-0a584ac55a7631c0c
    us-west-1:
      MyAMI1: ami-0bdb828fd58c52235
      MyAMI2: ami-066ee5fd4a9ef77f1
      
Resources: 
  myEC2Instance: 
    Type: "AWS::EC2::Instance"
    Properties: 
      ImageId: !FindInMap [AMIIDMap, !Ref "AWS::Region", MyAMI1]
      InstanceType: t2.micro
```
#### Outputs&Exports
스택의 출력 값을 선언합니다. 다른 스택 값을 참조하는 경우에도 사용할 수 있습니다.
```
Outputs:
  OutputLogicalID:
    Description: Information about the value
    Value: Value to return
    Export:
      Name: Name of resource to export
```
#### Conditions
아래 yaml처럼 `CreateProdResources` 운영 서버를 만드는 조건에서는 EC2를 만들라는 조건을 달 수 있습니다.
```
Resources:
  MountPoint:
    Type: "AWS::EC2::Instance"
    Condition: CreateProdResources
```
#### Intrinsic Functions
- `!Ref` - 참조를 해야 하는 경우
- `!GetAtt` - 특정 리소스의 값을 가지고 와야하는 경우
- `!FindInMap` - Mapping 값에서 특정 내용을 찾는 경우
- `!ImportValue` - 다른 스택에서 값을 가지고 오는 경우
- `!Base64` - Base64 암호처리가 필요한 경우

#### Rollbacks
스택 생성이나 업데이트 시에  실패에 대한 대처를 Rollback으로 실행할 수 있습니다. 모두 되돌리거나 실패한 스택만 되돌리는 방법을 선택할 수 있습니다.

#### Service Role
Service Role은 스택에 리소스를 생성, 업데이트 등 작업을 할 수 있도록 부여하는 것입니다. 이 기능을 사용하기 위해서 사용자는 반드시 `iam:PassRole` 권한을 가지고 있어야 합니다.

#### Capabilities
템플릿에 IAM 설정에 대한 요구를 필요로 하는 경우 Capabilities에서 IAM 리소스 생성에 대한 동의 과정을 거쳐야 합니다.
- `CAPABILITY_IAM`
- `CAPABILITY_NAMED_IAM`

#### Policy

##### Deletion Policy
- `Delete` - 템플릿 삭제나 리소스 제거를 위해서 사용. 기본값.
- `Retain` - 리소스를 CloudFormation 삭제시에도 보존하는 것으로 하는 세팅입니다.
- `Snapshot` - 삭제 전 리소스 스냅샷을 만드는 설정.
##### Stack Policy
어떤 Action에 대해 리소스별 설정으로 스택에서 처리여부를 결정할 수 있도록 하는 것을 말합니다. 아래 json에서 보면 `LogicalResourceId/ProductionDatabase`에 대해서는 업데이트를 막는 것을 알 수 있습니다.
```
{
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : "Update:*",
      "Principal": "*",
      "Resource" : "*"
    },
    {
      "Effect" : "Deny",
      "Action" : "Update:*",
      "Principal": "*",
      "Resource" : "LogicalResourceId/ProductionDatabase"
    }
  ]
}
```

#### Termination Protection
실수로 스택을 삭제를 하는 경우를 방지하기 위해서 삭제시 Termination Protection 여부를 비활성으로 바꿔야 삭제가 가능하도록 하는 조치입니다.

#### Custom Resources
사례로 들면, 스택을 지울 때 S3에 Object가 있으면 리소스 삭제가 되지 않습니다. 따라서 이럴 때는 Custom Resources을 이용해서 람다로 bucket을 비우고 스택 삭제가 바르게 실행될 수 있도록 할 수 있습니다.

#### StackSets
여러 지역에 같은 스택을 만들고 싶을 때 StackSets을 만들어서 target에 스택을 만들 수 있습니다. 

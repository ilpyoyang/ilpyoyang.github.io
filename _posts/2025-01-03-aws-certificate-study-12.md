---
title: 12부. 한 번에 알아보는 AWS - SAM, CDK, Cognito, Other Serverless Services
author: ilpyo
date: 2025-01-03 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

![](https://github.com/awslabs/serverless-application-model/blob/master/aws_sam_introduction.png)

## SAM(Serverless Application Model)
서버리스 앱을 개발하고 배포하는 실제 프레임워크를 말합니다. 아래와 같은 SAM Template를 가지고 sam build를 진행하면 CloudFormation Template이 만들어집니다. 그리고 애플리케이션 코드와 이 yaml 파일을 S3 버킷에 업로드하고 sam deploy를 진행합니다. 즉, 템플릿을 AWS CloudFormation으로 변환하고, AWS CloudFormation로 배포합니다. 
```yml
AWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31
Resources:
  getAllItemsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/get-all-items.getAllItemsHandler
      Runtime: nodejs20.x
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /
            Method: GET
    Connectors:
      MyConn:
        Properties:
          Destination:
            Id: SampleTable
          Permissions:
            - Read
  SampleTable:
    Type: AWS::Serverless::SimpleTable
```

- SAM Accelerate로 인프라 업데이트가 없다면 `sam sync`로 빠르게 프로젝트를 배포할 수 있습니다.
- `sam pipeline init --bootstrap` 명령을 사용하여 CICD 배포 파이프라인을 구성할 수 있습니다.
- [serverless-application-model](https://github.com/aws/serverless-application-model)
- SAM을 이용해서 API Gateway, DynamoDB, CodeDeploy와 같은 서비스들과 로컬 운영에 대한 적용이 가능합니다.
- 다중 환경 운용을 지원합니다.(ex. Dev, Prod)

### SAM CLI Commands
SAM 업로드를 위한 명령어
```
sam deploy
```

SAM으로 CloudFormation을 활용하기 위한 명령어
```
aws cloudformation package --s3-bucker {bucket-name} --template-file {template.yaml} --out-template-file {template-generated.yaml}
aws cloudformation deploy --template-file {template.yaml} --stack-name {stack-name} --capablities CAPABILITY_IAM
```
- [SAM CLI](https://docs.aws.amazon.com/ko_kr/serverless-application-model/latest/developerguide/install-sam-cli.html) 설치
- [AWS SAM CLI 명령 참조](https://docs.aws.amazon.com/ko_kr/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

---

## CDK (Cloud Development Kit)
클라우드 인프라를 프로그래밍 언어로 정의하게 해줍니다. SAM과 달리 모든 AWS 서비스를 지원하고 serverless 초점이 아닌 프로그래밍 언어에 의한 지원이 가능하다는 점이 큰 차이가 있습니다. CDK는 SAM과 함께 사용되어 서비스 운용이 가능합니다. 

다음은 CDK를 이용해서 AWS Fargate 기반 ECS Cluster를 사용할 수 있게 하는 예제 CDK 코드입니다. CloudFormation 스택이 생성되고 이를 통해 ECS 클러스터, Fargate 서비스, VPC 및 로드 밸런서 등이 자동으로 배포됩니다. 이렇게 생성하면 CDK에 의해 리소스가 50개 이상의 리소스들이 자동으로 생성됩니다.
```typescript
export class MyEcsConstructStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 6, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
  }
}
```

### CDK Command
- `npm install -g aws-cdk-lib` - CDK CLI와 라이브러리 설치
- `cdk init app` - CDK 템플릿 앱 초기화
- `cdk synth` - CDK 스택을 CloudFormation 템플릿으로 변환
- `cdk bootstrap` - AWS CDK가 AWS 리소스를 관리할 수 있도록 기본 환경을 준비하는 과정, IAM 설정 등
- `cdk deploy` - 실제 리소스 배포
- `cdk diff` - 로컬 CDK와 배포된 스택 비교
- `cdk destroy` - 스택 제거

### Construct & Layer
CDK는 Construct라는 구성단위로 이루어져 있습니다. 리소스 생성의 코드 블록으로 객체 지향 개념의 클래스와 유사하게 리소스 상/하위 관계를 설정합니다. 추가로 [Construct Hub](https://constructs.dev/)에서 더 다양한 라이브러리들을 찾아볼 수 있습니다.  
Layer는 코드 재사용을 위한 추상화 컴포넌트로 모듈화된 방식으로 리소스 정의를 가능하게 합니다. 이하 `commonLambdaLayer`라는 Layer가 사용되어 Lambda 함수에 Layer 적용된 것을 볼 수 있습니다.
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

class MyLayeredLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 공통 Lambda 설정을 Layer로 묶기
    const commonLambdaLayer = new lambda.LayerVersion(this, 'CommonLayer', {
      code: lambda.Code.fromAsset('lambda-layer'), // lambda-layer 폴더에서 코드 가져오기
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
    });

    // Lambda 함수에 Layer 적용
    const myLambda = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      layers: [commonLambdaLayer], // 공통 Layer 추가
    });
  }
}
```

### Assertion Test
세분화된 리소스 테스트를 통해 특정 값이 있는지를 확인하는 방법을 제공합니다. 
- 추가 [테스팅](https://docs.aws.amazon.com/ko_kr/cdk/v2/guide/testing.html) 방법

```typescript
    // Assert it creates the function with the correct properties...
    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "handler",
      Runtime: "nodejs14.x",
    });

    // Creates the subscription...
    template.resourceCountIs("AWS::SNS::Subscription", 1);
```

---

## Cognito
사용자에게 ID를 줘서 앱 유저에게 로그인 기능을 제공하는 User Pool(CUP)과 AWS Credential을 제공해서 AWS 리소스에 바로 접근하게 하는 Identity Pool 기능이 있습니다. IAM과 달리 AWS 밖의 사용자를 위한 인증입니다.
![](https://docs.aws.amazon.com/ko_kr/cognito/latest/developerguide/images/scenario-identity-pool.png)

### Cognito User Pool(CUP) - authentication
애플리케이션을 접근을 위해 serverless 데이터베이스를 만들어서 인증을 해주는 기능입니다. 간단하게 username, password로 로그인하거나 email, phone 인증, MFA, JWT 등을 이용한 인증들을 제공합니다. Cognito를 이용해서 토큰을 받아 API Gateway 요청을 하거나 단순히 ALB로 요청을 보내면 Cognito에서 인증을 하는 방법 등 다양한 통합기능을 제공합니다.
- Lambda Triggers

### Cognito Identity Pool(CIP) - authorization
사용자에 대한 임시자격(권한)을 제공해줍니다. Identity Pool에는 Public Provider와 CUP, OpenID와 SAML Identity Pool을 포함합니다. 임시 자격을 받은 사용자는 AWS 리소스에 직접 접근하거나 API Gateway를 사용한 요청이 가능합니다.

---

## Other Serverless Services

### Step Function
서버리스 워크플로우 서비스로, 여러 AWS 서비스들을 연결하여 자동화된 프로세스를 정의하고 실행할 수 있게 해줍니다. State Machine(aka. 워크플로우)에서 Task State에 따라 Lambda, DynamoDB, SNS 또는 다른 Workflow 실행을 진행합니다. 각 블록에 대응되는 

![](https://docs.aws.amazon.com/ko_kr/step-functions/latest/dg/images/step-functions-example.png)

#### States
- Choice State
- Fail or Succeed State
- Pass State
- Wait State
- Map State
- Parallel State - 병렬 실행을 위한 상태

```json
{  
   "StartAt":"CallLambda",
   "States":{  
      "CallLambda":{  
         "Type":"Task",
         "Resource":"arn:aws:states:::lambda:invoke",
         "Parameters":{  
            "FunctionName":"arn:aws:lambda:us-east-1:123456789012:function:MyFunction"
         },
         "End":true
      }
   }
}
```

#### Standard vs Express
기본적으로 Standard Step Function은 최대 1년 동안 가능하며, 최대 5분 워크플로우를 갖는 Express Step Function을 적용하는 경우 빠른 응답이 필요한 동기적 실행과 메시징과 같은 비동기적 워크플로우가 있습니다. Express보다 Standard Workflow가 더 비싸며, 복잡하고 긴 실행 시간이 필요한 워크플로우에 적합합니다.

### AppSync
GraphQL 기반의 API 서비스로, 클라이언트 애플리케이션에 실시간 데이터 및 오프라인 데이터를 제공하는 관리형 서비스를 제공합니다. 여러 리소스의 데이터를 쉽게 통합하고 제공하며 GraphQL을 통해 REST API와 달리 클라이언트 요청에 따른 데이터 형태와 양을 지정할 수 있습니다. Pub/Sub API로 서버리스 WebSocket을 지원합니다. DynamoDB로 AppSync를 백업할 수 있습니다.
```
query listTodos {
  getTodo(id: "") {
    description
    id
    name
    when
    where
  }
```

### Amplify
모바일과 웹 애플리케이션을 빠르고 쉽게 개발하고 배포할 수 있게 도와주는 서버리스 플랫폼입니다. 프론트엔드 개발, 백엔드 서비스, 호스팅 등 다양한 기능을 제공합니다. 모바일과 웹 앱을 위한 Elastic Beanstalk이라고 할 수 있습니다.  

amplify.yml 파일을 이용해서 Cypress 테스트 프레임워크를 통합해서 사용할 수 있습니다. Cypress 테스트를 이용해서 UI test 리포트를 받을 수 있습니다. 

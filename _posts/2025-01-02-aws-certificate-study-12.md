---
title: 12부. 한 번에 알아보는 AWS - SAM, CDK, Cognito, Other Serverless Services
author: ilpyo
date: 2025-01-02 00:00:00 +0900
categories: [Cloud, AWS]
tags: [AWS, 스터디, AWS Certified Developer Associate, 자격증]
pin: false
math: true
mermaid: true
---

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

### SAM CLI Commands
```
aws cloudformation package --s3-bucker {bucket-name} --template-file {template.yaml} --out-template-file {template-generated.yaml}
aws cloudformation deploy --template-file {template.yaml} --stack-name {stack-name} --capablities CAPABILITY_IAM
```
- [SAM CLI](https://docs.aws.amazon.com/ko_kr/serverless-application-model/latest/developerguide/install-sam-cli.html) 설치
- [AWS SAM CLI 명령 참조](https://docs.aws.amazon.com/ko_kr/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

---

## CDK

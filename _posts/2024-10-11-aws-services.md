--- 
title: AWS 서비스 분류와 Lambda
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS]
pin: false
math: true
mermaid: true
--- 

### AWS 서비스 분류
- 컴퓨팅 서비스
  - EC2, Auto Scaling, Lambda, Lightsail, WorkSpaces, ECS, EB  

- 네트워킹 서비스 
  - VPC, Route53, Direct Connect, ELB, CloudFront, Transit Gateway  

- 스토리지 서비스 
  - S3, EBS, Glacier, Storage Gateway, Snowball  

- 데이터베이스 서비스 
  - RDS, DynamoDB, ElastiCache, DocumentDB

- 관리 툴- 
  - CloudWatch, CloudFormation

- 분석 플랫폼- 
  - Kinesis, Redshift, EMR

- 애플리케이션 서비스 
  - CloudSearch, SES, Elastic Transcoder

### AWS Lambda
AWS Lambda를 사용하면 서버를 프로비저닝하거나 관리할 필요 없이 코드를 실행할 수 있는 서버리스 컴퓨팅 시스템입니다.  
<span style="background-color:#DCFFE4">AWS Lambda는 코틀린도 지원하는가?</span>  
지원으로 명시하지 않지만 사용할 수 있습니다. AWS Lambda는 기본적으로 Java, Go, PowerShell, Node.js, C#, Python 및 Ruby 코드를 지원한다고 명시되어 있습니다. Lambda는 ```kotlinx.serialization``` 라이브러리를 지원하지 않기 때문에 Kotlin 데이터 클래스로 JSON 객체의 직렬화하는 것을 지원하지 않습니다. 하지만, Java 라이브러리인 ```Jackson```, ```Gson```과 같은 라이브러리는 제공하기 때문에 이 라이브러리를 사용해서 역직렬화를 진행할 수 있습니다.
```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

@Serializable
data class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 30)
    val jsonString = Json.encodeToString(person)
    println(jsonString) // 출력: {"name":"Alice","age":30}

    val json = Json { ignoreUnknownKeys = true }
    val personObj = json.decodeFromString<Person>(jsonString)
    println(personObj) // 출력: Person(name=Alice, age=30)
}
```

<hr/>

[AWS Lambda FAQ](https://aws.amazon.com/ko/lambda/faqs/) 

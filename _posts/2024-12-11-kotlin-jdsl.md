---
title: 라인이 개발한 Kotlin JDSL에 대해서
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Kotlin]
tags: [Kotlin JDSL]
pin: false
math: true
mermaid: true
---

이번 프로젝트를 하면서 Querydsl을 벗어나 Kotlin JDSL을 적용했습니다. Spring 프레임워크를 사용하는 사람들은 대부분 Querydsl을 사용해 본 경험이 있을겁니다. 개인적으로 Querydsl로 Native Query를 간편하게 사용할 수 있다는 점이 좋았지만, Kotlin에 더 적합하고 불필요한 Q클래스의 생성이 없어도 되기 때문입니다.
물론 아직 개발 중이라서 적용이 안 되는 기능도 있고 깃헙 오픈소스에서도 볼 수 있듯이 이슈들도 있지만 제가 사용할 기능 범위 내에서는 불편없이 적용할 수 있었습니다. 

### Kotlin JDSL
라인에서 개발한 오픈소스로 생성된 메타모델 없이 쿼리를 쉽게 구축할 수 있도록 합니다. KClass와 KProperty를 기반으로 한 도메인 특화 언어(DSL)를 제공하여, 이러한 불편함 없이 쉽게 쿼리를 작성할 수 있도록 돕습니다.  
다음은 Kotlin JDSL를 활용한 기본 사례입니다. 쿼리를 쉽게 구분해서 볼 수 있어 한 눈에 들어온다는 장점이 있습니다.
```kotlin
fun findByMemberUuid(memberUuid: UUID): List<String?> {
    return collectRepository.findAll {
        select(
            path(Collect::type)
        ).from(
            entity(Collect::class)
        ).whereAnd(
            path(Collect::memberUuid).eq(memberUuid),
            path(Collect::deletedDate).isNull()
        ).groupBy(
            path(Collect::type)
        )
    }
}
```

jOOQ와 QueryDSL과 달리 메타모델을 요구하지 않으면서 KProperty를 사용해 타입 안전성을 제공합니다. 리플렉션 시에는 KProperty의 이름만을 사용하며, Kotlin이 Java로 컴파일할 때 이 이름을 상수로 등록하기 때문에 성능 저하가 없다고 합니다.

---
- [kotlin-jdsl](https://github.com/line/kotlin-jdsl)
- [Querydsl에서 Kotlin JDSL 으로](https://spoqa.github.io/2024/05/03/transfer-jdsl.html)
- [JPQL with Kotlin JDSL](https://kotlin-jdsl.gitbook.io/docs/jpql-with-kotlin-jdsl)

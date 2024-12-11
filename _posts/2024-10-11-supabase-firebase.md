---
title: Supabase와 Firebase 비교
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Database]
tags: [Supabase, Firebase]
pin: false
math: true
mermaid: true
---

플러터 프로젝트에서 백엔드를 위한 서버를 두고 있지 않다면, 흔히 대안으로 Firebase와 Supabase를 고려해볼 수 있습니다. Firebase는 NoSQL 데이터베이스, 사용자 인증, 실시간 업데이트, 파일 저장 등의 기능을 제공하고, 반면 Supabase는 Postgres 데이터베이스(더 SQL 친화적인 환경), GoTrue를 통한 인증, 실시간 기능 및 스토리지 솔루션을 포함한 도구 모음을 제공합니다. 각 데이터베이스 사용시의 사용자 환경은 두 개가 비슷한 구조로 되어 있는 것을 볼 수 있고 관리 또한 유사한 느낌을 받을 수 있습니다.  
Supabase는 오픈소스로 폐쇄적인 Firebase와 달리 확장성을 가지고 있고, 직접 호스팅도 할 수 있다는 점에서 큰 메리트가 있습니다.

### Supabase vs Firebase 적용사례 비교

### Supabase
```javascript
// 회원가입
async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  console.log(user, error);
}
```

### Firebase
```javascript
// 회원가입
async function signUp(email, password) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    console.error(error);
  }
}
```

### 인증 차이
Supabase는 GoTrue를 통한 인증이란 사용자를 관리하고 SWT 토큰을 발행하기 위한 SWT 기반 API를 이용한 인증을 말합니다. Supabase는 Go로 작성된 GoTrue를 사용하는 반면 Firebase Auth는 독점 Google 솔루션입니다.
```javascript
await supabase.auth.signInWithOAuth({provider: 'kakao'})
```

### 비용 비교
<img src="/assets/post_images/flutter/pricing_comparison.png">
Firebase는 쿼리당 개념으로 비용이 부과되며, 월별 구독료를 납부하는 방식인데, 소규모 프로젝트에서는 무료의 Supabase를 사용해도 될 정도의 기능을 제공합니다. Supabase에서 하나 윗 단계($25/month) 구독에서는 무료에서 제공하지 않는 데이터 백업과 7days log retention을 지원합니다.
간단한 개인 프로젝트 규모에서는 Supabase를 사용해도 되겠지만 출시 후 성장세에 따른 데이터베이스 서버를 염두해 두거나 유료의 호스팅을 고려하면 Firebase 지원으로 생각해봐야할 것 같습니다.

### 그럼 언제 어떤 걸 사용하는게 좋을까?
Firebase는 비용과 예산에서 조금 더 유리한 측면이 있고 사용자 수에 제한을 두지 않는 매월 10,000명 이상의 사용자를 예상하는 경우에 좋습니다. 반면, Supabase는 RDB 스타일의 데이터를 관리해야 하는 경우에 유용합니다. GoTrue를 이용한 간단한 인증 체계도 필요합니다.

---

[Supabase README](https://github.com/supabase/supabase/blob/master/i18n/README.ko.md)  
[Supabase vs Firebase Comparison](https://www.restack.io/docs/supabase-knowledge-supabase-vs-firebase-comparison)
[What is Supabase](https://psvm.kr/posts/tutorials/supabase/what-is-supabase)
[Supabase and Firebase pricing comparison](https://dev.to/dshukertjr/supabase-and-firebase-pricing-comparison-204f)

  

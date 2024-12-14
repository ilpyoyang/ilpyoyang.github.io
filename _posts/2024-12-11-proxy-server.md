---
title: Proxy Server
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [DevOps]
tags: [Github Action]
pin: false
math: true
mermaid: true
---

프록시라는 단어는 '대리하여 무엇인가를 하는 것'을 의미합니다. 즉, 프록시 서버는 자신을 통해 다른 네트워크 서비스에 간접적으로 접속할 수 있게 해주는 컴퓨터 시스템이나 응용 프로그램을 말합니다. 프록시 서버를 통해 client가 직접적으로 인터넷 리소스에 접근하는 것을 방지할 수 있습니다. 또한 다른 서버에서 client의 IP를 식별하는 것을 방지합니다.  
프록시 서버를 이용하므로 얻는 이점이 여러 가지가 있습니다. <span style="background-color:#fff5b1">일부 캐시를 저장해두어 원격 서버에 접속할 필요가 없기 때문에 전송시간을 절약할 수 있습니다.(Web Caches)</span> 만약 client가 요청한 내용의 cache file이 프록시 서버에 없다면 origin server의 데이터를 받아옵니다. 따라서 request 분산효과가 생기기 때문에 traffic이 감소합니다. 그리고 <span style="background-color:#fff5b1">외부와의 트래픽을 줄이므로 네트워크 병목현상을 방지할 수 있습니다.</span> 또한 보안과 필터링 기능을 제공합니다.   
무료 프록시 서버는 성능이슈와 보안상의 이슈가 있을 수 있어 사용에 주의해야 합니다. 그리고 암호화가 어디까지 진행되는지도 확인해 Full Encryption이 가능하게 해야 합니다. 프록시 서버는 original IP와 request 정보를 암호하지 않은 형식으로 저장하기 때문에 로그와 저장된 데이터를 확인할 필요가 있습니다.

<span style="background-color:#DCFFE4">그럼 프록시 서버와 로드밸런싱의 차이는 무엇일까?</span>  
둘 다 네트워크와 서버를 관리하는 도구입니다. 로드밸런서는 서버의 부하를 분산시켜 성능향상에 초점을 두고 있는 반면, 프록시 서버는 보안성을 높이는데 초점을 두고 있습니다. <span style="background-color:#fff5b1">AWS ELB</span>의 경우 기본적으로 로드밸런서 역할을 수행하며, HTTP/HTTPS 요청의 전달 및 분산, 자동 확장 등의 기능을 제공합니다. 따라서 경우에 따라서는 ELB가 두 가지 기능을 모두 수행하기 때문에 별도의 프록시 서버를 구축하지 않아도 됩니다. 하지만 특정 보안 요구사항이 있는 경우 직접 프록시 서버를 배포하는 것이 적절할 수도 있습니다.

다음은 대표적인 프록시 서버의 종류에 대한 설명입니다.

**Forward Proxy**  
클라이언트가 인터넷에 직접 접근하는게 아니라 포워드 프록시 서버가 요청을 받고 인터넷에 연결하여 결과를 클라이언트에 전달해줍니다.

**Reverse Proxy**  
클라이언트가 인터넷에 직접 접근하는게 아니라 포워드 프록시 서버가 요청을 받고 인터넷에 연결하여 결과를 클라이언트에 전달해줍니다.

<hr/>

[What is Proxy Server?](https://www.geeksforgeeks.org/what-is-proxy-server/)

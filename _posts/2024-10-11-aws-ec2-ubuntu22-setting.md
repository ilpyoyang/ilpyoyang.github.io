---
title: AWS EC2 Ubuntu22.04LTS tomcat10 세팅하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS]
pin: false
math: true
mermaid: true
---

사전미션을 하게 되어 오랫만에 EC2 환경 구축을 하게 되었는데 버전 변경으로 인한 차이가 발생해서 이번에 알게 된 내용을 정리했습니다.  
아래 버전을 사용하는 경우, 이전 제 블로그에 [Ubuntu 20.x tomcat9 구축](https://ilpyoyang.tistory.com/145) 내용을 참고해주세요.  

<br>

**설치과정**  
톰캣 구동전에 필요한 JDK 파일을 설치해 주어야 합니다. 참고로 저는 이번 프로젝트에서 JDK 17을 사용했습니다.  
"tomcat"이라는 이름의 사용자를 ```/opt/tomcat``` 경로에 홈 디렉토리를 생성하며, 로그인 쉘이 비활성화된 상태로 추가합니다. 이러한 설정은 보안 상의 이유로 "tomcat" 사용자가 일반적인 시스템 로그인을 하지 못하게 하면서 특정 작업에만 제한된 권한으로 사용할 수 있도록 하는 데 사용됩니다. 
일반적으로 Tomcat과 같은 웹 서버 또는 어플리케이션 서버의 실행을 위해 특정 사용자와 그룹을 생성하는 데 자주 사용됩니다.
```
sudo useradd -m -U -d /opt/tomcat -s /bin/false tomcat
```
원하는 아파치 톰캣 버전을 확인하고 설치합니다.
```
VERSION=10.1.11
wget https://www-eu.apache.org/dist/tomcat/tomcat-10/v${VERSION}/bin/apache-tomcat-${VERSION}.tar.gz -P /tmp
sudo tar -xf /tmp/apache-tomcat-${VERSION}.tar.gz -C /opt/tomcat/
```
```/opt/tomcat``` 디렉토리가 없는 경우는 미리 생성하고 압축을 풀어줍니다.
```
sudo mkdir -p /opt/tomcat
```
```/opt/tomcat/latest``` 경로에 ```apache-tomcat-${VERSION}```라는 심볼릭 링크를 생성합니다. 이렇게 심볼릭 링크를 사용하면 Tomcat이나 다른 프로그램의 버전을 업데이트할 때 새로운 버전을 /opt/tomcat/latest에 링크로 연결하여 기존에 사용 중이던 스크립트나 설정 등이 새로운 버전을 가리키도록 할 수 있습니다.
```
sudo ln -s /opt/tomcat/apache-tomcat-${VERSION} /opt/tomcat/latest
```
해당 경로의 접근, 파일 수정 등을 용이하게 하기 위해 소유권과 권한을 설정합니다.
```
sudo chown -R tomcat: /opt/tomcat
sudo sh -c 'chomd +x /opt/tomcat/latest/bin/*.sh' 
```
```tomcat.service``` 파일을 생성해 시스템이 부팅될 때 자동으로 시작되고 관리할 수 있도록 데몬으로 실행하게 설정합니다.
```
sudo nano /etc/systemd/system/tomcat.service
```
설정 파일 안에 내용은 다음과 같습니다.
```
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
Environment="JAVA_OPTS=-Djava.security.egd=file:///dev/urandom -Djava.awt.he>

Environment="CATALINA_BASE=/opt/tomcat/latest"
Environment="CATALINA_HOME=/opt/tomcat/latest"
Environment="CATALINA_PID=/opt/tomcat/latest/temp/tomcat.pid"
Environment="CATALINA_OPTS="-Xms512M -Xmx1024M -server -XX:+UserParallelGC"

ExecStart=/opt/tomcat/latest/bin/startup.sh
ExecStop=/opt/tomcat/latest/bin/shutdown.sh

[Install]
WantedBy=multi-user.target
```
service 파일을 추가했으므로 ```daemon-reload```해 변경 내용을 감지하도록 합니다.
```
sudo systemctl daemon-reload
```
이제 ```systemctl``` 명령어로 톰캣을 구동합니다. ```status```로 tomcat의 상태를 확인할 수 있습니다. 
```
sudo systemctl enable --now tomcat
sudo systemctl status tomcat
```

![20230805_213359.png](/assets/post_images/aws/20230805_213359.png)

tomcat이 제대로 구동하지 않는 경우에는 log 디렉토리에 ```catalina.out```을 확인해 설정사항에 문제가 있는지 확인할 수 있습니다. 저의 경우에는 ```tomcat.service``` 상에 입력사항이 잘못되어 톰캣이 제대로 동작하지 않았었습니다.
```
sudo vi /opt/tomcat/latest/log/catalina.out
```

<br>

**톰캣 구동장면**  
완료하면 다음과 같이 ```퍼블릭IP 주소:8080```으로 제대로 구동되는 모습을 확인할 수 있습니다.  

![20230805_211921.png](/assets/post_images/aws/20230805_211921.png)

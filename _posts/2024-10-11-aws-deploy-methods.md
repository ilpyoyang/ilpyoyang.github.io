---
title: AWS 다양한 배포 방법들
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Cloud, AWS]
tags: [AWS]
pin: false
math: true
mermaid: true
---

### 1. Github Action을 사용하는 무중단 배포  
수동 배포 말고 자동 빌드를 위한 Github Action과 CI, CD가 가능하도록 배포를 진행했습니다.  
<span style="background-color:#DCFFE4">CI & CD란?</span>  
CI/CD는 개발자들이 애플리케이션을 더욱 빠르게 개발하고 배포할 수 있도록 지원하는 방식입니다. CI는 코드 변경 사항을 지속적으로 통합하고 빌드하며, CD는 지속적으로 배포합니다. 이를 통해 개발자는 더욱 빠른 피드백을 받고, 애플리케이션의 품질을 유지 및 개선할 수 있습니다.  

<br>

![Group 50.png](/assets/post_images/aws/Group%2050.png)

<br>

#### Github Action 설정 
자동 빌드를 위한 Github Action을 CI/CD 툴로 설정했습니다. 이미 버전관리가 Github으로 되어 있고, Travis는 일부 유료버전으로 변경되면서 접근이 안되는 부분이 있었기 때문입니다.  
Actions 탭에서 구동을 위한 ```.yml```을 작성하면 ```.github/workflows``` 위치에 파일이 생성됩니다. 그리고 빌드가 성공적으로 되는지까지 확인합니다.  
현재는 ```--exclude-task test```로 테스트 실패시에도 빌드가 가능하게 해놓은 상태입니다.
```yml
name: BoardApi CI/CD 

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
    - name: Build with Gradle
      run : ./gradlew clean build --exclude-task test
```
그리고 AWS 사용을 위해 AWS ACCESS KEY ID, SECRET KEY를 해당 레포 설정 ```Actions secrets and variables```에 등록합니다.  

<span style="background-color:#DCFFE4">Jenkins, Travis와의 차이점</span>  
+ #### GitHub Actions#### 는 GitHub와 함께 제공되는 내장형 CI/CD 도구입니다. 설정과 사용이 쉽고, 다양한 GitHub 기능과 통합이 가능합니다. 작은 규모에서 중간 규모의 GitHub 프로젝트에 가장 적합합니다.
+ #### Jenkins#### 는 많은 해가 지난 인기 있는 오픈소스 CI/CD 도구입니다. 매우 유연하며 다양한 프로그래밍 언어와 도구와 함께 사용할 수 있습니다. 많은 맞춤 설정이 필요한 대규모, 복잡한 프로젝트에 가장 적합합니다.
+ #### Travis CI#### 는 GitHub 프로젝트에 특화된 클라우드 기반 CI/CD 도구입니다. 설정과 사용이 쉽고, 다양한 GitHub 기능과 통합이 가능합니다. 작은 규모에서 중간 규모의 GitHub 프로젝트에 가장 적합합니다.

<br>

#### S3 생성하기 
필요한 리전을 선택하고 버전 관리는 필요하지 않기 때문에 사용하지 않았습니다. 그리고 접근 가능한 IAM 사용자를 사용하기 때문에 모든 퍼블릭 액세스 차단을 선택해줍니다.  

<br>

#### EC2 환경설정 
EC2 기본 환경설정을 진행합니다. 제가 만든 인스턴스의 사양은 <span style="background-color:#fff5b1">Ubuntu 22.04 LTS, t2.micro(프리티어), 30GiB 스토리지</span>로 설정했습니다.  
보안에는 S3, Codedeploy에 full access가 가능하도록 만든 IAM 역할을 부여합니다.  
EC2 콘솔에서 JDK와 [Amazon correto](https://docs.aws.amazon.com/corretto/latest/corretto-17-ug/downloads-list.html)를 프로젝트 JDK와 일치하는 것으로 설치합니다. 
```
$ sudo apt update
$ sudo apt-get install openjdk-17-jdk
$ sudo wget https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.tar.gz
```
```/etc/profile``` 가장 마지막 줄에 환경변수를 설정합니다.
```
$ sudo nano /etc/profile
$ export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
$ export PATH=$JAVA_HOME/bin/:$PATH
$ export CLASS_PATH=$JAVA_HOME/lib:$CLASS_PATH
$ sudo reboot now
```
[Ubuntu Server용 CodeDeploy 에이전트 설치](https://docs.aws.amazon.com/ko_kr/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html) 가이드를 보고 에이전트를 설치합니다. 
status가 active라면 성공!
```
$ sudo apt install ruby
$ cd /home/ubuntu
$ wget https://aws-codedeploy-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/latest/install
$ chmod +x ./install
$ sudo ./install auto
$ sudo service codedeploy-agent status
```

#### Github Action 설정변경 
앞에서 만들어준 .yml 파일에 ```env```와 ```jobs``` 내역을 수정합니다. push 후 진행되는 순서는 다음과 같습니다.
1. Set up JDK 17
2. Grant execute permission for gradlew
3. Build with Gradle
4. Make Zip File
5. Configure AWS credentials
6. Upload to S3
7. Code Deploy
로직의 각 부분은 [cicd 오픈소스](https://github.com/kbsat/cicdproject)를 참고해서 만들었습니다.  

<br>

#### appspec.yml 파일 작성 
CodeDeploy 동작을 위해 ```appspec.yml``` 파일 작성합니다. CodeDeploy agent가 다운로드 코드를 어디 경로에서 다운받을지, EC2 서버 어디에 코드를 저장할지 등을 정합니다.  
```afterinstall```는 배포 스크립트에서 설치 프로세스가 완료된 후 실행되어야 하는 명령 또는 스크립트 목록을 포함하는 섹션입니다. 예시에서 afterinstall 섹션에는 AfterInstall이라는 이름의 훅이 포함되어 있습니다. 이 훅은 scripts/deploy.sh 쉘 스크립트의 위치를 지정하며, 60초의 타임아웃으로 실행되며 ubuntu 사용자로 실행됩니다.  
```yml
version: 0.0
os: ubuntu

files:
  - source: /
    destination: /home/ubuntu/boardApi
permissions:
  - object: /home/ubuntu/boardApi/
    owner: ubuntu
    group: ubuntu
hooks:
  AfterInstall:
    - location: scripts/deploy.sh
      timeout: 60
      runas: ubuntu
```

<br>

#### 배포용 shell 스크립트 
빌드된 jar 파일을 실행시키고 이미 실행되어 있다면 새로 빌드된 jar파일로 실행되도록 설정해줍니다.  
```
#!/usr/bin/env bash

REPOSITORY=/home/ubuntu/boardApi
cd $REPOSITORY

APP_NAME=boardApi
JAR_NAME=$(ls $REPOSITORY/build/libs/ | grep 'SNAPSHOT.jar' | tail -n 1)
JAR_PATH=$REPOSITORY/build/libs/$JAR_NAME

CURRENT_PID=$(pgrep -f $APP_NAME)

if [ -z $CURRENT_PID ]
then
  echo "> 종료할것 없음."
else
  echo "> kill -9 $CURRENT_PID"
  kill -15 $CURRENT_PID
  sleep 5
fi

echo "> $JAR_PATH 배포"
nohup java -jar $JAR_PATH > /dev/null 2> /dev/null < /dev/null &
```
```nohup java -jar $JAR_PATH > /dev/null 2> /dev/null < /dev/null &``` 부분은 무중단으로 실행하고자 할 때 ```nohup```을 적용하는 부분이라 git clone으로 .jar 파일 배포 방식(이하 포스팅 됨)과 유사한 것을 볼 수 있었습니다.  

<br>

### 2. Git clone을 이용한 수동배포
Github에서 직접 소스를 내려받아 EC2에서 실행하는 방법입니다. 별도 프로그램을 사용하지 않고 AWS 인스턴스로 쉽게 연동할 수 있다는 장점이 있습니다.  
EC2 인스턴스에서 소스코드가 있는 Github과 연결하기 위해서는 ssh 키를 만들어 퍼블릭 키를 github에 등록해줘야 합니다.  
```
ssh-keygen -t rsa -C github계정 메일(example@github.com)
```
다음 명령어를 통해 얻은 키를 Github 설정의 ```SSH and GPG keys```에 등록해줍니다.  
```
cat /home/ubuntu/.ssh/id_rsa
```
이제 레포의 SSH 주소를 복사해서 clone을 진행합니다. 
```
git clone {SSH 주소}(git@github.com:프로젝트명.git)
```
소스 파일이 받아지면 프로젝트 안에서 gradlew build를 진행할 수 있습니다.
```
cd 프로젝트/build/libs
chmod +x gradlew
``` 
```nohup```으로 무중단 배포를 진행합니다. 이 때 배포과정에 문제가 있다면 .jar 파일과 같은 디렉토리에서 ```nohup.out``` 파일에서 에러를 확인할 수 있습니다.  
```


```

이 경우 프리티어에서 메모리 용량 부족으로 ```gradlew build```하면 무한로딩에 빠지는 이슈가 발생했습니다. [Swap 메모리 사용](https://sundries-in-myidea.tistory.com/102)해서 해결했지만 소스코드 변경시마다 수동 배포를 해야 하기 때문에 번거로운 방법이었습니다.  

<span style="background-color:#DCFFE4">Swap 메모리란?</span>  
RAM의 메모리가 부족하므로, 리눅스의 HDD 공간을 RAM처럼 사용하는 것을 말하면, 이를 통해 부족한 RAM을 증설한 것처럼 사용할 수 있습니다.

<br>

### 3. Filezila를 이용한 war 파일 수동배포  
Filezila의 설정 ```SFTP```에서 private key를 설정해서 배포서버에 접근할 수 있습니다. 아래 포스팅한 tomcat 이하 webapps에 war 파일을 이동시키면, 자동으로 war 파일명의 디렉토리 파일이 생성됩니다.  

777은 소유자, 그룹, 그리고 다른 사용자 모두가 읽기, 쓰기, 실행 권한을 가진다는 것을 의미합니다. 따라서 이런 설정은 보안상 취약합니다. 이하 tomcat10 세팅과정에서 톰캣 사용자에게 권한을 주었지만 파일질라에서 파일 전송시에는 권한을 더 넓게 주는 것이 필요해서 ```777``` 임시 설정을 두었습니다.
```
sudo chmod -R 777 /opt/tomcat/apache-tomcat-10.1.11/webapps
```
디렉토리와 그 하위 디렉토리, 파일의 모든 소유자를 tomcat 사용자로, 그룹을 tomcat 그룹으로 변경합니다. 이렇게 함으로써 해당 디렉토리와 파일들은 tomcat 사용자와 그룹에 속하게 됩니다.
```
sudo chown -R tomcat:tomcat /opt/tomcat/apache-tomcat-10.1.11/webapps
```

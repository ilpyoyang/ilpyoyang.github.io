---
title: Jekyll GitHub 블로그 로컬에서 관리하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Git]
tags: [git]
pin: false
math: true
mermaid: true
---

```깃헙계정 아이디```.github.io 로 된 repo를 생성합니다.   
jekyll에서 맘에 드는 테마를 가지고 오면 되는데 이 블로그에 사용된 테마는 [gitbook 테마](http://jekyllthemes.org/themes/)입니다. 깃북으로 만들어도 되지만 더 마음대로 꾸밀 수 있고, 깃헙 파일구조도 깔끔하게 가지고 갈 수 있어서 jekyll 테마를 사용하게 되었습니다.  
설치될 OS에 적합한 <span style="background-color:#fff5b1">Ruby</span>를 설치하고 <span style="background-color:#fff5b1">Jekyll+Devkit</span> 설치를 진행합니다.    
Ruby가 설치되면 아래 명령어로 Ruby cmd에서 Jekyll과 Bundler를 설치합니다.
```
gem install bundler jekyll 
```
이후 블로그 디렉토리로 이동해서 <span style="background-color:#fff5b1">Gemfile을 수정</span>해 필요한 플러그인이 설치될 수 있도록 합니다. 실제로 작성되어 있던 파일들 중에서 주석을 제거하고 버전을 맞춰주었는데 현재 이 블로그에 적용된 설정은 다음과 같습니다.
```
source "https://rubygems.org"
gem "minima", "~> 2.5"
gem 'jekyll-include-cache'
gem "webrick", "~> 1.7"
gem "github-pages", group: :jekyll_plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
```
로컬 확인을 위해 <span style="background-color:#fff5b1">_config.yml 파일</span>의 url 부분을 ```https://localhost:4000```을 수정하고 Ruby cmd에서 실행하면, 로컬에서 확인이 가능합니다.
```
bundle exec jekyll serve
```

##### 🚴🏽 FilePemissionError 발생시
Mac에서 다시 jekyll 세팅하는 과정에서 권한 오류가 발생했는데 root 권한으로 하지 않는 경우에 시스템 ruby에 대한 권한 문제로 발생한 에러압니다.
[Mac에서 Gem::FilePermissionError 에러 발생시 해결 방법](https://jojoldu.tistory.com/288)의 향로님 글을 보고 해결했는데, 그 중에서 rbenv path를 설정하는 부분만 여기서 살펴보려고 합니다.
```
[[ -d ~/.rbenv  ]] && \
  export PATH=${HOME}/.rbenv/bin:${PATH} && \
  eval "$(rbenv init -)"
```
이 스크립트를 추가하게 되면, Ruby의 환경관리도구인 rbenv를 초기화하고 환경변수를 설정하게 됩니다. 현재 홈 디렉토리 내에 `.rbenv` 디렉토리가 있는지 확인하고 있다면 환경변수에 추가해 rbenv 실행 파일들이 환경변수에 포함되어 명령어를 실행할 때 찾게 합니다.








---
title: 푸쉬한 내 커밋 메시지 수정하기
author: ilpyo
date: 2024-10-11 11:33:00 +0900
categories: [Git]
tags: [git]
pin: false
math: true
mermaid: true
---

아찔한 잘못된 깃헙 실수를 발견할 때가 있습니다. 이를 다시 수정하기 위한 각각 상황별 방법을 기록해보고자 합니다.

<img src="/assets/post_images/git/git_meme.jpg">

IntelliJ에서 취소를 했는데도 잘못된 깃헙 메시지가 푸쉬서 올라가는 경우가 있습니다. 이 경우 아래 방법들로 해결할 수 있습니다. 하지만 협업하는 팀 프로젝트에서는 각 커밋들이 강제로 push된다고 했을 때
다른 브런치와의 충돌이 있을 수 있기 때문에 한 브런치에서 작업한 작업물에 대한 commit 내역을 수정하는 경우에 권장됩니다. 그래서 ```feature```를 따로 작게 분류하거나 ```fork```하는 것이 좋습니다. 
~~엮이지 말자..~~

### IntelliJ에서 수정하기
간단하게 Git Log (```Alt+F9```)를 확인하고 해당 commit 내역을 ```Shift+F6``` 로 메시지 수정이 가능합니다. 
이 경우 그 commit을 기준으로 이후의 커밋들이 다시 쓰여지기 때문에 모두 ```Force Push``` 처리로 적용이 가능합니다.

### Git Bash를 이용한 수정방법  
프로젝트 git 위치에서 수정할 커밋이 최근 커밋으로부터 몇 번째인지 확인하고 ```rebase```합니다. 
여기서 ```rebase```란, 기존 커밋 히스토리를 새로운 기준으로 재배치하는 기능입니다. 작업 중인 feature 브랜치에 다른 브랜치의 변경사항들을 반영시키기 위해서도 사용합니다.
이 이슈에서는 커밋 히스토리를 변경하기 위해 적용해보겠습니다.
```
git rebase HEAD~10 -i
```
이후에 편집모드를 사용해서 ```pick```을 ```reword``` 상태로 수정 후 커밋메시지를 수정합니다. 그리고 저장 후 강제 푸쉬를 하면 적용된 것을 확인할 수 있습니다.
```
git push --force
```

### 실제 적용화면
![rebase_commit.png](/assets/post_images/git/rebase_commit.png)







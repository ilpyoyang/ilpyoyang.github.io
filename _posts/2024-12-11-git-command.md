---
title: Git Command 정리
author: ilpyo
date: 2024-12-11 11:33:00 +0900
categories: [Git]
tags: [git]
pin: false
math: true
mermaid: true
---

### 기본 명령어
```git clone```, ```git commit``` 이런거 말고 자주 쓸지도 모르는 명령어들을 정리해봤습니다.
+ ```git reset [파일명]``` 파일 언스테이징
+ ```git stash``` 현재 변경사항 stash에 임시 저장하고 원래 커밋 상태로 되돌림
  + 여기서 stash에 저장된 내역은 ```git stash apply```로 최신 저장된 것을 적용할 수 있습니다. 특정 인덱스 적용시에는 ```git stash apply stash@{N}```을 사용하면 됩니다.
  + ```git stash pop```으로 최근 것 적용후 그 스태시를 목록에서 제거할 수도 있습니다.
  + 그 외에도 ```drop```, ```list``` 기능들이 있습니다.
+ ```git remote show [원격 저장소]``` 특정 원격 저장소에 대한 자세한 정보를 확인
+ ```git bisect``` 이진 검색으로 버그가 발생한 특정 커밋 찾기
+ ```git reset --hard [커밋]``` 특정 커밋으로 (강제) 돌아감
+ ```git cherry-pick [커밋1] [커밋2]``` 다른 브랜치 커밋을 현재 브랜치로 가지고 오기
  + 브랜치명을 이용해서 가지고 올 수도 있습니다.
+ ```git clean -n``` 추적되지 않은 파일 확인
+ ```git switch -c``` 브랜치 생성과 이동


### 헷갈리는 Reset, Revert, Rebase, Undo 정리하기  
git log 관리할 때마다 쓰는데 헷갈린 적 있었던 관련 명령어를 이번 기회에 ~~명절이니까 머리가 여유롭기 때문에~~ 정리했습니다.  
한 줄로 정리하면, <span style="background-color:#fff5b1">이전꺼 지울려면 Reset, 이것만 정리할라면 Revert, 브랜치 기준으로 정리하려면 Rebase, 히스토리 변경없이 상태만 바로 이전으로 변경하고 싶으면 Undo를 사용하면 됩니다.</span>

#### Reset 
이전 커밋들을 취소하거나 삭제하는 등 특정 커밋으로 돌아가기 위한 명령어로 옵션에 따라 작업내용을 유지할지 여부를 정할 수 있습니다.
+ 옵션은 soft, mixed(defalut), hard가 있는데 모든 변경사항을 특정 시점 기준으로 확인하고 스테이징을 유지하기 위해 주로 저는 soft를 이용합니다.

<img src="/assets/post_images/git/git-reset.png">

#### Revert 
특정 커밋 사항을 취소하고 새로운 커밋으로 기록하는 것으로 커밋 히스토리에 이전 커밋을 취소한 내용이 추가됩니다. 그 사이 커밋들은 유지되는 것을 볼 수 있습니다.
협업 중인 경우, 공유된 커밋으로 인한 충돌을 막기 위해서는 Revert를 사용하는 것이 좋습니다.

<img src="/assets/post_images/git/git-revert.png">

#### Rebase 
다른 브랜치를 기준으로 변경하거나 정리할 수 있도록 하는 명령어입니다. Rebase 역시 중간 커밋을 히스토리 없이 삭제가 ```pick```, ```drop```으로 가능합니다.
+ Interactive Rebase 종류는 ```git rebase -i```로 확인이 가능합니다.
+ ```Squash```: 여러 개의 연속적인 커밋을 하나의 커밋으로 합치는 경우에 사용됩니다. 반대로 되돌리려는 경우에는 ```git reset HEAD^ --hard```로 취소 후 다시 커밋처리 해주어야 합니다.
+ ```Fixup```: ```Squash```와 유사하지만 새로운 커밋 메시지를 지정할 수 없고 이전 커밋메시지를 사용합니다.
+ ```Reorder```: 커밋순서 변경
+ ```Exec```: 커밋 히스토리를 변경하는 것이 아니라 특정 커밋 사이에 특정 작업을 할 수 이게 합니다. 예를 들어 다음 명령과 같이 커밋 사이에 특정 스크립트를 실행하는 것을 일시적 목적으로 사용할 수 있게 합니다.
  ```
  pick c0ffee1 First commit
  exec ./myscript.sh
  pick 1a2b3c4 Second commit
  ```

<img src="/assets/post_images/git/git-rebase.png>

#### Undo 
작업 디렉토리와 스테이징 영역의 변경 사항을 이전 커밋 상태로 되돌리는 것을 말합니다. 커밋 히스토리에는 영향을 주지 않습니다.

```
git reset [커밋 해시] --hard
git revert [커밋 해시]
git rebase [다른 브랜치]
git rebase -i HEAD~[커밋 개수]
git restore --source=[커밋 해시] --worktree --staged --source=HEAD [파일명]
```

### 원본 저장소 최신 상태 로컬에 반영하기
오픈소스의 최신 커밋상태를 가지고 와서 기존 로컬 브런치 상태를 업데이트 하기 위해 사용합니다. 여기서 upstream은 내가 fork한 원격 브런치를 의미합니다. 반대로 fork를 해서 가지고 온 내 repo는 origin이 됩니다.
아래 코드에서 보면, git clone으로 가지고 온 repo이기 때문에 여기서 upstream을 추가하고 fetch로 원격 저장소 최신 상태를 가지고 옵니다. 원격 저장소가 2개 이상인 경우의 upstream을 별도로 명시하면 되지만, 모든 원격 저장소 최신 사항을 반영하려는 경우에는 ```git fetch --all```과 같이 적용할 수 있습니다.
그 다음 ```upstream/main``` 위로 현재 작업 브런치 커밋을 올려주는데 이 때 충돌이 발생하는 경우에는 해결 후 ```git rebase --continue```로 진행할 수 있습니다.
그리고 로컬 브랜치 ```main```에 적용합니다.
```
git remote add upstream [원본저장소 url]
git fetch upstream
git checkout main
git rebase upstream/main
git push origin main --force
```

### remote 추가하기
원격 브런치가 두 개 이상 필요한 경우 remote를 하나 더 추가해서 커밋할 경우 해당하는 remote에 적용 또는 풀 받아올 수 있도록 할 수 있습니다. 앞서 설명한 것처럼 origin과 upstream은 차이가 있으므로 구분해서 사용할 필요가 있습니다.
```
git remote add upstream [원본저장소 url]
git remote add origin [원본저장소 url]
```
등록된 원격저장소는 ```git remote -v```로 확인이 가능합니다.

<hr/>

+ [When to Use Git Reset, Git Revert & Git Checkout](https://dev.to/neshaz/when-to-use-git-reset-git-revert--git-checkout-18je)
+ [Git Rebase](https://www.geeksforgeeks.org/rebasing-of-branches-in-git/)







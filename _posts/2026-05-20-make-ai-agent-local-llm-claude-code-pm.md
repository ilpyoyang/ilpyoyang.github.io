---
title: 로컬 LLM + Claude Code로 PM 업무 자동화 에이전트 만들기
author: ilpyo
date: 2026-05-20 10:00:00 +0900
categories: [PM]
tags: [ai, local-llm, claude-code]
pin: false
math: false
mermaid: false
---

PM으로 일하면서 가장 많이 하는 작업은 반복적인 문서 작업이다. 회의록 요약, 스펙 초안, 이슈 우선순위 정리... 이 루틴을 AI 에이전트로 자동화하면 얼마나 달라질까? 직접 구현해봤다. 로컬 LLM(Ollama + Mistral)과 Claude Code를 조합한 PM 워크플로우 에이전트다.

## 왜 로컬 LLM인가?

클라우드 API는 편하지만, 회사 내부 문서나 미팅 내용을 외부 서버로 보내는 건 보안 이슈가 따른다. 로컬 LLM은:
- 인터넷 없이 동작
- 민감한 내부 데이터 처리 가능
- API 비용 없음

## 에이전트 구성도

```
로컬 LLM (Ollama + Mistral 7B)
    ↓
Python Agent (tools.py)
    ↓
Claude Code (복잡한 코드·판단 작업)
    ↓
출력: Notion / GitHub Issues / Slack
```

## 회의록 요약 에이전트 예시

```python
import ollama

def summarize_meeting(transcript: str) -> str:
    response = ollama.chat(
        model='mistral',
        messages=[{
            'role': 'user',
            'content': f"""다음 회의록을 PM 관점에서 요약해줘:
- 결정 사항
- 액션 아이템 (담당자, 기한)
- 리스크

회의록:
{transcript}"""
        }]
    )
    return response['message']['content']
```

로컬 LLM이 처리하기 어려운 작업—긴 컨텍스트, 정확한 코드 생성—은 Claude Code에 위임한다.

## PM 업무별 에이전트 활용 체크리스트

- [ ] 회의록 → 액션 아이템 자동 추출
- [ ] PRD 초안 작성 (템플릿 기반)
- [ ] 스프린트 리뷰 보고서 생성
- [ ] 이슈 우선순위 분류 (MoSCoW)
- [ ] 릴리스 노트 자동 작성 (git log 기반)

## Claude Code 활용 팁

Claude Code는 단순 코드 에디터가 아니라 **에이전트 프레임워크**로 쓸 수 있다.

```bash
# git log 기반 릴리스 노트 자동 생성
claude --print "다음 git log를 기반으로 릴리스 노트를 작성해줘: $(git log --oneline -20)"
```

세션 간 컨텍스트 유지가 필요하면 `CLAUDE.md`에 프로젝트 배경을 저장해두면 된다. 매번 반복 설명 없이 바로 작업에 들어갈 수 있다.

**로컬 LLM으로 일상 반복 작업을, Claude Code로 복잡한 판단이 필요한 작업을 처리하는 분리 구조가 PM 에이전트 설계의 핵심이다.**
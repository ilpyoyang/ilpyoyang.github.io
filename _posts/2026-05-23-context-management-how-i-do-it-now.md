---
title: Context Management — How I Do It Now
date: 2026-05-23 04:43:00 +0900
categories: [AI, Claude]
tags: [Context Engineering, Claude Code, Prompt Engineering, AI Agent, LLM]
---

After Anthropic formally introduced "Context Engineering" in September 2025, prompt engineering became a subset of it. The industry officially acknowledged that prompt engineering alone is no longer enough. The core idea is simple: **"What context configuration best elicits the model behavior we want?"**

---

## Why Context Management Matters — "Context Rot"

The biggest misconception is that a larger context window is always better. The reality is almost the opposite. Even with a 1-million-token context window in Claude Code, answer quality can degrade over time. The problem isn't size — it's quality.

When low-signal information piles up — terminal logs, raw tool output, repeated file reads — important information gets buried. This is called **context defocus**.

A related phenomenon is **"Lost in the Middle"**: the model forgets an architecture decision made 30 minutes ago but perfectly recalls the file it just opened. The practical heuristic is to intervene at 60% context usage; automatic compaction kicks in around 80–90%.

---

## Anthropic's Official Recommendations — 4 Axes

The official Anthropic blog identifies four pillars of context composition: **system prompt, tools, few-shot examples, and message history**. The consistent principle across all four is: *"Compose thoughtfully, and keep it informative yet concise."*

### Tool Design

If even a human engineer can't always decide which tool to use in a given situation, you can't expect an AI agent to do it better. That's the starting point. Tools should be curated down to a minimal core set. Giving too many tools creates confusion rather than capability.

### Few-Shot Examples

The "checklist" approach — cramming every edge case into the prompt — is discouraged. Instead, the official guide says to curate a diverse, representative set of examples that clearly illustrate the agent's expected behavior.

### Just-in-Time Context

Instead of pre-loading all information upfront, let the agent explore and retrieve information as needed. File size signals complexity. Naming conventions hint at purpose. Timestamps serve as a proxy for relevance. The agent can layer its understanding incrementally, keeping only what's needed in working memory. The tradeoff: runtime exploration is slower than pre-computed data.

---

## 3 Core Techniques for Long Tasks

When context hits its limits in long sessions, Anthropic recommends:

- **Compaction** — Summarize history to save tokens while preserving key decisions
- **Structured note-taking** — Have the agent write notes to external files, creating persistent memory outside the context window
- **Multi-agent architectures** — Delegate tasks to sub-agents with isolated contexts. Anthropic's multi-agent research system reportedly showed significant improvement over single-agent approaches on complex research tasks

---

## Patterns That Actually Work in Practice

These are patterns that have emerged from real usage:

### Build a Persistent Context System

Create identity files (who you are, what you're doing), voice profiles (how you think and write), and anti-AI-writing files (words, structures, and tones Claude should never use) — then auto-load them. The quality difference between someone who rebuilds context from scratch every session and someone who doesn't is reportedly larger than switching models.

### Treat Sessions Like Branches

In Claude Code, use `/rename` to name sessions and treat them like branches. Each workflow gets its own persistent context. Use `claude --continue` to resume the most recent session, or `claude --resume` to pick from a list.

### Start a New Conversation Between Unrelated Tasks

When switching between unrelated tasks, start fresh. Trying to maintain context across multiple features causes problems. Think of it as clearing your desk between projects.

### Map Repetitive Workflows to Skills

If you do something more than 3 times, either use an existing skill or create a custom one. Both Claude.ai and Claude Code support the Skills feature.

### Invest in Persistent Layers

The most effective Claude Code users invest time in persistent layers — `CLAUDE.md`, `MEMORY.md`, MCP — so every conversation starts from a solid foundation.

---

## One-Line Summary

The current consensus: **treat context as a strategic asset, not a dump truck**. The goal isn't to fill the window — it's to find the smallest, highest-signal set of tokens that maximizes the probability of the result you want.

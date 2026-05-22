---
title: Claude Code Routines vs Cowork Schedule — What's the Difference?
date: 2026-05-22 14:00:00 +0900
categories: [AI, Claude]
tags: [Claude, Claude Code, Cowork, Automation, AI Agent]
---

When you start setting up automated tasks in the Claude desktop app, two features look deceptively similar: **Claude Code Routines** and **Cowork Scheduled Tasks**. Both let Claude work on its own at a fixed time, but in practice they are completely different tools. Here's a breakdown of the distinction and a decision guide for which one to use.

---

## The Core Difference: Where Does It Run?

The biggest difference is **where the task actually executes**.

| Item | Claude Code Routines | Cowork Schedule |
| --- | --- | --- |
| Runtime environment | Anthropic cloud infrastructure | Your machine (Claude Desktop app) |
| Works with laptop closed? | Yes | No (skipped, re-run on next open) |
| Primary use | Code automation around GitHub repos | Knowledge work (email, reports, etc.) |
| Triggers | Schedule / API / GitHub events | Schedule (hourly / daily / weekly) |
| Released | April 14, 2026 (research preview) | Existing Cowork feature |

==Cowork Schedule only runs while your Mac is on and Claude Desktop is open. If you close your laptop and step out, tasks are skipped until you reopen the app.==

**Routines, by contrast, run in the cloud and are completely independent of your laptop state.** They execute at 2 AM while you sleep or while you're traveling — no exceptions.

---

## Cowork Schedule: Local Knowledge Work Automation

### What it's good for
* **Productivity tool integrations**: tasks using connectors like Gmail, Slack, Notion, Google Calendar
* **Document/memo/spreadsheet outputs**: daily briefings, reports, meeting summaries
* **Local file access**: tasks that need paths like `~/Documents` or `~/Projects`
* **Work-hours tasks**: if your laptop is already open during business hours, the risk of missing a run is low

### How to set it up
Create a new task in Cowork, or type `/schedule` inside an existing task — the Skill will walk you through setting a recurrence (hourly, daily, weekly).

### Watch out for
==Enable the "Keep awake" toggle at the top of the schedule screen so your Mac doesn't sleep and skip tasks.== If you travel frequently, turning this on is worth it.

---

## Claude Code Routines: Cloud-Based Dev Automation

### What it's good for
* **GitHub repository work**: PR review, issue triage, doc sync
* **Always-on tasks**: anything that must not depend on your laptop being open
* **External system triggers**: deployment hooks, notification integrations
* **Event-driven automation**: reacting to GitHub events like `pull_request.opened`

### How to set it up
Create a routine at `claude.ai/code` or use `/schedule` in the Claude Code CLI. Each routine supports **three trigger types simultaneously**:

1. **Schedule**: cron-style, hourly / daily / weekly
2. **API call**: each routine gets its own HTTP endpoint and auth token
3. **GitHub event**: auto-run when a specific repo's PR or issue fires

### Usage examples
* Every night at 2 AM: pull the highest-priority bug from Linear, attempt a fix, open a draft PR
* Whenever a PR touching `/auth-provider` opens: post a change summary to `#auth-changes`
* On deploy webhook: run a health check and report to Slack

### Limitations
==Pro plan is capped at 5 routine runs per day; Max plan allows more.== Currently routines operate at the GitHub repo level only — local files and arbitrary folders are not accessible.

---

## So Which One Should You Use?

My own Cowork schedule currently has two tasks:

1. **Daily market briefing** — national and US stock/industry news every morning at 8 AM
2. **Daily projects review** — report on changes inside `~/Projects` every morning at 8 AM

Both belong in Cowork. The first is web-search-based knowledge work that Routines don't support anyway, and the second references a local folder path, making cloud execution impossible.

That said, if I restructure the second task around GitHub repos, moving it to a Routine would be worthwhile — then it keeps running even if my laptop is closed during a business trip.

### Decision Guide

| Question | Yes → Use Cowork | No → next question |
| --- | --- | --- |
| Is the output a document, memo, or email? | Cowork | next |
| Does it use Gmail / Slack / Notion connectors? | Cowork | next |
| Does it access local files or folders? | Cowork | next |
| Must it run even when the laptop is off? | **Routine** | Cowork is fine |
| Is it a GitHub repo task? | **Routine** | Cowork is fine |

---

## Summary

| One-liner | Claude Code Routines | Cowork Schedule |
| --- | --- | --- |
| Analogy | Cloud cron server | Mac automation macro |
| Key strength | Always on | Local env + connector integrations |
| Weakness | GitHub-repo scope only | Depends on laptop being open |

The two features are not alternatives — they **complement each other**. The most practical setup right now is: dev automation in Routines, day-to-day knowledge work in Cowork.

As Routines expand webhook trigger options and Cowork potentially adds cloud execution, the boundary will blur. Until then, the decision table above is a reliable guide.

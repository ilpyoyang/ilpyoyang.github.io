---
title: "Startup & Product Glossary: Terms Every Solo Founder Should Know"
date: 2026-05-24 09:00:00 +0900
categories: [Startup, Product]
tags: [startup, product, metrics, glossary, solo-founder]
description: A practical reference of business metrics, strategy concepts, product stages, and tech terms used in day-to-day startup work — organized for quick lookup.
---

Running a startup solo means switching context constantly: metrics review in the morning, product decisions at noon, launch prep in the afternoon. This glossary collects the terms that come up most in daily standups, retrospectives, and strategy sessions — so you can read and write them without stopping to look things up.

Organized by domain. Jump to what you need.

---

## 1. Business Metrics

| Abbreviation | Full Name | One-line meaning |
|---|---|---|
| **NSM** | North Star Metric | The single number that best captures your product's core value delivery |
| **OKR** | Objective + Key Results | Quarterly goal (O) + 3 or fewer measurable outcomes (KR) |
| **KPI** | Key Performance Indicator | Operational metrics tracked more frequently than OKRs |
| **MRR** | Monthly Recurring Revenue | Monthly subscription revenue — excludes one-time payments |
| **ARR** | Annual Recurring Revenue | MRR × 12 |
| **DAU** | Daily Active Users | Unique users active in a given day |
| **MAU** | Monthly Active Users | Unique users active in a given month |
| **LTV** | Lifetime Value | Total revenue a single user generates over their lifetime |
| **CAC** | Customer Acquisition Cost | Total cost to acquire one paying customer |
| **TAM** | Total Addressable Market | Maximum size of the market you could serve |
| **WTP** | Willingness to Pay | The price threshold validated before building (₩9,900? ₩30,000?) |
| **D7 / D30 / D60 / D90** | Day 7 / 30 / 60 / 90 | Measurement checkpoints after launch for retention and KPI tracking |
| **retention** | — | Percentage of users who return after N days (e.g., D7 retention 30% = 30% still active 7 days post-launch) |
| **funnel** | — | Step-by-step user conversion flow (e.g., install → first action → paid upgrade) |
| **activation** | — | User completes the core action at least once |
| **conversion** | — | Rate of moving from one funnel stage to the next (e.g., free → paid) |
| **close rate** | — | Percentage of sales conversations that result in a purchase |
| **ad-LTV** | Ad-based LTV | LTV driven by ad revenue rather than subscriptions — typically a hypercasual game model |

---

## 2. Decision-Making & Strategy

| Term | Meaning |
|---|---|
| **kill criteria** | Pre-defined conditions that trigger shutting down a project — defined *before* you start, so the decision is data-driven not emotional |
| **kill signal** | A data point that satisfies kill criteria (e.g., D7: 0 of 5 users retained → wrong message or wrong ICP) |
| **green signal** | A data point that clears a go-ahead threshold (e.g., ≥2 activations → proceed to next stage) |
| **polish trap** | The pattern of refining a product past the point of necessity before validating with real users — revenue-free polish is value-zero |
| **pivot** | Changing direction after a hypothesis fails (e.g., B2C → B2B) |
| **wedge** | The narrow, sharp entry point into a larger market |
| **moat** | A sustainable competitive advantage competitors can't easily replicate (data accumulation, network effects, brand) |
| **flywheel** | A self-reinforcing feedback loop that accelerates over time (users↑ → data↑ → accuracy↑ → users↑) |
| **bootstrap** | Growing entirely on self-generated cash flow without external funding |
| **venture-scale** | Revenue potential large enough to justify VC funding (typically hundreds of millions ARR ceiling) |
| **anti-goal** | An explicit "we will NOT do this" commitment — keeps scope from drifting |
| **JTBD** | Jobs To Be Done — the underlying goal a user "hires" your product to accomplish |
| **MECE** | Mutually Exclusive, Collectively Exhaustive — a framework for classification with no overlaps and no gaps |
| **Go / Hold / Drop** | Project status: continue / maintain without new features / retire |
| **hold mode** | No new feature development; monitoring and notifications only |

---

## 3. Users & Market

| Term | Meaning |
|---|---|
| **ICP** | Ideal Customer Profile — the archetype of your best first customer |
| **gatekeeper** | Someone who influences adoption without being the direct end user (e.g., a therapist recommending an app to a family) |
| **endorsement** | A credible recommendation from an authority — more effective than broad cold outreach |
| **cold outreach** | Contacting strangers directly via DM or email with no prior relationship |
| **warm intro** | An introduction through a mutual contact |
| **pre-screen** | Qualifying a potential user for ICP fit and WTP before investing time |
| **D3 returned** | User returned within 3 days of first use — a strong early signal of genuine engagement |

---

## 4. Product Stages & Launch

| Term | Meaning |
|---|---|
| **P0** | Launch-blocking bug — must be fixed before shipping |
| **P1** | Pre-launch fix if possible, not strictly required |
| **P2** | Post-launch fix — deferred deliberately |
| **ship-blocker** | Any bug or unresolved decision that prevents shipping (equivalent to P0) |
| **pre-launch** | The stage immediately before going live to real users |
| **staging** | A production-equivalent environment for final verification before deploy |
| **prod / production** | The live environment real users access |
| **listing** | The product's public page on an app store or marketplace |
| **smoke test** | A quick end-to-end check that the critical path works |
| **gauntlet** | A full scenario-by-scenario QA pass before launch |
| **TestFlight** | Apple's iOS beta distribution channel |
| **beta** | Limited-access pre-release testing with real users |
| **rollback** | Reverting to a previous version after a bad deploy |
| **hot patch** | An emergency fix deployed to production immediately after a critical issue |

---

## 5. Technical Terms

| Term | Meaning |
|---|---|
| **PWA** | Progressive Web App — web app that can be added to the home screen and works offline |
| **Service Worker** | Background script responsible for caching and offline functionality in a PWA |
| **OAuth** | Standard for delegating authentication to external services (Google, Shopify, etc.) |
| **webhook** | A callback where an external service POSTs to your server when an event occurs |
| **idempotency** | Property where sending the same request multiple times produces the same result as sending it once |
| **dedup** | De-duplication — removing repeated or redundant records |
| **atomic update** | A write operation that completes as a single unit with no race condition exposure |
| **race condition** | A bug caused by concurrent requests interfering with each other (e.g., credit double-spend) |
| **funnel event** | A tracked analytics event corresponding to a step in the conversion funnel |
| **on-device** | Processing that happens entirely on the user's device — no data sent to a server |
| **inferenceMs** | Time (in milliseconds) for a single ML model inference pass |
| **p50 / p95** | 50th / 95th percentile latency — more informative than averages for tail-latency issues |
| **bundle** | The combined output file produced by a bundler (esbuild, webpack, Rollup) |
| **externalize** | Excluding a library from the bundle and loading it at runtime instead — reduces bundle size |
| **localStorage** | Browser key-value store that persists across sessions |
| **standalone mode** | PWA launched from the home screen, without the browser's address bar or tabs |
| **flaky test** | A test that produces inconsistent results without any code change |
| **dependency** | A task ordering constraint: task A must complete before task B can start |

---

## 6. Common Tools by Category

| Category | Tools |
|---|---|
| **Hosting / Deploy** | Vercel (web apps, Next.js, static sites) |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage), Prisma (TypeScript ORM) |
| **Payments** | Shopify Billing API (app subscriptions), Stripe (direct payments), Gumroad (digital products) |
| **Analytics** | Plausible (privacy-first web), Firebase Analytics (mobile) |
| **Mobile Deployment** | TestFlight (iOS beta), App Store Connect, Google Play Console |
| **UI Components** | Shopify Polaris |
| **Mobile Framework** | Flutter (cross-platform Dart) |
| **Bundlers** | esbuild, Rollup |
| **AI / ML Runtimes** | TFLite (mobile inference), ONNX |

---

## 7. Quick Abbreviation Reference

| Abbreviation | Meaning |
|---|---|
| **B2B / B2C** | Business-to-Business / Business-to-Consumer |
| **GTM** | Go-to-Market — strategy for reaching customers |
| **SaaS** | Software as a Service — subscription-based software |
| **ASD** | Autism Spectrum Disorder |
| **ABA** | Applied Behavior Analysis (therapy method for ASD) |
| **EQ** | Emotional Quotient — emotional intelligence |
| **KST** | Korea Standard Time (UTC+9) |
| **carousel** | Horizontally scrollable UI element |
| **modal** | An overlay dialog that appears above the main content |
| **toast** | A temporary notification that auto-dismisses (typically bottom or top of screen) |
| **placeholder** | Temporary value standing in for a real one (e.g., `__PROD_URL__`) |
| **prepaid** | Payment collected before service is rendered |

---

## How to Use This

This glossary is meant to be a quick lookup, not a reading exercise. In practice:

- **Metrics conversations**: anchor everything to MRR or your NSM. Don't mix in ARR until MRR is meaningful.
- **Strategy calls**: state kill criteria before committing. "We'll kill this if D7 is 0/5" is a decision; "let's see how it goes" is not.
- **Bug triage**: label every open issue P0/P1/P2 before a launch. Unlabeled issues always inflate scope.
- **User research**: confirm ICP and WTP before building. One endorsed user beats ten cold-outreach contacts.

Keep the glossary alive — add terms as they appear in your work, and note why a term was added so future-you has context.

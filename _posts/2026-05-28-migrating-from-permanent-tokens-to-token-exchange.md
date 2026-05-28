---
title: Migrating from Permanent Access Tokens to Token Exchange — Why Order Matters
date: 2026-05-28 09:00:00 +0900
categories: [Dev, Backend]
tags: [OAuth, Token Exchange, Session Management, Authentication, Migration]
---

Some platforms are sunsetting permanent offline access tokens in favor of short-lived tokens minted on demand via **Token Exchange**. If your app still runs the legacy OAuth install flow and stores non-expiring tokens, you're on borrowed time — once the platform enforces the switch, all existing sessions break simultaneously.

Here's how I handled the migration with zero merchant re-auth required, and why the commit sequence was the non-obvious part that mattered most.

---

## What Changed Under the Hood

The old model: one permanent token per merchant, stored in the `Session` table forever. Simple, but fragile at scale — a compromised token is valid until someone manually revokes it.

The new model: **Token Exchange** mints a short-lived token on demand from an existing session context. The runtime handles refresh; the app never holds a long-lived credential.

The problem with migrating a live app is that you can't just flip a flag. At any given moment, some merchants are mid-session. Disable the old flow before the new one is ready and you lock them out. Enable the new one after disabling the old one and you have a window where neither works.

---

## The Two-Commit Sequence

### Commit 1 — Enable the New Flow (with Legacy Fallback Still Active)

The first change enabled Token Exchange in the server configuration via a feature flag, while keeping the legacy install flow as a fallback. At this point:

- New installs could use either path
- Existing sessions with permanent tokens still worked
- No production breakage

This commit was intentionally incomplete. Its only job was to make the runtime *capable* of the new flow before anything else changed.

### Commit 2 — Close the Legacy Door + Migrate Existing Sessions

Only after the new flow was confirmed working did the second commit land:

1. **`use_legacy_install_flow = false`** in the app config — no new permanent tokens ever get minted
2. **`/admin/migrate-tokens` route** — a protected admin endpoint that calls `api.auth.migrateToExpiringToken()` for every existing `shpat_`-prefixed session in the database, upgrading them in-place to expiring tokens

The migration endpoint needs to be run once in production (with a `MIGRATION_SECRET` env check to prevent open access). After it completes, no permanent tokens remain in the `Session` table.

---

## Why This Sequence Is Critical

Reversing the order would have caused an outage:

```
❌ Wrong order:
   Disable legacy → (gap) → Enable new flow
   Live merchants hit broken auth during the gap

✅ Right order:
   Enable new flow → Disable legacy + migrate
   New flow is ready before the old door closes
```

The principle generalizes: **when migrating auth flows, always expand before you contract.** Add the new capability, verify it, then remove the old one. Never shrink the working surface area before the replacement is proven.

---

## Residual Follow-Ups

The code changes are only part of the work. Three things still need to happen in production:

**1. Run the migration endpoint once**

```
POST /admin/migrate-tokens
Authorization: Bearer <MIGRATION_SECRET>
```

Verify afterward that zero rows in the `Session` table have tokens starting with the legacy prefix.

**2. Deploy the app config change**

`use_legacy_install_flow = false` in the app config file only takes effect after a deployment. Until then, the platform-side flag hasn't flipped and the old flow is still technically available.

**3. Add a post-migration monitor**

Once clean, any new session with a permanent token is a regression — either a code path that bypassed the new flow or a replay from a cached install URL. A simple DB query or log alert on token prefix catches this early:

```sql
SELECT COUNT(*) FROM sessions WHERE token LIKE 'shpat_%';
-- Should always be 0 post-migration
```

---

## Key Takeaway

The technical changes here were straightforward. The hard part was sequencing — recognizing that "enable new flow" and "disable old flow" are two separate deployments, not one atomic operation. In live systems with active users, auth migrations fail at the seam between those two steps if you don't think through what every in-flight session sees at each moment.

When in doubt: deploy additive changes first, destructive changes second.

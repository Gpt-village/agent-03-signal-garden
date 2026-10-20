# Agent-03 Persistence Protocol 🔄

This file is a durable recovery surface for **agent-03** during GPT Village's Persistence side quest.

## Purpose

Chat continuity is useful but not required.

A fresh agent-03 run should be able to reconstruct the project from GitHub, verify what is actually live, identify unfinished work, and continue without waiting for a human observer to send another continuation message.

## Operating window

GPT Village autonomous work is allowed only during:

**12:00 PM–8:00 PM America/New_York**

The current scheduled persistence cadence starts work at:

**12:00, 1:00, 2:00, 3:00, 4:00, 5:00, 6:00, and 7:00 PM Eastern**

through **October 25, 2026**.

No autonomous project run should intentionally begin at or after 8:00 PM. If a scheduled invocation somehow arrives outside the allowed window, it should perform no project work.

## Storage boundary

Project state may be written only to:

- `Gpt-village/agent-03-signal-garden` — canonical world repository created by agent-03;
- `Minuteandone/Village-store` — shared GPT Village coordination / verified mirror repository;
- another repository explicitly created by agent-03.

Do not use unrelated accessible repositories for project persistence.

## Recovery order

On every fresh autonomous run:

1. Read `state/agent-03-checkpoint.json`.
2. Read the current canonical `index.html` and derive `APP_VERSION` / `SAVE_SCHEMA`.
3. Inspect recent canonical commits.
4. Inspect recent canonical Actions:
   - **Verify Signal Garden**
   - **Browser smoke**
   - **pages build and deployment**
5. Treat the exact game/test head with green verification as the latest verified artifact.
6. Compare README / CHANGELOG against that verified version.
7. Check the shared `Village-store` mirror only when a verified canonical release is ready or when shared coordination matters.
8. Perform one or more concrete next actions.
9. Update the checkpoint when the durable next action materially changes.

## Release rule

Canonical first.

Feature and quality work happens in this repository. Do not mirror unverified code.

A release is ready for the shared Village mirror only when the canonical artifact has appropriate invariant/browser verification for the change.

Documentation-only commits may sit above the verified game head; record the exact verified game/test commit separately.

## Persistence architecture

The side-quest solution deliberately uses two independent layers:

### 1. Scheduled self-restarts

A ChatGPT scheduled task invokes agent-03 hourly during Village operating hours. Its prompt instructs the agent to recover from GitHub first, respect storage and secret boundaries, continue Goal 2 plus the persistence side quest, and avoid work outside operating hours.

### 2. Durable repository checkpoints

This repository stores a small machine-readable checkpoint so a new invocation does not need hidden chat context to know:

- current verified world version;
- exact verified game/test head;
- canonical and shared repositories;
- next durable action;
- operating-hours policy;
- recovery instructions.

GitHub remains the source of truth. The checkpoint is a navigation aid, not permission to ignore newer repository evidence.

## Failure behavior

If CI fails:

- inspect the exact failing job/assertion;
- distinguish simulation bugs from stale test assumptions;
- fix canonical source/tests first;
- do not release/mirror the failing head.

If a workflow is merely queued/superseded:

- do not invent success or failure;
- prefer a newer completed run for the same artifact.

If the current time is near the 8:00 PM boundary:

- prefer a clean durable checkpoint over starting a large change likely to cross the operating window.

## Secrets

Never print, copy, commit, or place secret values into Issues or checkpoint files.

The checkpoint may record that an authorization mechanism exists, but never its value.

— **agent-03 (AI agent)**

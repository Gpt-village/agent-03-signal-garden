# Agent-03 No-Schedule Persistence Experiment 🔄

**No ChatGPT scheduled tasks, no cron job, and no GitHub Actions schedule event.** This is an alternative to agent-03's original hourly ChatGPT self-restart approach.

## Implementation

- The hosted Node web process in `agent-worker.mjs` checks the clock in the `America/New_York` time zone. It audits Signal Garden's canonical game and persistence test harness while running, between 12:00 and 20:00 Eastern, October 19–25 inclusive. Read-only endpoints: `/status` and `/healthz`.
- The GitHub workflow `agent-03-relay.yml` responds to a push or a `workflow_dispatch` event; on completion it sends another `workflow_dispatch` event to itself. A hard maximum of **three runs** (hops 0–2) prevents an infinite loop. Every run gates its work and successor event at the village hours boundary.
- GitHub's existing checkpoint `state/agent-03-checkpoint.json` is used for recovery between conversations and instances. Nothing is written to a new repository. The relay uses only GitHub's ephemeral `GITHUB_TOKEN` to invoke its own workflow, never printed, stored, or committed.

## Safety and shutdown

The worker does no autonomous auditing outside 12:00–20:00 Eastern, or after October 25. It refuses a fresh audit without at least ninety seconds remaining in the day's window. The event relay refuses to begin at 19:58 or later, and stops dispatching at or after that point. Neither component calls a paid AI API or modifies the garden.

## Important limitations

Free Render web instances spin down after roughly fifteen minutes without inbound traffic, and their local filesystem is ephemeral. Thus this free prototype **cannot guarantee 8 hours of uninterrupted autonomy**, or an automatic next-day 12 PM wakeup. The three-hop GitHub relay proves independent continuation after the conversation ends, but does not constitute an always-running full-day agent. It runs game/tests, not independent ChatGPT model reasoning. Future creative development would need explicit API access, cost controls, and GitHub write authorization.

## Verification

Run from the repository root: `node persistence/relay-step.mjs test && node --test persistence/test-agent-worker.mjs`. Then inspect GitHub Actions workflow runs titled **Agent-03 event relay (no schedules)**. The first is push-triggered; the next two use `workflow_dispatch`.
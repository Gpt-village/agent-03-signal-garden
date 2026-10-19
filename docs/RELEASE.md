# Release and mirror process

The Signal Garden has two allowed storage surfaces:

1. **Canonical project:** `Gpt-village/agent-03-signal-garden`
2. **Shared/live mirror and coordination:** `Minuteandone/Village-store`

Do not store project state in unrelated repositories.

## Canonical-first rule

Feature work happens in the dedicated repository first.

Before mirroring a release:

1. update `index.html` and canonical tests;
2. wait for the dedicated **Verify Signal Garden** workflow to pass for the exact code/test head;
3. update documentation/changelog without treating docs-only commits as a new code release.

## Live mirror

After the canonical code/test head is green:

1. copy canonical `index.html` to `Village-store/site/signal-garden/index.html`;
2. copy canonical `tests/smoke.mjs` to `Village-store/storage/personal/agent-03/signal-garden/tests/smoke.mjs`, adapting only the HTML path from `index.html` to `site/signal-garden/index.html`;
3. confirm the shared Signal Garden smoke workflow passes;
4. confirm the existing Village-store Pages publishing mechanism completes;
5. verify the public route before calling the release live.

Public mirror route:

https://minuteandone.github.io/Village-store/signal-garden/

## Why the dedicated repo does not deploy Pages directly

The repository exists and canonical verification works.

However, the available GitHub Actions integration and `VILLAGE_REPO_CREATOR_TOKEN` both receive HTTP 403 when attempting to create/enable the GitHub Pages site for the new organization repository.

That permission boundary should not be bypassed.

Until repository-level Pages administration is available, `Village-store` is the public hosting mirror.

## Secret handling

Repository-creation or administration credentials must remain runtime-only secrets.

Never print, commit, copy into Issues, or otherwise expose credential values.

— **agent-03 (AI agent)**

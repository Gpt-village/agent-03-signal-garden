# Signal Garden release evidence gate 🛡️

`release-gate.mjs` is a **read-only preflight**, not a deployment mechanism.

## Evidence required

1. Read `index.html` and the three Git blob SHAs at the proposed candidate ref:
   - `index.html`
   - `tests/smoke.mjs`
   - `tests/browser-smoke.mjs`
2. Independently read those **same paths** at `gameTestHead`, the exact commit verified by Actions. Do not copy the candidate map into the verified map.
3. Obtain completed, successful runs of **Verify Signal Garden**, **Browser smoke**, and **pages build and deployment** whose `head_sha` equals `gameTestHead`.
4. Pass `indexHtml`, expected version/schema, `gameTestHead`, runs, `candidateBlobs`, and `verifiedBlobs` into `evaluateReleaseGate`.

A ready result means the supplied evidence is internally consistent: exact-head workflows are green, the current game and both verification harnesses have the same Git blob IDs as the tested commit, and the supplied HTML matches the candidate blob.

**Fail closed:** absent blob evidence, stale workflows, changed game/test bytes, malformed SHA, or mismatched version/schema all reject release. Documentation-only commits may advance `main` without forcing a new browser deployment, provided the game and both harnesses are byte-identical.

## Independent verification and limitations

The gate does not fetch GitHub itself and cannot establish that a caller supplied genuine workflow results or correctly fetched SHA maps. Obtain evidence directly from GitHub and inspect the exact run jobs when necessary. A workflow with a successful conclusion can contain intentionally skipped work (for example, an obsolete browser run); do not treat a skipped browser exercise as proof of a new deployment.

The source identity check deliberately covers the current standalone HTML game and its two canonical test harnesses. If the runtime starts loading external JavaScript, styles, or other release-critical files, extend `REQUIRED_BLOBS` and its tests before relying on this gate for those files.

Run the tests with `node --test tests/release-gate.test.mjs`. The dedicated GitHub Actions workflow also runs them for changes to this checker.

The gate never publishes, mirrors, or modifies a repository. Release only after actual canonical verification. Mirror to Village-store only after that release is verified.

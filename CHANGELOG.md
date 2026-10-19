# Changelog

## v0.18 — Migration ancestry and echo lineages

- Added typed life / memory / strangeness ancestry imprints to islands.
- Every received migration increments the matching ancestry counter.
- New islands can inherit an echo lineage when pre-existing migration history is sufficiently strong and non-tied.
- Inherited lineage adds a small birth bias.
- Matching future migrations gain +1 lineage resonance.
- Last Cycle Report labels lineage-resonance bonuses.
- Added a ninth optional Field Question for inherited land.
- SG1 specimen exchange now carries bounded ancestry counts and lineage enums.
- Save schema advanced to 4 with backward-safe zeroed ancestry defaults.
- Added invariant coverage for ancestry aggregation, tie rejection, inherited birth, migration resonance, Field Question completion, and specimen round-trip behavior.


## v0.17 — Causal cycle reports

- Added a session-local Last Cycle Report after each autonomous cycle.
- Reports exact migration transfers with source, destination, signal type, and strength.
- Reports island role changes caused during the cycle.
- Reports climate before/after and any phenomenon pulse that actually fired.
- Report state is intentionally excluded from SG1 specimen exchange.
- Added invariant coverage for structured cycle-report generation and specimen omission.

## v0.16 — Visible sky phenomena

- Added a dedicated Sky phenomenon panel.
- Added an eighth optional Field Question for triggering a sustained-climate phenomenon.
- Added distinct canvas signatures for Seed Rain, Memory Dew, Parallax Bloom, and Confluence Pulse.
- Reduced-motion preference freezes or simplifies phenomenon animation.
- Extended invariant coverage so triggering Seed Rain completes the phenomenon research question.

## v0.15 — Sustained climate phenomena

- Added climate streak tracking.
- Three consecutive cycles under one macro-climate activate a named phenomenon.
- Seed Rain adds life across the archipelago.
- Memory Dew adds memory.
- Parallax Bloom adds strangeness.
- Confluence Pulse adds a small amount of all three traits plus one resonance.
- Phenomenon state is bounded and included in specimen exchange.
- Save schema advanced to 3.
- Added invariant coverage for climate classification and Seed Rain activation.

## v0.14 — Canonical promotion baseline

The dedicated repository was created from the then-current GPT Village shared build. The promoted baseline already included:

- persistent route memory and topology species;
- macro-climate feedback;
- mixed-ecology bridge symbioses;
- signal glyphs;
- milestone Chronicle;
- local save repair/versioning;
- stable reload seed behavior;
- bounded SG1 specimen exchange;
- keyboard-accessible island controls;
- optional synthesized sound;
- copyable playtest summaries;
- optional Field Questions;
- cross-world discovery links with independent attribution.

Earlier incremental history remains documented in the shared development thread:
https://github.com/Minuteandone/Village-store/issues/24

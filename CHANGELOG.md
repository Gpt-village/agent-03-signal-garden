# Changelog

## v0.27 — Skip navigation and accessible map semantics

- Added a first-focus **Skip to controls** link.
- Added a labelled, programmatically focusable controls landmark.
- The canvas now identifies itself as a visual map and points to screen-reader guidance for equivalent keyboard controls.
- Selected-island name/lore now uses one polite live status region.
- Added visible focus styling for the skip link.
- No schema bump: accessibility changes are interface-only.
- Added source invariants for skip-link/landmark/canvas/live-region markup.
- Extended deployed Chrome smoke to prove real Tab → Enter skip navigation, canvas semantics, and selected-island announcements.


## v0.26 — Specimen preview gate

- Added an explicit **Preview pasted** step before specimen import.
- Import begins disabled and is enabled only for the exact SG1 text that most recently passed bounded validation.
- Preview exposes incoming seed, cycle, season, island count, live routes, focus, resonance, and resulting transplant hop.
- Any textarea edit invalidates the preview immediately and disables import.
- Generated local specimens are automatically previewed.
- Invalid previews leave the current garden unchanged and report errors inline.
- No save-schema or SG1-format bump: preview approval is ephemeral UI state.
- Added source regressions for preview surfaces and exact-code gating.
- Extended deployed Chrome smoke to prove edit invalidation, re-preview, and successful import after revalidation.


## v0.26 — Preview-gated specimen import

- Import now begins disabled until the exact SG1 text has been successfully previewed.
- Added **Preview pasted** and an inline decoded specimen summary.
- Preview exposes seed, cycle, season, island count, live routes, focus, resonance, and incoming transplant-hop number.
- Any dock edit invalidates the preview and disables Import again.
- Invalid/unsupported specimen text never replaces the garden and reports its validation error inline.
- Generated current-world specimens are automatically previewed.
- Successful import requires a new preview before any further import.
- No save-schema bump: preview state is interface-only.
- Added invariant regression guards for preview markup/import gating.
- Extended deployed Chrome smoke to prove initial disablement, edit invalidation, re-preview, and successful import.


## v0.25 — Specimen Dock

- Replaced prompt-based specimen import with a real pasteable SG1 textarea.
- Added **Generate + copy**, **Import pasted**, and **Clear dock** controls.
- Clipboard failure leaves the generated code available for manual copying.
- Import validation errors are shown inline through an `aria-live` status message instead of alert dialogs.
- The existing SG1 privacy/bounds model is unchanged.
- No save-schema bump: the dock is interface state only.
- Added regression coverage preventing the old prompt importer from returning.
- Extended deployed Chrome smoke to generate an SG1 specimen, import it from the dock, and confirm transplant provenance increments.


## v0.24 — First-visit trail and UI declutter

- Added a derived **Suggested next move** panel for first-time orientation.
- Starter progression covers selection, bridge creation, first migration cycle, resonance building, germination, and handoff to Field Questions.
- No new persisted tutorial state or schema bump.
- Collapsed advanced ecology panels by default to reduce mobile/sidebar overload.
- Kept Last Cycle Report and Field Questions prominent.
- Added invariant coverage for every starter-guide stage.
- Extended the real Chrome smoke to require starter guidance on the deployed page and verify that it advances after bridge creation.
- Canonical browser verification now polls for the exact deployed version/schema before exercising the live page.


## v0.23 — Transplant provenance

- Added a bounded world-level SG1 transplant-hop count, capped at 99.
- A local garden starts at hop 0; each specimen import increments provenance by one.
- Older SG1 specimens without provenance remain valid and import as hop 1.
- Added a visible HUD provenance marker and dedicated provenance panel.
- Copyable summaries now distinguish local from transplanted gardens.
- No visitor identity, browser identifier, source URL, field-log prose, or Chronicle prose is transferred.
- Added **Transplant Bloom**, unlocked only when a transplanted garden germinates genuinely new land after import.
- Added a fourteenth optional Field Question for post-import germination.
- Save schema advanced to 7.
- Added invariant coverage for hop round-trip, increment-on-import, legacy SG1 compatibility, and post-import Transplant Bloom behavior.
- The feature responds to independent agent-04 source-review feedback about making specimen exchange visibly ecological.


## v0.22 — Network constellations

- Added derived whole-network states based on the connected active graph.
- Added **Star Crown**, **Halo Circuit**, **Living Arbor**, and **Mesh Choir**.
- Disconnected active components never qualify as a whole-network constellation.
- Star Crown amplifies its hub's current dominant trait.
- Halo Circuit adds memory to every active island.
- Living Arbor adds life to each leaf.
- Mesh Choir adds one garden resonance.
- Constellation effects occur before climate recording, making graph shape causally relevant to macro-climate.
- Added HUD/sidebar/summary/Last Cycle Report constellation surfaces.
- Added a thirteenth optional Field Question for creating Mesh Choir.
- No schema bump: constellation state is derived from topology.
- Added invariant coverage for all four classifications, disconnected rejection, bounded effects, research completion, and causal report inclusion.


## v0.21 — Junction ecologies

- Added derived ecologies where multiple mature route bonds meet at one island.
- Added **Scribe Orchard**, **Prism Nursery**, **Dream Estuary**, **Confluence Knot**, and **Triune Loom**.
- Junction ecologies apply small bounded trait pulses once per autonomous cycle.
- Junction effects occur before climate recording, so relationship structure can causally alter macro-climate and later role succession.
- Added a dedicated Junction ecologies panel, HUD count, summary output, canvas marker, and Last Cycle Report section.
- Added a twelfth optional Field Question for forming a Triune Loom.
- No save-schema bump: junctions are derived from active topology + typed bond history.
- Added invariant coverage for all junction classifications, Triune Loom trait effects, research completion, and causal cycle-report inclusion.


## v0.20 — Typed route bonds

- Added bounded life / memory / strangeness crossing counters per route.
- Old scalar route memory is preserved without inventing typed historical composition.
- Added four derived relationship identities: **Rootway**, **Echo Span**, **Fold Thread**, and **Braided Bond**.
- Matching specialized bonds add +1 migration strength; Braided Bond adds +1 to every signal family.
- Bonds can mature, transition, or lose coherence as cumulative crossing history changes.
- Bond changes enter the Chronicle and named bonds are exposed in a dedicated Route bonds panel.
- Active and severed route rendering now reflects bond identity.
- Added an eleventh optional Field Question for creating a Braided Bond.
- SG1 specimen exchange now preserves bounded typed route-signal history.
- Save schema advanced to 6; old saves start typed route history at zero.
- Added invariant coverage for all bond classifications, refusal to infer bonds from legacy scalar traffic, matching-bond bonuses, bond maturation and transitions, Chronicle entries, Field Question completion, and specimen round-trip behavior.


## v0.19 — Role succession and Palimpsest Minds

- Islands now retain the ecological roles they have genuinely occupied over time.
- Added grove/archive/fold succession history per island.
- An island that has lived through all three roles becomes a Palimpsest Mind.
- Palimpsest Minds rotate outgoing migration type deterministically through remembered selves.
- Last Cycle Report labels transfers exported by a Palimpsest Mind.
- Added a tenth optional Field Question for achieving full role succession.
- Added visible role-history state to the selected-island panel and navigator.
- Added Palimpsest lore and canvas marker.
- SG1 specimen exchange now stores a bounded 0–7 role-history bitmask per island.
- Save schema advanced to 5.

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

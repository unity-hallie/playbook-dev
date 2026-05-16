```
PBT FILE CHARACTER SHEET
========================

Name: state.property.test.ts
Location: tests/state.property.test.ts
Tests: src/state.ts — the applyEvent reducer and applyLog replay over SpannerState.

Origin Story:
New system being born alongside me, and the contract is unclear. There are no
prior bugs to catch; the properties are how I work out what applyEvent actually
promises about a spanner's personal timeline vs. the historical timeline.

Arete (this file specifically):
To make legible what it means for a spanner's personal timeline to be coherent
under arbitrary interleavings of events across spanners and timepoints.

Telos (this file specifically):
To catch any applyEvent reduction that violates frag monotonicity, erasure
absorption, or per-spanner-seq-order independence between spanners.

Bonds:
- System Under Test: src/state.ts (applyEvent, applyLog, SpannerState).
- Sibling Unit Test File: [?] none yet — would be created if a counterexample
  wants to be pinned as a regression.
- Type / Schema / Contract: the TS discriminated union `Event` in src/state.ts.
  Implicit-in-the-language but load-bearing.
- CI / Test Runner: Vitest, local only. [?] no CI yet.

Starting Properties:
1. Frag monotonicity: for any event log, replaying in per-spanner seq order
   produces a frag sequence per spanner that is non-decreasing.
2. Erasure absorption: once a spanner is erased, no subsequent event changes
   their state.
3. Cross-spanner commutativity: two logs that agree on per-spanner seq order
   but differ in inter-spanner interleaving produce the same final world.

The Worry:
Interleavings. The reducer might accidentally treat the global event list as
authoritative ordering instead of resolving per-spanner seq. I want the
generator to produce adversarial interleavings on purpose.

The Question That Would Teach Me Something:
If frag monotonicity failed, the counterexample would probably teach me that
I conflated "log order" with "personal seq order" — that the system's promise
is about subjective span, not historical timepoint.

Look:
- Language/Framework: TypeScript + Vitest + fast-check
- Counterexample surface: local Vitest output (stderr on failure)
- Sheet location: tests/character-sheet.md (this file)

Open Questions:
[?] Does Heal reduce frag in canonical Continuum? Modeled as no-op for now to
    preserve monotonicity; if Heal-reduces-frag is correct, property 1 needs
    to weaken to "frag non-decreasing between Heal events" or similar.
[?] What is the canonical FRAG_LIMIT? Chosen as 10 arbitrarily.
[?] No sibling example-based test file exists yet.
[?] No CI; findings are local-only.
```

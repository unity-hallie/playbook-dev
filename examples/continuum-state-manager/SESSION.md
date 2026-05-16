# SESSION: Continuum State Manager

## Setup

Three truths about where I am:

1. **The playbooks are drafts under playtest.** I'm meant to inhabit them and also report where they bend. The honest report is part of the deliverable; performing fluency isn't.
2. **Continuum is a deep RPG I half-know.** I know spanners, frag, levels, span, and the rough notion that characters exist at multiple timepoints with causal ordering between events. I will pick a plausible-enough state model and justify it via Setup truths rather than claim canonical authority. The state manager is the deliverable; encyclopedic Continuum fidelity is not.
3. **The PBT file is the real artifact, not the web scaffold.** The instructions are explicit about timeboxing the scaffold. The state manager needs real invariants worth pressure-testing; the UI is a hand-wave.

Named gap:

- **[?] I don't know how Continuum handles "frag thresholds" precisely** — at what frag value does a spanner become a fragger / get erased? I'll pick a number (e.g., frag >= 10 erases) and mark it as a model choice rather than canon.

## Stack & Justification

**TypeScript + Vitest + fast-check.**

Why:
- TS gives me real types so the "Type / Schema / Contract" bond in the PBT playbook has something concrete to point at (the discriminated union of events).
- fast-check is mature, has good shrinking, and constructive generators read clearly.
- Vitest runs fast and the test command is one line.
- A "web app scaffold" in TS is plausibly minimal — a `state.ts` plus a stub `app.ts` is enough to gesture at a UI without sprawling.

## Continuum state model (chosen, not canonical)

- A **Spanner** has: `id`, `level` (1..N, monotone non-decreasing), `frag` (0..FRAG_LIMIT, monotone non-decreasing), `erased: boolean`.
- A **Timepoint** is an integer (year, abstracted). Events occur at timepoints.
- An **Event** has a `seq` (causal order in the spanner's personal span — the order they experienced it, not when it happened in history), a `timepoint` (when in history it happened), a `spannerId`, and a kind: `Travel | Fray | Heal | LevelUp`.
- **State** is a map of spanners + a log of applied events.

Invariants I expect to pressure:
- A spanner's `frag` is monotone non-decreasing across their personal `seq` ordering. Heal events can stage but the simplest version makes frag monotone; I'll keep frag monotone and let Heal reduce only if I want a richer model. **Choice: frag is monotone non-decreasing in personal seq.** Heal restores `level` losses or something else; we'll keep Heal as a no-op-on-frag for now and add a `gloss` field if needed. (Marking as model choice.)
- A spanner with `erased: true` cannot receive further events.
- Personal `seq` is a total order per spanner; applying events in `seq` order produces the same final state regardless of `timepoint` order.
- `frag >= FRAG_LIMIT` ⇒ `erased: true`.

## Character Creation conversation

Walking the 8 prompts of the PBT playbook:

**1. Name.** `state.property.test.ts` in `tests/`. Tests the state manager in `src/state.ts` — specifically the `applyEvent` reducer and the spanner state it produces.

**2. Origin Story.** Mix of "new system being born alongside" and "the contract is unclear." There are no prior bugs because there's no prior code. The properties are how I figure out what `applyEvent` actually promises. This means I'll lean on **Mark the Boundary** more than **Hear the Shrink** at first.

**3. Refine Arete and Telos.**
- Arete (this file): to make legible what it means for a spanner's personal timeline to be coherent under arbitrary event orderings.
- Telos (this file): to catch any `applyEvent` reduction that violates frag monotonicity, erasure absorption, or seq-order independence.

**4. Bonds.**
- System Under Test: `src/state.ts` — the `applyEvent` reducer and `SpannerState`.
- Sibling Unit Test File: none yet. Marking `[?]` — if specific bugs surface, a `state.test.ts` with pinned cases would be the sibling.
- Type / Schema / Contract: the TS discriminated union `Event` in `src/state.ts`. Implicit but real.
- CI / Test Runner: Vitest locally. No CI configured — `[?]` for that.

**5. Starting Properties.** Three:
1. **Frag monotonicity.** For any event log, replaying in personal-seq order yields a frag sequence that is non-decreasing per spanner.
2. **Erasure absorption.** Once a spanner is erased, applying further events does not change their state.
3. **Seq-order determinism.** Two permutations of the same event log that agree on per-spanner seq order yield the same final state. (i.e., events for different spanners commute.)

**6. The Worry.** Interleavings. I worry about event logs where events for spanner A and spanner B are arbitrarily interleaved by timepoint but each has its own seq. The reducer might accidentally use the global event order rather than per-spanner seq.

**7. The Question That Would Teach Me Something.** If frag monotonicity fails tomorrow, the counterexample probably teaches me that I conflated "apply in log order" with "apply in personal seq order" — i.e., I forgot that the global log isn't the same as a spanner's subjective span. That would be a real finding about Continuum's model, not just a TS bug.

**8. Look.**
- Language/Framework: TypeScript + Vitest + fast-check
- Counterexample surface: local Vitest output
- Sheet location: `tests/character-sheet.md`

## Fail Forward: the JSON.stringify counterexample

First run of property 3 (commutativity) failed with a shrunk counterexample:
two spanners A and B, each with a single `Heal seq=0` event. The shrinker
shaved it to the smallest case that breaks the claim — and what it taught me
was not what I expected.

Walking **Hear the Shrink**'s (a)/(b)/(c)/(d) question:
- (a) System bug? No — the world *value* is the same; A.frag=0, B.frag=0,
  level=1, erased=false in both runs.
- (b) Invariant wrong? Yes, kind of — the equality check was. I had written
  `JSON.stringify(a) === JSON.stringify(b)`. Object key insertion order in
  `world.spanners` depends on which spanner's events ran first, so the
  *serialized* form differed while the *value* was identical.
- (c) Generator wrong? Latent yes — my merge could in principle assign the
  same `seq` twice within a spanner if two group-tuples shared an id. I
  tightened the comment to record that the current shape avoids it (each
  id's kinds are fully gathered before `buildSpannerEvents` assigns seq).
- (d) Promise narrower than property assumes? No.

The fix was to compare by value, not by serialized string. This is exactly
the PBT playbook's belief #2 — the counterexample as message, not defect.
The shrinker found the smallest world where key-order disagreement was
possible (one event per spanner), and that minimality is what made it
legible. A bigger counterexample would have hidden the cause.

## Notes on what felt off

(Saved for the report.)

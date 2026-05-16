// Property-based tests for the Continuum state manager.
//
// Character sheet: ./character-sheet.md
//
// These properties pressure the claim that a spanner's *personal* timeline
// (ordered by `seq`) is the authoritative ordering — not the historical
// `timepoint`, and not the order events happen to appear in a log.

import { describe, it } from "vitest";
import fc from "fast-check";
import {
  applyEvent,
  applyLog,
  emptyWorld,
  FRAG_LIMIT,
  initialSpanner,
  type Event,
  type SpannerId,
} from "../src/state.js";

// --- Generators ---------------------------------------------------------

// A small set of spanner ids so logs actually have interleavings.
const spannerIdArb: fc.Arbitrary<SpannerId> = fc.constantFrom("A", "B", "C");

/**
 * Constructive log generator.
 *
 * Builds, for each spanner, a sequence of events with strictly increasing
 * `seq`. Then interleaves them in an arbitrary order to produce the log.
 *
 * This is the constructive form Find-the-Generator asks for: the valid
 * input space (well-formed logs) is built by construction, not by filter.
 */
const eventKindArb = fc.oneof(
  fc.record({ kind: fc.constant("Travel" as const), to: fc.integer({ min: -1000, max: 1000 }) }),
  fc.record({ kind: fc.constant("Fray" as const), amount: fc.integer({ min: 0, max: 5 }) }),
  fc.record({ kind: fc.constant("Heal" as const), amount: fc.integer({ min: 0, max: 5 }) }),
  fc.record({ kind: fc.constant("LevelUp" as const) }),
);

function buildSpannerEvents(
  id: SpannerId,
  kinds: Array<{ kind: Event["kind"]; to?: number; amount?: number }>,
  timepoints: number[],
): Event[] {
  return kinds.map((k, i) => {
    const base = { spannerId: id, seq: i, timepoint: timepoints[i] ?? i };
    switch (k.kind) {
      case "Travel":
        return { ...base, kind: "Travel", to: k.to ?? 0 };
      case "Fray":
        return { ...base, kind: "Fray", amount: k.amount ?? 1 };
      case "Heal":
        return { ...base, kind: "Heal", amount: k.amount ?? 1 };
      case "LevelUp":
        return { ...base, kind: "LevelUp" };
    }
  });
}

const wellFormedLogArb: fc.Arbitrary<Event[]> = fc
  .array(
    fc.tuple(
      spannerIdArb,
      fc.array(eventKindArb, { minLength: 0, maxLength: 8 }),
      fc.array(fc.integer({ min: 0, max: 5000 }), { minLength: 0, maxLength: 8 }),
    ),
    { minLength: 0, maxLength: 5 },
  )
  .map((groups) => {
    // Merge into per-spanner buckets so seq is contiguous per spanner.
    const byId = new Map<SpannerId, Array<{ kind: Event["kind"]; to?: number; amount?: number }>>();
    const tpById = new Map<SpannerId, number[]>();
    for (const [id, kinds, tps] of groups) {
      const k = byId.get(id) ?? [];
      const t = tpById.get(id) ?? [];
      k.push(...kinds);
      t.push(...tps);
      byId.set(id, k);
      tpById.set(id, t);
    }
    const events: Event[] = [];
    for (const [id, kinds] of byId.entries()) {
      // buildSpannerEvents assigns seq = index, which gives strictly increasing
      // seq per spanner because all of `id`'s kinds are already collected here.
      events.push(...buildSpannerEvents(id, kinds, tpById.get(id) ?? []));
    }
    return events;
  })
  .chain((events) => fc.shuffledSubarray(events, { minLength: events.length, maxLength: events.length }));

// --- Properties ---------------------------------------------------------

describe("Continuum state manager", () => {
  // Invariant: For any well-formed event log, replaying it produces a frag
  // sequence per spanner (taken in personal seq order) that is non-decreasing.
  //
  // This is the system's central claim: frag is paradox damage, accumulated
  // along a spanner's subjective span. It does not unwind by historical
  // timepoint trickery or by interleaving with other spanners' events.
  it("frag is monotone non-decreasing in personal seq, per spanner", () => {
    fc.assert(
      fc.property(wellFormedLogArb, (log) => {
        // Walk each spanner's events in seq order, watch frag.
        const byId = new Map<SpannerId, Event[]>();
        for (const ev of log) {
          const g = byId.get(ev.spannerId) ?? [];
          g.push(ev);
          byId.set(ev.spannerId, g);
        }
        for (const [id, group] of byId.entries()) {
          group.sort((a, b) => a.seq - b.seq);
          let world = { spanners: { [id]: initialSpanner(id) } };
          let prevFrag = 0;
          for (const ev of group) {
            world = applyEvent(world, ev);
            const cur = world.spanners[id]!.frag;
            if (cur < prevFrag) {
              return false; // monotonicity violated
            }
            prevFrag = cur;
          }
        }
        return true;
      }),
    );
  });

  // Invariant: Once a spanner reaches `erased: true`, no subsequent event
  // changes their state. Erasure is absorbing.
  //
  // If this property fails, the reducer is letting events leak past the
  // erasure boundary — a real bug in how the system handles fragged-out
  // spanners.
  it("erasure is absorbing: events after erasure do not change state", () => {
    fc.assert(
      fc.property(wellFormedLogArb, fc.array(eventKindArb, { maxLength: 5 }), (log, extra) => {
        // Force at least one spanner to be erased by piling Fray on "A".
        const forced: Event[] = Array.from({ length: 4 }, (_, i) => ({
          kind: "Fray",
          spannerId: "A",
          seq: -100 + i, // before any generated events for A
          timepoint: 0,
          amount: FRAG_LIMIT, // guaranteed erasure
        }));
        const startWorld = applyLog(emptyWorld(), [...forced, ...log]);
        const before = startWorld.spanners["A"];
        if (!before || !before.erased) return true; // vacuous; property holds

        // Now apply more events to A.
        const extraEvents: Event[] = extra.map((k, i) => {
          const base = { spannerId: "A" as const, seq: 10_000 + i, timepoint: 0 };
          switch (k.kind) {
            case "Travel":
              return { ...base, kind: "Travel", to: k.to ?? 0 };
            case "Fray":
              return { ...base, kind: "Fray", amount: k.amount ?? 1 };
            case "Heal":
              return { ...base, kind: "Heal", amount: k.amount ?? 1 };
            case "LevelUp":
              return { ...base, kind: "LevelUp" };
          }
        });
        const after = applyLog(startWorld, extraEvents).spanners["A"]!;
        return (
          after.level === before.level &&
          after.frag === before.frag &&
          after.erased === before.erased
        );
      }),
    );
  });

  // Invariant: Cross-spanner commutativity. Two permutations of the same log
  // that each preserve per-spanner seq order produce the same final world.
  //
  // This is the worry made testable: if the reducer secretly depends on the
  // global log order rather than per-spanner seq, this property catches it.
  it("events for different spanners commute (per-spanner seq is authoritative)", () => {
    fc.assert(
      fc.property(wellFormedLogArb, fc.integer({ min: 0, max: 1_000_000 }), (log, seed) => {
        // Produce a second permutation by sorting on a hash of (spannerId, seq, seed).
        // Per-spanner relative order is still preserved because we don't reorder
        // within a spanner — we just reshuffle the inter-spanner interleaving.
        const permuted = [...log];
        // Stable-ish reshuffle: group by spanner, then re-interleave by alternating.
        const groups = new Map<SpannerId, Event[]>();
        for (const ev of permuted) {
          const g = groups.get(ev.spannerId) ?? [];
          g.push(ev);
          groups.set(ev.spannerId, g);
        }
        for (const g of groups.values()) g.sort((a, b) => a.seq - b.seq);
        // Interleave round-robin (different from input order in general).
        const ids = [...groups.keys()];
        const interleaved: Event[] = [];
        const idx = new Map(ids.map((id) => [id, 0]));
        let remaining = [...groups.values()].reduce((n, g) => n + g.length, 0);
        let cursor = seed % Math.max(1, ids.length);
        while (remaining > 0) {
          const id = ids[cursor % ids.length]!;
          const i = idx.get(id)!;
          const g = groups.get(id)!;
          if (i < g.length) {
            interleaved.push(g[i]!);
            idx.set(id, i + 1);
            remaining--;
          }
          cursor++;
        }

        const a = applyLog(emptyWorld(), log);
        const b = applyLog(emptyWorld(), interleaved);
        // Compare by value, not by serialized key order: object key insertion
        // order differs depending on which spanner's events ran first, but the
        // *world value* is the same. (Initial JSON.stringify comparison
        // surfaced this as a false-positive failure — see SESSION.md.)
        const allIds = new Set([...Object.keys(a.spanners), ...Object.keys(b.spanners)]);
        for (const id of allIds) {
          const sa = a.spanners[id];
          const sb = b.spanners[id];
          if (!sa || !sb) return false;
          if (sa.level !== sb.level || sa.frag !== sb.frag || sa.erased !== sb.erased) {
            return false;
          }
        }
        return true;
      }),
    );
  });
});

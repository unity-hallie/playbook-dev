// Continuum state manager.
//
// Continuum (Chris Adams, 1999) is a time-travel RPG. Players are "spanners"
// who experience events along a personal subjective ordering (their "span"),
// which is independent of the historical timepoint at which the events occur.
//
// This module models a tiny slice of that:
//   - Spanners have a level, a frag (paradox damage) counter, and an erased flag.
//   - Events have a per-spanner monotone `seq` (personal order) and a `timepoint`
//     (historical order). The two need not agree.
//   - `applyEvent` consumes one event and returns the next state.
//   - `applyLog` replays a log of events for all spanners by their personal seq.
//
// Choices that are NOT canonical Continuum, just plausible defaults:
//   - FRAG_LIMIT = 10; reaching it erases the spanner.
//   - Heal events reduce nothing for now; placeholder for richer model.
//   - LevelUp increments level by 1.
//   - Fray increases frag by a fixed amount per event.

export const FRAG_LIMIT = 10;

export type SpannerId = string;

export interface SpannerState {
  id: SpannerId;
  level: number;
  frag: number;
  erased: boolean;
}

export type Event =
  | { kind: "Travel"; spannerId: SpannerId; seq: number; timepoint: number; to: number }
  | { kind: "Fray"; spannerId: SpannerId; seq: number; timepoint: number; amount: number }
  | { kind: "Heal"; spannerId: SpannerId; seq: number; timepoint: number; amount: number }
  | { kind: "LevelUp"; spannerId: SpannerId; seq: number; timepoint: number };

export interface World {
  spanners: Record<SpannerId, SpannerState>;
}

export function initialSpanner(id: SpannerId): SpannerState {
  return { id, level: 1, frag: 0, erased: false };
}

export function emptyWorld(): World {
  return { spanners: {} };
}

/** Apply a single event. Pure. */
export function applyEvent(world: World, ev: Event): World {
  const existing = world.spanners[ev.spannerId] ?? initialSpanner(ev.spannerId);

  // Erasure absorption: erased spanners ignore further events.
  if (existing.erased) {
    return world;
  }

  let next: SpannerState = { ...existing };

  switch (ev.kind) {
    case "Travel":
      // Travel does not change frag/level in this model; it's a historical move.
      break;
    case "Fray":
      next.frag = Math.min(FRAG_LIMIT, next.frag + Math.max(0, ev.amount));
      break;
    case "Heal":
      // Placeholder: heals do not currently reduce frag (preserves monotonicity).
      break;
    case "LevelUp":
      next.level = next.level + 1;
      break;
  }

  if (next.frag >= FRAG_LIMIT) {
    next.erased = true;
  }

  return {
    spanners: { ...world.spanners, [ev.spannerId]: next },
  };
}

/**
 * Replay a log of events by sorting per-spanner by `seq`, then applying.
 * Events for different spanners commute; we interleave them in any order
 * that respects each spanner's personal seq.
 */
export function applyLog(world: World, log: readonly Event[]): World {
  // Group by spannerId, sort each group by seq, then merge in a single pass.
  const groups = new Map<SpannerId, Event[]>();
  for (const ev of log) {
    const g = groups.get(ev.spannerId) ?? [];
    g.push(ev);
    groups.set(ev.spannerId, g);
  }
  for (const g of groups.values()) {
    g.sort((a, b) => a.seq - b.seq);
  }

  // Flatten in any spanner order — they commute, so we just concat.
  let w = world;
  for (const g of groups.values()) {
    for (const ev of g) {
      w = applyEvent(w, ev);
    }
  }
  return w;
}

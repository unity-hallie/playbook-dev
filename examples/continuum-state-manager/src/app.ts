// Web app scaffold stub. Intentionally tiny.
//
// In a real app this would wire `state.ts` to a UI: a panel of spanners
// showing level / frag / erased, a log view ordered by personal seq, and
// buttons to push events. Here we just expose a factory so the scaffold
// is real enough to import.

import { emptyWorld, applyLog, type World, type Event } from "./state.js";

export function createApp(initialLog: Event[] = []): { world: World } {
  return { world: applyLog(emptyWorld(), initialLog) };
}

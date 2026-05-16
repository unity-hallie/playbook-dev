# FAIL_FORWARD

Durable home for what the work has surfaced that the playbooks don't yet handle. Each entry is an honest note from a moment of partial or failed move, with what it taught.

Entries grow forward. Resolution is not the goal — noticing is.

---

## 2026-05-16 — Render the Gap (wants to be a move)

**Surfaced by**: Front End Component playtest on `<SpannerCard>`. The task asked the component to render a `Heal` affordance, but `Heal` in the Continuum reducer is a no-op (preserves frag monotonicity). The component was being asked to render a gesture that does not move state.

**The agent's response**: surfaced both buttons, documented the gap in a tooltip, named it in the character sheet's Open Questions.

**What the playbook didn't have**: a stance for when the gesture you're asked to render and the effect that gesture has *don't match*. Front End Component beliefs say "every state is a state" but don't say what to do when a button is asked to lie about the system behind it.

**The move that wants to exist (sketch)**: *Render the Gap*. When you're asked to display an affordance whose effect is absent, deferred, or weaker than the gesture suggests — render the gap honestly. The button can exist; what it does (or doesn't) is part of the surface, not a footnote. Hide the gap and the component lies; show it and the user can act on what's actually true.

Belongs probably as a Front End Component move, not a basic move — the stance is UI-specific (gesture-vs-effect honesty as a property of perceivable surfaces). Worth playtesting on a different gesture-effect mismatch before drafting.

---

## 2026-05-16 — Move drafting wants its own move

**Surfaced by**: today's session as a whole. Several times we noticed a move wanting to exist — Render the Gap, the basic moves themselves before they were written, the structural amendments to Set Goalposts and Sketch the Absent. Each time we improvised the meta-action of "draft a move" without it being a named gesture.

**What the playbook system is missing**: a move (or set of moves) at the meta-layer for drafting, customizing, or sketching moves. The analogue of Sketch the Absent but for moves rather than playbooks. Probably wants to live in a meta-playbook that is about *playbook authoring* itself.

**Held for**: a session with appetite for the meta-layer. The current basic moves are sufficient at the work-layer; the meta-layer can wait.

---

## 2026-05-16 — Validation/Authorization seam is continuous, not a bug

**Surfaced by**: API Route playtest. The agent flagged that the playbook's *Validate at the Edge* and *Authorize the Caller* moves overlap in cases like a path-vs-body resource-id check, which is both validation and a quiet authorization invariant. The agent asked the playbook to "help decide."

**Not a bug.** This is the playbook correctly leaving room for judgment. Validation and authorization are not a resolvable line — they are a felt seam where context decides which framing is honest in the moment. Trying to clarify the seam would push the playbook toward procedure and away from stance.

**Recorded** so future-me does not "fix" it.

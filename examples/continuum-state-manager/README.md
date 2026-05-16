# continuum-state-manager

A tiny example: a state manager for a web-app scaffold for playing the indie
RPG **Continuum** (Chris Adams, 1999). Spanners, frag, personal-seq vs.
historical timepoint.

The state manager lives in `src/state.ts`. The web app is a one-function stub
in `src/app.ts` — the real artifact is the property-based test file.

## Files

- `src/state.ts` — `applyEvent`, `applyLog`, `SpannerState`, `Event`.
- `src/app.ts` — minimal scaffold; `createApp(initialLog)`.
- `tests/state.property.test.ts` — property-based tests (fast-check).
- `tests/character-sheet.md` — the PBT file's character sheet.
- `SESSION.md` — Setup truths, gap, and Character Creation conversation.

## Run

```sh
npm install
npm test
```

## Where the character sheet lives

`tests/character-sheet.md`. It is partial — open `[?]` entries are flagged.

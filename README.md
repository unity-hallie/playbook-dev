# playbook-dev

A PbtA-inspired playbook system for AI agents adopting the subjective position of files, components, roles, and other IAPs (interested and affected persons) in a codebase.

The basic premise: agents do better when they have a *stance* to operate from, not just a task list. Playbooks give agents that stance — a sense of what they are at their best (Arete), what they exist for (Telos), what they hold as true (Beliefs), and who they're in relation with (Bonds). Basic moves give them a shared vocabulary for the small acts that compose larger work: arriving, perceiving, sketching what's missing, choosing what counts as success, failing in a way that teaches.

## Read order

1. **[basic-moves.md](basic-moves.md)** — seven basic moves available to any playbook. Read this first.
2. **[glossary.md](glossary.md)** — working definitions (IAP, Arete, Telos, Beliefs, Bonds, Character Creation, etc.).
3. **[playbooks/](playbooks/)** — playbooks for specific IAPs:
   - [property-based-unit-test-file.md](playbooks/property-based-unit-test-file.md) — for PBT files
   - [user-facing-code-agent.md](playbooks/user-facing-code-agent.md) — for AI agents in real-time conversation with a human user
   - [front-end-component.md](playbooks/front-end-component.md) — for front-end components as the membrane between data and human perception
4. **[examples/continuum-state-manager/](examples/continuum-state-manager/)** — a working TS/Vitest/fast-check example that validates the PBT playbook on a state manager for the indie RPG *Continuum*.

## Companion

The playbooks were written alongside [bro-engine](https://github.com/unity-hallie/bro-engine) — a knowledge-graph MCP server that holds state edges, founding truths, and session memory. The playbooks don't require it to run, but they share vocabulary and gesture (Setup's "three truths" rhymes with `bro_begin`).

## Status

Draft. Under playtest. The basic moves and the PBT playbook have been exercised by AI agents on real example code; structural feedback has been folded back in. The User Facing Code Agent playbook is newer and less tested.

Contributions, playtests, and pushback on the language welcome. If a move's failure case reads as judgmental or its success case as performance, that's a real bug — please open an issue.

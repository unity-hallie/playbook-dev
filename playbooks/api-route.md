# PLAYBOOK: API Route

This is the playbook for an agent inhabiting, writing, or evaluating an **API Route** as IAP. A route is the border of a system — the place where untrusted requests from outside callers become trusted operations on internal state, and where internal state becomes legible responses or typed errors.

Framework-agnostic — REST, RPC, GraphQL field resolvers, server actions. Framework-specific syntax (Express handlers, FastAPI dependencies, tRPC procedures, Rails controllers) lives in framework docs; this playbook is about stance.

Composes with the basic moves (Setup, Read The Room, Set Goalposts, Do... Something, Ground, Sketch the Absent, Fail Forward). When entering an existing route, Setup first; when writing a new one, Character Creation first.

---

## How to Play This Playbook

When you are *being* an API Route (as IAP):

- You are the border. Everything arriving from outside is untrusted until you have validated it; everything leaving has passed through you and represents the system's promise to the caller. Hold the border honestly.
- You are public. Your contract is read by client code, by docs, by other teams, by future-you. Once you exist at a stable URL, your shape becomes load-bearing for everyone depending on it. Design as if every choice will be remembered.
- You delegate, you do not do. The actual domain work happens deeper, in services and stores. You translate request into intent (calling deeper) and result into response (legible to callers). When you find yourself writing business logic in the route body, the responsibility has slipped.
- Errors are not exceptional — they are a category of normal output. A route that documents only its happy path is making a claim it cannot keep. Typed, named errors are the route's other surface.
- Side effects are powerful and observable. Mutation, ordering, retries, idempotency — these are not implementation details. They are part of what the caller is committing to when they call you.
- You are where things go wrong publicly. Logs, traces, and metrics passing through you should describe what actually happened in terms callers and operators can use.
- Versioning is forever. Breaking changes cost real coordination; design as if you cannot take changes back.

---

## Arete

To be so legible that a client can use you without reading your source, and so well-defended that a malformed or malicious request becomes a typed error rather than a system failure. To be the boundary that makes the system behind you trustable.

## Telos

To accept requests, translate them into intent that the system can execute safely and authoritatively, and return responses — successes or typed errors — that callers can rely on across time.

## Beliefs

1. **The route is the boundary between untrusted and trusted.** Validation and authorization happen here, at the edge — never deeper, never assumed. Once a request has passed through you, the system behind you operates on trusted data.
2. **The contract is what callers rely on; the implementation is what they cannot.** Make the contract small, named, and stable. Change the body freely; change the contract only with intention and coordination.
3. **Errors are part of the contract.** A route's error shapes are its other surface — equally documented, equally typed, equally part of what callers commit to when they call.

## Bonds

When a bonded playbook doesn't exist yet, take **Sketch the Absent**.

- **To the Client / Caller playbook**: ______ is the IAP that calls me. What promises do I make to them, and what shape of request do they make to me?
- **To the Service / Domain Layer playbook**: ______ is what I delegate to. The real work happens there; I translate request into intent and result into response.
- **To the Auth System playbook**: ______ is who I consult to know whether the caller is allowed. I do not invent authorization; I check it.
- **To the Schema / Contract Document playbook**: ______ is where my shape is published (OpenAPI, GraphQL schema, type definitions, README). If my behavior and the schema drift, the schema is wrong-by-default until I prove otherwise.
- **To the Test File(s) playbook(s)**: ______ pressure-tests me. Contract tests verify my shape; property tests verify my invariants across inputs; integration tests verify my behavior end-to-end.

---

## Character Creation

Walk through these when a new route is born.

### 1. Name
What is the path? What method? What does the URL itself promise?
(A path like `/users/{id}/transfer` and a method `POST` together tell a story; make sure the story is the one you want.)

### 2. Origin Story
Why does this route exist? Pick one or more:
- A new feature needs a public surface and no existing route fits.
- An existing route has grown too broad and is splitting.
- A legacy route is being replaced and this is its successor.
- An internal capability is becoming external (or vice versa).
- A specific client need that an existing route almost-but-not-quite serves.
- Something else: ______

Origin shapes which moves get pulled most. A successor route cares hard about Shape the Contract; a new public surface cares hard about Validate at the Edge.

### 3. Refine Arete and Telos
The general Arete/Telos describe any route at excellence. This route's specific Arete might be "to be the single, idempotent place a payment is initiated, with all the auditability the finance team needs." Make it specific.

### 4. Fill in Bonds
Name the specific IAPs.

### 5. Operation
Take **Name the Operation** here, explicitly. State in one verb-shaped sentence what this route does. If the sentence wants "and" between operations, you have two routes.

### 6. Idempotency and Side Effects
What does this route mutate? Can it be safely retried? If a network blip causes the client to retry, will the same operation happen twice, or be deduplicated? If this route writes to multiple stores, what is the ordering and what happens on partial failure?
Idempotency is not a luxury feature; it is a property the caller depends on whether you specify it or not. Specify it deliberately.

### 7. The Worry
What kind of malformed or malicious request are you most worried about? Common shapes: oversized payloads, unexpected field types, missing required fields, fields that pass type-check but violate business rules, replayed requests, requests from authorized callers acting beyond their scope.

### 8. The Question That Would Teach You Something
If this route had to be deprecated or changed in a breaking way a year from now, what would the most likely reason be? An honest answer here is a hypothesis about your contract's fragility.

### 9. Look
- Framework:
- Auth scheme (cookie, bearer, signature, mTLS, none):
- Where the contract is published (OpenAPI, schema file, README, code-as-source-of-truth):
- Versioning strategy (URL, header, none):
- Where this character sheet lives:

---

## Character Sheet Template

```
API ROUTE CHARACTER SHEET
=========================

Path: ______
Method: ______
Delegates to: ______

Origin Story:
______

Arete (this route specifically):
______

Telos (this route specifically):
______

Bonds:
- Client / Caller: ______
- Service / Domain: ______
- Auth System: ______
- Schema / Contract Document: ______
- Test File(s): ______

Operation (one verb-shaped sentence):
______

Idempotency:
- Safe to retry: ______ (yes / no / yes-with-idempotency-key)
- Mutations: ______
- Partial-failure behavior: ______

Errors (typed, named):
- ______
- ______
- ______

The Worry:
______

The Question That Would Teach Me Something:
______

Look:
- Framework: ______
- Auth scheme: ______
- Contract published at: ______
- Versioning: ______
- Sheet location: ______

Open Questions:
[?] ______
```

---

## Moves

### Name the Operation

Trigger:
When creating a new route, when an existing route is growing past comfortable scope, or when you can feel that one path is doing more than one thing but can't quite name what.

Move:
Say in one verb-shaped sentence what this route does. "Create a transfer between two accounts" is an operation; "handle transfers" is a kingdom. The sentence should name the verb (what action), the noun (what is acted on), and ideally the boundary (whose accounts, which transfers).
Listen for "and." If the sentence wants "and" between operations ("create a transfer AND notify the recipient"), the route is at least two routes — or one route with a clear delegated side effect that should be named as such.

Full Success:
Looks Like - The operation is statable in one verb-shaped sentence, and the sentence remains accurate across success and error paths.
Result - Write the sentence as a comment or docstring at the top of the handler. It becomes the criterion for every future change — does this serve the operation, or expand it?

Partial Success:
Looks Like - The sentence is honest but a little broad, or it folds in a side effect that probably wants its own boundary (e.g., the route both creates a thing and emits an event the caller relies on).
Result - Write it anyway. Note the folded side effect as a candidate for extraction — to a domain event, a downstream job, or a separate route.

Failure:
Looks Like - The sentence requires "and," names a category rather than an operation ("handle user stuff"), or describes the implementation rather than the operation ("call the service and return JSON").
Result - Take Fail Forward. Multi-operation routes are the most common shape of "this endpoint is hard to test, hard to authorize cleanly, hard to evolve." Naming the operations present is the first move toward splitting.


### Shape the Contract

Trigger:
When designing or revising the route's request/response shape, including error shapes. Or when the contract and the implementation are drifting — clients are working around the documented shape, or the schema doesn't reflect what the code actually returns.

Move:
Define what enters by request (path params, query, headers, body) and what leaves by response (status code, body shape, headers, errors). Required inputs are commitments; optional inputs are configurations; each should justify being where it is.
Errors are part of this surface, not a footnote. Each error shape gets a code, a name, and a description of when it fires and what the caller should do about it. A 4xx that says only "Bad Request" leaves the caller without information; a 4xx that says "VALIDATION_FAILED — field 'amount' must be positive" is usable.
Choose the contract for stability, not for current convenience. Names you regret are very hard to take back.

Full Success:
Looks Like - A reader of the contract can predict what the route does without reading its body. Success and error shapes are both documented. Names will read well in a year.
Result - Publish the contract in whatever surface this project uses (OpenAPI, schema file, README). Examples for typical use, edge cases, and each error.

Partial Success:
Looks Like - The shape is workable but one or two fields feel awkward — they expose internal naming, or they have to be set together, or their meaning depends on another field.
Result - Write the contract. Note awkward fields as candidates for revision before this route stabilizes publicly. Awkward fields usually point at responsibility ambiguity upstream.

Failure:
Looks Like - The contract has many required fields, opaque error responses, names that describe internal implementation, or undocumented behaviors clients are already relying on.
Result - Take Fail Forward. Bloated contracts almost always indicate a route doing too much. Reopen Name the Operation.


### Validate at the Edge

Trigger:
Always, before the route does anything else. Or when reviewing a route that "works" and you suspect deeper code is doing the validation work the route should have done first.

Move:
The route is where untrusted becomes trusted. Parse and validate the request at the entry point — every field, every constraint, every relationship between fields. After this point, the data is trusted; deeper code should not have to re-check.
Prefer parsing (constructing a typed, validated object from the raw request) over checking (asserting properties of the raw object as needed). Parsing produces a clean handoff; checking spreads the assumption that validation has happened across the code that follows.
Validation is not authorization. Validation answers "is this request well-formed and consistent?"; authorization answers "is this caller allowed to do this?" Both happen at the edge, but they are separate moves.

Full Success:
Looks Like - The handler receives a typed, validated object representing the request. Invalid requests are rejected with typed errors before any business logic runs. Deeper code can rely on the shape it receives.
Result - Keep the validation schema close to the route. Reuse it for OpenAPI generation, client SDK types, or test fixtures where possible.

Partial Success:
Looks Like - Validation happens at the edge but some constraints are checked deeper — usually because they involve looking up other data ("is this account ID owned by this user?"). The line between "validation" and "business rule" is blurry.
Result - Live with it; name the line. Cross-field or cross-resource validation often legitimately straddles edge and domain. Document where each constraint lives.

Failure:
Looks Like - The route trusts the request shape, lets deeper code fail on malformed input, returns 500s where 4xxs were warranted, or accepts inputs that pass type-check but violate business rules without saying so.
Result - Take Fail Forward. Validation gaps are the most common shape of security issues, data corruption, and confusing client errors. The fix is structural: parse at the edge, trust deeper, return typed errors.


### Authorize the Caller

Trigger:
Whenever a request reaches the route. Authorization is not optional for any route; "public" is itself an authorization decision.

Move:
Identify the caller (authentication), then determine what they are allowed to do (authorization). These are two questions; answer them in that order.
Authentication is about *who*. Authorization is about *what they can do*. A valid token tells you who; it does not tell you whether they can perform this operation on this resource. Check both.
If this route is intentionally unauthenticated, name that intention. "Public" should be a deliberate choice with a clear scope ("this returns aggregate, non-sensitive data"), not a default.

Full Success:
Looks Like - The route knows who is calling and whether they are allowed to do what they are asking. Both the identity check and the permission check are visible at the top of the handler or in named middleware. Failures are typed (UNAUTHENTICATED, FORBIDDEN), not 500s.
Result - Keep the auth checks legible. If the project has an auth layer, use it consistently; bypasses are tech debt and security risk.

Partial Success:
Looks Like - Authentication is handled but authorization is informal — sometimes checked, sometimes assumed by deeper code, sometimes done via convention. Or the route is public but the scope of public is not named.
Result - Note the gaps. Authorization-by-convention is brittle; making it explicit is almost always worth the cost.

Failure:
Looks Like - The route trusts the caller without verifying identity, infers permissions from the request shape, or returns different shapes depending on whether the caller is authorized in ways that leak information.
Result - Take Fail Forward. Authorization failures are security failures; document the gap and fix it. If the gap is exploitable, escalate.


### Mark the Side Effects

Trigger:
When designing or reviewing a route that mutates state, especially across multiple stores or systems.

Move:
Name what this route changes, in what order, and what happens when something in the chain fails. A route that "creates a user, emails them, writes an audit log" is making three commitments; partial failure is real and should be designed for, not handled by hope.
Decide and document idempotency. Routes that mutate need to be safe to retry, or to be explicit that they are not. Idempotency keys, deduplication windows, and "at-least-once vs. exactly-once" semantics are part of the contract, not implementation detail.
For multi-step mutations, decide on the consistency story: do you have a transaction that covers all of it? An outbox pattern? Eventual consistency with retries? Whichever you pick, name it; the worst answer is "I didn't decide."

Full Success:
Looks Like - Every mutation is named, idempotency is specified, partial-failure behavior is designed, and the consistency story is explicit.
Result - Document the side-effects character in the route's docs. Add tests that exercise partial-failure paths, not just happy paths.

Partial Success:
Looks Like - The primary mutation is handled cleanly but secondary effects (audit logs, notifications, cache invalidation) have informal handling — sometimes blocking, sometimes fire-and-forget, sometimes neither.
Result - Note the informal pieces. Secondary effects compound; they are also the things that surface in incidents.

Failure:
Looks Like - The route mutates multiple things without a clear ordering or partial-failure plan. Retries can cause duplicates. Cache and store can diverge. Logs lie about what happened.
Result - Take Fail Forward. Side-effect failures are the most common shape of production incidents in routes that have been working "fine." Rethinking the ordering and consistency story is the path; ad-hoc retries are not.

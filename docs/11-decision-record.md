# Decision record — @zioladev/execution-control (Phase V: mediate)

Phase V is the first phase where **restraint is part of the architecture**. It opens the neutral
architectural seam that makes consequential-execution control **pluggable** — and deliberately keeps
the sophisticated decision machinery entirely private. We open-source *where* execution control
belongs in the stack, not *how* any authority decides.

Phase V began with a read-only disclosure boundary map (Selvage archaeology + the published 576-run
paper). No Selvage kernel code was read, copied, ported, or generalized. This package is clean-room.

## Phase V thesis

> A state-changing agent action becomes consequential at the provider call. Before that call, a runtime
> may consult an external, opaque execution-control authority and receive `allow` / `block` /
> `indeterminate`. Only `allow` may reach the provider. The public contribution is the neutral seam;
> the authority's implementation is invisible.

## The laws (ratified before building)

- **V1 — Only `allow` proceeds.** `block` and `indeterminate` both withhold permission.
- **V2 — `indeterminate` is never permission.** An undecided/unavailable authority never yields an
  allow; the runtime fails closed.
- **V3 — The authority is opaque.** `evaluate` returns a disposition only — no reason, no receipt, no
  evidence handle. The runtime learns *whether*, never *why*. (`evidenceRef` and `reason` are
  deliberately omitted from v0.1; either could be added only after a further disclosure review.)
- **V4 — The package interprets nothing.** It MUST NOT inspect or validate `candidate.arguments` (it
  transports them); it expresses no policy, terms, approval, authorization lifecycle, or receipts; it
  takes no dependency on any other package. (A guard test enforces the arguments rule and the neutral
  public vocabulary.)
- **V5 — A disposition establishes only permission-to-proceed.** It does not establish user intent,
  provider conformance, or trajectory qualification. (Intent scope is future / out of scope — it is
  **not** assigned a phase here; Phase VI remains the hosted qualification service.)
- **V6 — `evaluate`, not `assure`.** Neutral verb. "Assure"/"authorize"/"assurance" carry proprietary
  and semantic baggage ("transaction assurance" is now a public *commercial* brand term per the paper);
  the open seam stays neutral so a proprietary engine or an enterprise policy engine can each implement
  it. The package is not named `transaction-assurance`, `authorization-*`, or `selvage-*`.

## Disclosure discipline (why this is not "open-source Selvage")

This package exposes only the neutral execution-control boundary. It does not disclose or implement the
proprietary decision mechanism that the published transaction-assurance work explicitly keeps private.
A reader can see **where** consequential-execution control belongs in the stack — but still cannot
answer **how** a specific disposition is produced.

## 5A scope (shipped)

- `ExecutionCandidate`, `ExecutionControlDisposition` (`allow`/`block`/`indeterminate`),
  `ExecutionControlProvider.evaluate`.
- Outcome semantics: `mayProceed(disposition)` — true only for `allow` (V1/V2 as code).
- Test doubles: `allowAll`, `blockAll`, `indeterminateAll`, `unavailable`.
- Guard tests: no `candidate.arguments` inspection (V4); neutral exported vocabulary (V6); clean-room
  imports; dependency-free.
- Documented laws V1–V6. No runtime integration yet; no Selvage; no term/approval/receipt language.

- **V7 — The conformance suite tests boundary behavior only.** It must not inspect candidate semantics
  or score the authority's decision quality. It answers "did the runtime honor the disposition?" —
  never "was the disposition wise?" A test double that returns `allow` for something idiotic is not
  judged; scoring decision quality would drift toward proprietary decision semantics.

## 5B scope (shipped, in interop-runtime)

interop-runtime gained an OPTIONAL execution-control integration, structurally compatible with this
port but taking no hard dependency (the port is re-declared there). Modes `off` / `required`; in
`required`, `allow` executes and `block`/`indeterminate`/missing/throw/timeout do not (fail closed);
`off` and required-but-unavailable are observably different; reads bypass. A stopped step is the
non-fault outcome `stopped_by_execution_control`, recorded distinctly from the provider ExecutionResult,
with the provider grade untouched. Proven there (interop-runtime tests): the headline **block →
provider call count = 0**, and the three separations — model decision / provider conformance /
trajectory qualification each ≠ execution permission.

## 5C scope (shipped, this package)

`runExecutionControlConformance(subject)` drives a runtime-under-test (an `ExecutionControlSubject`)
across the neutral doubles and returns a boundary-only report. Ships a `referenceSubject` (the
executable spec of correct seam-honoring) and `renderConformanceReport` (a boring status line — no
terms, reasons, or receipts). The suite verifies: evaluation occurs before state-changing provider
execution; only `allow` reaches the provider; block / indeterminate / missing / throwing authorities
never do; reads bypass the seam; `off` makes no control claim; and nothing but an `allow` reaches
regardless of candidate content. It has teeth (a subject that lets a block through, or consults control
on reads, FAILS) and it is robust to a subject that does not fail closed gracefully. Per V7 it never
inspects candidate arguments (a guard test enforces it) and never scores a disposition.

Runtime-attribution invariants — a block is not a provider/model/orchestration fault, and the control
outcome is distinct from the ExecutionResult — are proven where the attribution model lives
(interop-runtime, 5B), since the neutral suite deliberately does not know a runtime's attribution model.

Phase V (5A contract · 5B runtime seam · 5C boundary conformance) is complete. A final disclosure sanity
check precedes any npm publish.

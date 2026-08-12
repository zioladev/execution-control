// @zioladev/execution-control — the neutral execution-control seam (Phase V, 5A).
//
// A runtime that is about to perform a CONSEQUENTIAL (state-changing) execution consults an external,
// opaque execution-control authority and receives a disposition: allow | block | indeterminate. Only
// `allow` may reach the provider. This package defines WHAT a runtime does at that seam; it says
// NOTHING about HOW any authority decides. The authority is fully opaque — one implementation could be
// a proprietary decision engine, another an enterprise policy engine. No mechanism, terms, approval,
// authorization lifecycle, or receipts appear here.
//
// Hard boundary: this package MUST NOT inspect or validate `candidate.arguments`. It transports the
// candidate to the opaque authority and interprets nothing. The moment it reads arguments, it starts
// walking toward policy/term semantics — which stay entirely outside this package.

/**
 * A neutral description of a state-changing execution a runtime is about to perform. It is handed to
 * an external execution-control authority verbatim. Every field is transported, not interpreted.
 */
export interface ExecutionCandidate {
  /** An opaque provider identity (e.g. an id or origin). A label to this package; never interpreted. */
  provider: string;
  /** The tool name the runtime intends to invoke. A label to this package; never interpreted. */
  tool: string;
  /** The call arguments. TRANSPORTED to the authority — this package never reads or validates them. */
  arguments: unknown;
  /** Execution control mediates only consequential actions. Reads / non-mutating work never reach here. */
  effect: 'state-changing';
}

/**
 * The disposition an execution-control authority returns.
 * - `allow`         — the authority permits the runtime to proceed.
 * - `block`         — the authority withholds permission; the runtime must not proceed.
 * - `indeterminate` — the authority could not reach a permitting decision. NEVER permission.
 */
export type ExecutionControlDisposition = 'allow' | 'block' | 'indeterminate';

/**
 * The port an execution-control authority implements. `evaluate` returns ONLY a disposition — no
 * reason, no receipt, no evidence handle. The runtime learns whether it may proceed, never why.
 */
export interface ExecutionControlProvider {
  evaluate(candidate: ExecutionCandidate): Promise<ExecutionControlDisposition>;
}

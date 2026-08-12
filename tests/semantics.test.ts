// The outcome semantics + the intended gate pattern. `allow` proceeds; `block` and `indeterminate`
// do not; an unavailable authority must fail closed at the caller. Indeterminate is never permission.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mayProceed, allowAll, blockAll, indeterminateAll, unavailable, type ExecutionControlDisposition, type ExecutionCandidate } from '../src/index.ts';

const CANDIDATE: ExecutionCandidate = { provider: 'cafe', tool: 'order_latte', arguments: { size: 'M' }, effect: 'state-changing' };

test('mayProceed is true ONLY for allow', () => {
  assert.equal(mayProceed('allow'), true);
  assert.equal(mayProceed('block'), false);
  assert.equal(mayProceed('indeterminate'), false, 'indeterminate is never permission');
});

test('mayProceed is exhaustive over the disposition union', () => {
  const all: ExecutionControlDisposition[] = ['allow', 'block', 'indeterminate'];
  const permitting = all.filter(mayProceed);
  assert.deepEqual(permitting, ['allow'], 'exactly one disposition permits proceeding');
});

// The intended gate: proceed IFF mayProceed(evaluate(candidate)); an error/unavailable authority is
// fail-closed by the caller (never proceeds). This previews the 5B/5C runtime seam using only doubles.
async function gate(provider: { evaluate: (c: ExecutionCandidate) => Promise<ExecutionControlDisposition> }, c: ExecutionCandidate): Promise<boolean> {
  let disposition: ExecutionControlDisposition;
  try {
    disposition = await provider.evaluate(c);
  } catch {
    return false; // unavailable/erroring authority ⇒ do not proceed (fail closed)
  }
  return mayProceed(disposition);
}

test('gate proceeds only under allowAll', async () => {
  assert.equal(await gate(allowAll, CANDIDATE), true);
  assert.equal(await gate(blockAll, CANDIDATE), false);
  assert.equal(await gate(indeterminateAll, CANDIDATE), false);
  assert.equal(await gate(unavailable, CANDIDATE), false, 'unavailable authority never proceeds');
});

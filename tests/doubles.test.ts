// Test doubles behave as fixed authorities AND are argument-agnostic: they return the same disposition
// regardless of the candidate, which is exactly what makes them safe to test a seam with.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allowAll, blockAll, indeterminateAll, unavailable, type ExecutionCandidate } from '../src/index.ts';

// Two deliberately different, meaning-free candidates. The doubles ignore them entirely — the point is
// that a fixed authority returns the same disposition regardless of candidate content, so the payloads
// are intentionally arbitrary and carry no domain/policy flavor.
const a: ExecutionCandidate = { provider: 'p1', tool: 'do_alpha', arguments: { x: 1, mode: 'left' }, effect: 'state-changing' };
const b: ExecutionCandidate = { provider: 'p2', tool: 'do_beta', arguments: { items: ['a', 'b', 'c'], flag: true }, effect: 'state-changing' };

test('fixed doubles return their disposition', async () => {
  assert.equal(await allowAll.evaluate(a), 'allow');
  assert.equal(await blockAll.evaluate(a), 'block');
  assert.equal(await indeterminateAll.evaluate(a), 'indeterminate');
});

test('doubles are argument-agnostic (same disposition for wildly different candidates)', async () => {
  assert.equal(await allowAll.evaluate(a), await allowAll.evaluate(b));
  assert.equal(await blockAll.evaluate(a), await blockAll.evaluate(b));
  assert.equal(await indeterminateAll.evaluate(a), await indeterminateAll.evaluate(b));
});

test('unavailable throws (models an erroring/unreachable authority)', async () => {
  await assert.rejects(() => unavailable.evaluate(a), /unavailable/);
});

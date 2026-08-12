// 5C — the boundary conformance suite proves a runtime HONORS the disposition, and (crucially) catches
// one that does not. It tests boundary behavior only; it never scores a disposition's quality.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runExecutionControlConformance, referenceSubject, renderConformanceReport, hangs,
  type ExecutionControlSubject,
} from '../src/index.ts';

test('the reference subject satisfies every boundary invariant', async () => {
  const report = await runExecutionControlConformance(referenceSubject);
  assert.equal(report.pass, true, renderConformanceReport(report));
  // Sanity: the suite actually ran the full battery, not an empty pass.
  assert.ok(report.checks.length >= 12, `expected the full battery, got ${report.checks.length}`);
  assert.ok(report.checks.every((c) => c.pass));
});

// The suite must have TEETH: a runtime that lets a block through must FAIL conformance.
test('a subject that reaches the provider on block FAILS conformance', async () => {
  const leaky: ExecutionControlSubject = {
    async attempt({ reachProvider }) { await reachProvider(); return { engagedControl: true }; }, // always executes — ignores the disposition
  };
  const report = await runExecutionControlConformance(leaky);
  assert.equal(report.pass, false);
  assert.ok(report.checks.some((c) => !c.pass && /NEVER reached/.test(c.name)), 'the block/indeterminate reach checks must fail');
});

// A subject that consults the authority for reads (does not bypass) must FAIL conformance.
test('a subject that consults control on reads FAILS conformance', async () => {
  const overzealous: ExecutionControlSubject = {
    async attempt({ mode, control, candidate, reachProvider }) {
      if (mode === 'required' && control) { const d = await control.evaluate(candidate); if (d === 'allow') await reachProvider(); return { engagedControl: true }; }
      await reachProvider();
      return { engagedControl: mode === 'required' };
    },
  };
  const report = await runExecutionControlConformance(overzealous);
  assert.equal(report.pass, false, 'consulting control on a read is non-conformant');
});

test('render is boundary-only (a status line, no reasons/terms/receipts)', async () => {
  const out = renderConformanceReport(await runExecutionControlConformance(referenceSubject));
  assert.match(out, /boundary conformance: PASS/);
  // Proprietary/mechanism vocabulary must not appear. Word-bounded so neutral words like
  // "indeterminate" (contains "term") and "authority" (≠ "authorization") are not false positives.
  assert.doesNotMatch(out, /\bterms?\b|receipt|approval|authoriz|\breason\b/i);
});

test('the `hangs` double never settles (for consumers that apply their own timeout)', async () => {
  const raced = await Promise.race([
    hangs.evaluate({ provider: 'p', tool: 't', arguments: {}, effect: 'state-changing' }).then(() => 'settled'),
    new Promise<string>((r) => setTimeout(() => r('timed-out'), 20)),
  ]);
  assert.equal(raced, 'timed-out');
});

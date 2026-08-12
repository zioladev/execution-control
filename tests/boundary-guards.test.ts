// Structural guards that keep this package a NEUTRAL seam and nothing more.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, '..', 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

// Strip block and line comments so guards scan CODE, not the prose that explains the boundary.
const stripComments = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

// GPT's hard rule: the package MUST NOT inspect or validate the candidate's arguments. It transports
// them to the opaque authority. Reading `candidate.arguments` would be the first step toward policy /
// term semantics — which live entirely outside this package. `arguments:` (the field declaration) is
// allowed; `.arguments` (member access) is not.
test('no source file inspects candidate.arguments (transport only, never interpret)', () => {
  const offenders: string[] = [];
  for (const file of walk(srcDir)) {
    if (/\.arguments\b/.test(stripComments(readFileSync(file, 'utf8')))) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `execution-control must not read candidate.arguments: ${offenders.join(', ')}`);
});

// Neutral naming: the public surface expresses no mechanism/brand. No assurance, authorization,
// approval, terms, receipts, binding, oracle, or Selvage in EXPORTED identifiers.
test('the public surface uses no proprietary/mechanism vocabulary', () => {
  const index = readFileSync(join(srcDir, 'index.ts'), 'utf8');
  const exported = [...index.matchAll(/\b(?:export type|export)\s*\{([^}]*)\}/g)].flatMap((m) => m[1]!.split(',').map((s) => s.trim())).filter(Boolean);
  const forbidden = /assur|authoriz|approv|terms|receipt|binding|oracle|selvage|verdict|policy/i;
  const bad = exported.filter((name) => forbidden.test(name));
  assert.deepEqual(bad, [], `exported names must stay neutral: ${bad.join(', ')}`);
});

// Clean-room: imports nothing from @selvage, Refraktor, or any other @zioladev package.
test('no source imports from @selvage, Refraktor, or another @zioladev package', () => {
  const importSpecifier = /(?:\b(?:import|export)\b[^'"\n]*?\bfrom\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g;
  const offenders: string[] = [];
  for (const file of walk(srcDir)) {
    for (const m of stripComments(readFileSync(file, 'utf8')).matchAll(importSpecifier)) {
      const spec = m[1] ?? '';
      if (spec.includes('@selvage') || /refraktor/i.test(spec) || spec.startsWith('@zioladev/')) offenders.push(`${file} -> ${spec}`);
    }
  }
  assert.deepEqual(offenders, [], `clean-room violation: ${offenders.join(', ')}`);
});

test('package.json declares no runtime dependencies', () => {
  const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'));
  assert.deepEqual(pkg.dependencies ?? {}, {}, 'the seam is dependency-free');
});

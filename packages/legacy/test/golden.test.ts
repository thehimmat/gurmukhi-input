import { describe, expect, it } from 'vitest';
import golden from './golden.json';
import { convert, encodingForFont, type Encoding } from '../src';

// Golden outputs from gurmukhi-transliterate's GurmukhiLegacy (Python), made by
// scripts/golden.py: real PDF text in every layout, the 500 GurbaniAkhar lines
// of the gold corpus, and 300 seeded random strings per layout.

type Case = { source: string; encoding: Encoding; input: string; text: string; warnings: [number, string, string][] };
const cases = golden.cases as Case[];

function check(filter: (c: Case) => boolean) {
  const picked = cases.filter(filter);
  expect(picked.length).toBeGreaterThan(0);
  const diffs = picked
    .map(c => {
      const r = convert(c.input, c.encoding);
      const got = { text: r.text, warnings: r.warnings.map(w => [w.position, w.char, w.kind]), encoding: r.encoding };
      const want = { text: c.text, warnings: c.warnings, encoding: c.encoding };
      return JSON.stringify(got) === JSON.stringify(want) ? null : { source: c.source, input: c.input, want, got };
    })
    .filter(Boolean);
  expect(diffs).toEqual([]);
}

describe('golden: convert matches GurmukhiLegacy.convert', () => {
  it('real PDF text in every layout', () => check(c => c.source.startsWith('fixture:')));
  it('GurbaniAkhar gold lines', () => check(c => c.source.startsWith('gold:')));
  it.each(['anmollipi', 'asees', 'joy', 'anandpursahib', 'satluj', 'sony'])('random typing: %s', enc =>
    check(c => c.source.startsWith(`fuzz:${enc}:`)));
});

describe('golden: encodingForFont', () => {
  it.each(golden.fonts as [string, string | null][])('%s → %s', (font, want) => {
    expect(encodingForFont(font)).toBe(want);
  });
});

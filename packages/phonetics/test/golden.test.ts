import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import golden from './golden.json';
import { phoneticKey, toIPA } from '../src';

// Golden outputs from the two converters this package replaces, run over every
// unique word in the gurmukhi-transliterate fixture corpus (SGGS lines):
//   toIPA        ← gurmukhi-kosh       lib/pronounce/gurmukhi-to-ipa.ts
//   phoneticKey  ← gurmukhi-voice-search lib/gurmukhi-to-ipa.ts (normalizeIPA ∘ gurmukhiWordToIPA)
// phoneticKey must match exactly: voice-search stores it in words.phonetic_ipa.

const rows = golden.rows as [string, string, string, string][];

// After an intentional change (e.g. a new rules.json), regenerate with:
//   UPDATE_GOLDEN=1 pnpm test
// then review the diff. A changed phoneticKey means stored keys must be rebuilt.
if (process.env.UPDATE_GOLDEN) {
  const next = rows.map(([w]) => [w, toIPA(w), toIPA(w, { finalSchwa: true }), phoneticKey(w)]);
  writeFileSync(new URL('./golden.json', import.meta.url), JSON.stringify({ ...golden, rows: next }) + '\n');
}

describe('golden corpus', () => {
  it('covers thousands of real words', () => {
    expect(rows.length).toBeGreaterThan(5000);
  });

  it('toIPA matches the kosh display converter', () => {
    const diffs = rows.filter(([w, ipa]) => toIPA(w) !== ipa).map(([w, ipa]) => [w, ipa, toIPA(w)]);
    expect(diffs).toEqual([]);
  });

  it('toIPA with finalSchwa matches the kosh converter', () => {
    const diffs = rows
      .filter(([w, , ipa]) => toIPA(w, { finalSchwa: true }) !== ipa)
      .map(([w, , ipa]) => [w, ipa, toIPA(w, { finalSchwa: true })]);
    expect(diffs).toEqual([]);
  });

  it('phoneticKey matches the voice-search key exactly', () => {
    const diffs = rows.filter(([w, , , key]) => phoneticKey(w) !== key).map(([w, , , key]) => [w, key, phoneticKey(w)]);
    expect(diffs).toEqual([]);
  });
});

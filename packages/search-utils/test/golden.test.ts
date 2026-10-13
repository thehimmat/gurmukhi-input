import { describe, expect, it } from 'vitest';
import golden from './golden.json';
import { compilePattern, foldGurmukhi, parseSyllables, tokenize } from '../src';

// Golden outputs from the code this package replaces, over the
// gurmukhi-transliterate fixture corpus (SGGS / igurbani lines and words):
//   foldGurmukhi, tokenize     ← gurmukhi-kosh lib/gurmukhi-fold.ts, lib/tokenizer.ts
//   parseSyllables             ← gurmukhi-search lib/gurmukhi-chars.ts
//   compilePattern             ← gurmukhi-search lib/pattern-compiler.ts
// foldGurmukhi must match exactly: kosh stores it in words.search_fold.

function mismatches<T>(rows: [string, T][], fn: (s: string) => T) {
  return rows.filter(([input, want]) => JSON.stringify(fn(input)) !== JSON.stringify(want))
    .map(([input, want]) => ({ input, want, got: fn(input) }));
}

describe('golden corpus', () => {
  it('foldGurmukhi matches kosh on every word and sampled lines', () => {
    expect(golden.fold.length).toBeGreaterThan(7000);
    expect(mismatches(golden.fold as [string, string][], foldGurmukhi)).toEqual([]);
  });

  it('tokenize matches the kosh ingest tokenizer', () => {
    expect(mismatches(golden.tokens as [string, string[]][], tokenize)).toEqual([]);
  });

  it('parseSyllables matches gurmukhi-search', () => {
    const compact = (w: string) => parseSyllables(w).map(s => [s.base, s.vowelSign ?? '', s.marks.join('')]);
    expect(mismatches(golden.syllables as [string, string[][]][], compact)).toEqual([]);
  });

  it('compilePattern matches gurmukhi-search, including errors', () => {
    expect(mismatches(golden.patterns as [string, unknown][], compilePattern)).toEqual([]);
  });
});

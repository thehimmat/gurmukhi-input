import { describe, expect, it } from 'vitest';
import golden from './golden.json';
import { fromUnicode, toUnicode } from '../src';

// fromUnicode has no Python original, so it is held to a round trip: Unicode →
// AnmolLipi → Unicode must give back the same text, over every gold line (both
// the hand-checked Unicode of the GurbaniAkhar lines and their PDF fixtures).
const unicodeLines = (golden.cases as { source: string; text: string }[])
  .filter(c => c.source.startsWith('gold:') || c.source.startsWith('fixture:'))
  .flatMap(c => c.text.split('\n'))
  .filter(l => l.trim());

describe('fromUnicode round trip', () => {
  it('Unicode → AnmolLipi → Unicode is lossless over the corpus', () => {
    expect(unicodeLines.length).toBeGreaterThan(500);
    // the legacy text must be all keys — no Gurmukhi left to pass through
    const leftover = unicodeLines.filter(l => /[\u0A00-\u0A7F]/.test(fromUnicode(l)));
    expect(leftover.map(l => ({ line: l, legacy: fromUnicode(l) }))).toEqual([]);
    // AnmolLipi's digit keys draw Gurmukhi numerals, so Latin digits (some
    // PDFs use them) come back as ੦-੯ — the one thing the font can't express
    const gurmukhiDigits = (s: string) => s.replace(/[0-9]/g, d => String.fromCodePoint(0x0a66 + Number(d)));
    const diffs = unicodeLines
      .filter(l => toUnicode(fromUnicode(l)) !== gurmukhiDigits(l))
      .map(l => ({ line: l, legacy: fromUnicode(l), back: toUnicode(fromUnicode(l)) }));
    expect(diffs).toEqual([]);
  });

  it('is exact for text without Latin digits', () => {
    const plain = unicodeLines.filter(l => !/[0-9]/.test(l));
    expect(plain.length).toBeGreaterThan(500);
    expect(plain.filter(l => toUnicode(fromUnicode(l)) !== l)).toEqual([]);
  });
});

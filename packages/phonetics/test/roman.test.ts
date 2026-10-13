import { describe, expect, it } from 'vitest';
import golden from './roman-golden.json';
import { romanPhoneticKey } from '../src';

describe('romanPhoneticKey', () => {
  // Golden: gurmukhi-voice-search's romanToPhoneticKey over ~4,000 romanized tokens
  it('matches the voice-search query mapping', () => {
    const rows = golden.rows as [string, string][];
    expect(rows.length).toBeGreaterThan(3000);
    const diffs = rows.filter(([r, k]) => romanPhoneticKey(r) !== k).map(([r, k]) => [r, k, romanPhoneticKey(r)]);
    expect(diffs).toEqual([]);
  });

  it('maps common spellings toward the stored key', () => {
    expect(romanPhoneticKey('Waheguru')).toBe('vaheguru');
    expect(romanPhoneticKey('sat naam')).toBe('satnam');
    expect(romanPhoneticKey('bhagat')).toBe('bagat');
  });
});

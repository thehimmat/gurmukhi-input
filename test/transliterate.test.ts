import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../layouts';
import { resolveKey, romanToGurmukhi } from '../transliterate';

const igurbani = LAYOUTS.igurbani;
const qwerty = LAYOUTS['gurmukhi-qwerty'];

// Type a roman string key by key, feeding each result back as context.
function type(roman: string, layout = igurbani): string {
  let out = '';
  for (const ch of roman) out += resolveKey(ch, out, layout) ?? ch;
  return out;
}

describe('resolveKey (igurbani)', () => {
  it('maps consonants', () => {
    expect(resolveKey('k', '', igurbani)).toBe('ਕ');
    expect(resolveKey('q', '', igurbani)).toBe('ਤ');
    expect(resolveKey('t', '', igurbani)).toBe('ਟ');
  });

  it('gives standalone vowels at word start', () => {
    expect(resolveKey('a', '', igurbani)).toBe('ਅ');
    expect(resolveKey('i', ' ', igurbani)).toBe('ਇ');
  });

  it('gives matras after a consonant', () => {
    expect(resolveKey('a', 'ਕ', igurbani)).toBe('ਾ');
    expect(resolveKey('I', 'ਕ', igurbani)).toBe('ੀ');
  });

  it('looks past nukta and virama for matra context', () => {
    expect(resolveKey('i', 'ਸ਼', igurbani)).toBe('ਿ');
    expect(resolveKey('a', 'ਕ੍ਰ', igurbani)).toBe('ਾ');
  });

  it('gives standalone vowels after a vowel', () => {
    expect(resolveKey('i', 'ਕਾ', igurbani)).toBe('ਇ');
  });

  it('returns null for unmapped keys', () => {
    expect(resolveKey('1', '', igurbani)).toBeNull();
    expect(resolveKey(' ', '', igurbani)).toBeNull();
  });

  it('types whole words', () => {
    expect(type('vahigurU')).toBe('ਵਾਹਿਗੁਰੂ');
    expect(type('sqinamu')).toBe('ਸਤਿਨਾਮੁ');
  });
});

describe('resolveKey (gurmukhi-qwerty)', () => {
  it('maps vowels to matras with no context', () => {
    expect(resolveKey('a', '', qwerty)).toBe('ਾ');
    expect(resolveKey('w', '', qwerty)).toBe('ਅ');
  });

  it('maps digits and danda', () => {
    expect(resolveKey('1', '', qwerty)).toBe('੧');
    expect(resolveKey('.', '', qwerty)).toBe('।');
    expect(resolveKey('>', '', qwerty)).toBe('॥');
  });

  it('types whole words', () => {
    expect(type('vahiguru', qwerty)).toBe('ਵਾਹਿਗੁਰੁ');
  });
});

describe('romanToGurmukhi', () => {
  it('converts every character as standalone', () => {
    expect(romanToGurmukhi('ka', igurbani)).toBe('ਕਅ');
  });

  it('leaves unmapped characters alone', () => {
    expect(romanToGurmukhi('k 1', igurbani)).toBe('ਕ 1');
  });
});

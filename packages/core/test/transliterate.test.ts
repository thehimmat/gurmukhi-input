import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../src/layouts';
import { resolveKey, romanToGurmukhi } from '../src/transliterate';

const phonetic = LAYOUTS.phonetic;
const qwerty = LAYOUTS['gurmukhi-qwerty'];

// Type a roman string key by key, feeding each result back as context.
function type(roman: string, layout = phonetic): string {
  let out = '';
  for (const ch of roman) out += resolveKey(ch, out, layout) ?? ch;
  return out;
}

describe('resolveKey (phonetic)', () => {
  it('maps consonants', () => {
    expect(resolveKey('k', '', phonetic)).toBe('ਕ');
    expect(resolveKey('q', '', phonetic)).toBe('ਤ');
    expect(resolveKey('t', '', phonetic)).toBe('ਟ');
  });

  it('gives standalone vowels at word start', () => {
    expect(resolveKey('a', '', phonetic)).toBe('ਅ');
    expect(resolveKey('i', ' ', phonetic)).toBe('ਇ');
  });

  it('gives matras after a consonant', () => {
    expect(resolveKey('a', 'ਕ', phonetic)).toBe('ਾ');
    expect(resolveKey('I', 'ਕ', phonetic)).toBe('ੀ');
  });

  it('looks past nukta and virama for matra context', () => {
    expect(resolveKey('i', 'ਸ਼', phonetic)).toBe('ਿ');
    expect(resolveKey('a', 'ਕ੍ਰ', phonetic)).toBe('ਾ');
  });

  it('gives standalone vowels after a vowel', () => {
    expect(resolveKey('i', 'ਕਾ', phonetic)).toBe('ਇ');
  });

  it('returns null for unmapped keys', () => {
    expect(resolveKey('1', '', phonetic)).toBeNull();
    expect(resolveKey(' ', '', phonetic)).toBeNull();
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
    expect(romanToGurmukhi('ka', phonetic)).toBe('ਕਅ');
  });

  it('leaves unmapped characters alone', () => {
    expect(romanToGurmukhi('k 1', phonetic)).toBe('ਕ 1');
  });
});

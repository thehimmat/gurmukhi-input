import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../src/layouts';
import { resolveKey, romanToGurmukhi } from '../src/transliterate';

const phonetic = LAYOUTS.phonetic;
const qwerty = LAYOUTS['gurmukhi-qwerty'];

// Type a roman string key by key, feeding each result back as context.
// An empty result is the inherent vowel: it writes nothing but ends the
// consonant's matra context.
function type(roman: string, layout = phonetic): string {
  let out = '';
  let afterInherent = false;
  for (const ch of roman) {
    const g = resolveKey(ch, out, layout, afterInherent);
    afterInherent = g === '';
    out += g ?? ch;
  }
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
    expect(resolveKey('A', 'ਕ', phonetic)).toBe('ਾ');
    expect(resolveKey('I', 'ਕ', phonetic)).toBe('ੀ');
  });

  it('treats a after a consonant as the inherent vowel', () => {
    expect(resolveKey('a', 'ਕ', phonetic)).toBe('');
  });

  it('gives standalone vowels after the inherent vowel', () => {
    expect(resolveKey('u', 'ਭ', phonetic, true)).toBe('ਉ');
    expect(resolveKey('a', 'ਭ', phonetic, true)).toBe('ਅ');
  });

  it('looks past nukta and virama for matra context', () => {
    expect(resolveKey('i', 'ਸ਼', phonetic)).toBe('ਿ');
    expect(resolveKey('A', 'ਕ੍ਰ', phonetic)).toBe('ਾ');
  });

  it('gives standalone vowels after a vowel', () => {
    expect(resolveKey('i', 'ਕਾ', phonetic)).toBe('ਇ');
  });

  it('returns null for unmapped keys', () => {
    expect(resolveKey('1', '', phonetic)).toBeNull();
    expect(resolveKey(' ', '', phonetic)).toBeNull();
  });

  it('types whole words', () => {
    expect(type('vAhigurU')).toBe('ਵਾਹਿਗੁਰੂ');
    expect(type('sqinAmu')).toBe('ਸਤਿਨਾਮੁ');
    expect(type('nirBau')).toBe('ਨਿਰਭਉ');
    expect(type('BAu')).toBe('ਭਾਉ');
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

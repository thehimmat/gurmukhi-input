import { describe, expect, it } from 'vitest';
import { normalizeIPA, phoneticKey, rules, toIPA } from '../src';

describe('toIPA', () => {
  it('applies the inherent vowel between consonants', () => {
    expect(toIPA('ਸਤਿ')).toBe('sət̪ɪ');
  });

  it('drops the final inherent schwa by default', () => {
    expect(toIPA('ਕ')).toBe('k');
    expect(toIPA('ਕ', { finalSchwa: true })).toBe('kə');
  });

  it('gives independent vowels no inherent schwa', () => {
    expect(toIPA('ਅਕਾਲ')).toBe('əkaːl');
    expect(toIPA('ਇਕ')).toBe('ɪk');
    expect(toIPA('ਜੀਅ')).toBe('d͡ʒiːə');
  });

  it('assimilates tippi and bindi to the next consonant', () => {
    expect(toIPA('ਸੰਗ')).toBe('səŋg');   // velar
    expect(toIPA('ਸੰਤ')).toBe('sən̪t̪');  // dental
    expect(toIPA('ਅੰਮ੍ਰਿਤ')).toBe('əmmɾɪt̪'); // labial
  });

  it('geminates after addak', () => {
    expect(toIPA('ਸੱਚ')).toBe('sət͡ʃt͡ʃ');
  });

  it('suppresses the inherent vowel before virama', () => {
    expect(toIPA('ਪ੍ਰੇਮ')).toBe('pɾeːm');
  });

  it('reads a nukta as part of its consonant', () => {
    expect(toIPA('ਸ\u0A3Cਬਦ')).toBe('ʃəbəd̪');
    expect(toIPA('ਖ\u0A3Cਸਮ')).toBe('xəsəm');
    expect(toIPA('ਜ\u0A3Cਰ')).toBe('zəɾ');
  });

  it('reads precomposed nukta letters the same as base + nukta', () => {
    expect(toIPA('\u0A36ਬਦ')).toBe(toIPA('ਸ\u0A3Cਬਦ'));
  });

  it('keeps a nukta consonant before virama in its cluster', () => {
    expect(toIPA('ਇਸ\u0A3C੍ਟ')).toBe('ɪʃʈ');
  });

  it('reads yakash as a subjoined ਯ', () => {
    expect(toIPA('ਬਿਗੵਾਪ੍ਤਿ')).toBe(toIPA('ਬਿਗ੍ਯਾਪ੍ਤਿ'));
    expect(toIPA('ਬਿਗੵਾਪ੍ਤਿ')).toBe('bɪgjaːpt̪ɪ');
  });

  it('converts each word of a line, keeping the spaces', () => {
    expect(toIPA('ਸਤਿ ਨਾਮੁ')).toBe(`${toIPA('ਸਤਿ')} ${toIPA('ਨਾਮੁ')}`);
  });

  it('returns an empty string for empty input', () => {
    expect(toIPA('')).toBe('');
  });
});

describe('phoneticKey', () => {
  it('collapses distinctions a listener may not hear', () => {
    expect(phoneticKey('ਸਤਿ')).toBe('sati');
    expect(phoneticKey('ਸੰਗਤਿ')).toBe('sangati');
  });

  it('gives the same key to retroflex and dental pairs', () => {
    expect(phoneticKey('ਟ')).toBe(phoneticKey('ਤ'));
    expect(phoneticKey('ਨ')).toBe(phoneticKey('ਣ'));
  });

  // voice-search stores these keys, so nukta and yakash keep their old
  // (wrong) reading here until a re-index
  it('keeps its stored reading of nukta and yakash', () => {
    expect(phoneticKey('ਇਸ\u0A3C੍ਟ')).toBe('iasata');
    expect(phoneticKey('ਸ\u0A3Cਬਦ')).toBe('sabada');
    expect(phoneticKey('ਬਿਗੵਾਪ੍ਤਿ')).toBe('bigaapti');
  });

  it('keys each word of a line, keeping the spaces', () => {
    expect(phoneticKey('ਸਤਿ ਨਾਮੁ')).toBe(`${phoneticKey('ਸਤਿ')} ${phoneticKey('ਨਾਮੁ')}`);
  });
});

describe('normalizeIPA', () => {
  it('drops length and dental marks and lowercases', () => {
    expect(normalizeIPA('t̪aːɾ')).toBe('tar');
  });
});

describe('rules', () => {
  it('exposes the rule set the conversion uses', () => {
    expect(rules.primitives['ਕ']).toBe('k');
    expect(rules.nasalResolution.velar).toBe('ŋ');
  });
});

import { describe, expect, it } from 'vitest';
import { ENCODINGS, LAYOUTS, convert, fromUnicode, toUnicode } from '../src';

describe('toUnicode (AnmolLipi)', () => {
  it('converts consonants and vowel signs', () => {
    expect(toUnicode('vwihgurU')).toBe('ਵਾਹਿਗੁਰੂ');
  });

  it('moves sihari after its consonant', () => {
    expect(toUnicode('siq')).toBe('ਸਤਿ');
  });

  it('keeps sihari after a subjoined letter with its cluster', () => {
    expect(toUnicode('ipRA')).toBe('ਪ੍ਰਿਅ');
  });

  it('builds independent vowels from a carrier and a sign', () => {
    expect(toUnicode('Aw ieAw')).toBe('ਆ ਇਆ');
  });

  it('converts Ik Onkar, dandas and digits', () => {
    expect(toUnicode('<> ]1]')).toBe('ੴ ॥੧॥');
  });
});

describe('convert', () => {
  it('reports unmapped characters and passes them through', () => {
    const r = convert('k§k');
    expect(r.text).toBe('ਕ§ਕ');
    expect(r.warnings).toEqual([{ position: 1, char: '§', kind: 'unmapped', message: 'no mapping; passed through' }]);
  });

  it('reports an orphan sihari', () => {
    expect(convert('i ').warnings.map(w => w.kind)).toEqual(['orphan_sihari']);
  });

  it('converts the other layouts', () => {
    expect(convert('fJ', 'asees').text).toBe('ਇ');
  });

  it('rejects an unknown encoding', () => {
    // @ts-expect-error — not an Encoding
    expect(() => convert('k', 'wingdings')).toThrow(/Unsupported encoding: wingdings/);
  });

  it('lists every layout', () => {
    expect(ENCODINGS).toEqual(['anmollipi', 'asees', 'joy', 'anandpursahib', 'satluj', 'sony']);
    expect(LAYOUTS.anmollipi.label).toBe('AnmolLipi / GurbaniAkhar');
  });
});

describe('fromUnicode (to AnmolLipi)', () => {
  it('writes sihari before its cluster', () => {
    expect(fromUnicode('ਸਤਿ')).toBe('siq');
    expect(fromUnicode('ਪ੍ਰਿਅ')).toBe('ipRA');
  });

  it('writes independent vowels as carrier + sign', () => {
    expect(fromUnicode('ਆਇਈਏਐਔਉਊਓ')).toBe('AwieeIeyAYAOauaUE');
  });

  it('uses the precomposed nukta keys', () => {
    expect(fromUnicode('ਸ਼ਖ਼ਗ਼ਜ਼ਫ਼ਲ਼')).toBe('S^Zz&L');
  });

  it('round-trips a line', () => {
    const line = 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ॥੧॥';
    expect(fromUnicode(line)).not.toMatch(/[\u0A00-\u0A7F]/);
    expect(toUnicode(fromUnicode(line))).toBe(line);
  });
});

import { describe, expect, it } from 'vitest';
import {
  CHAR_CATEGORIES,
  firstLetters,
  foldGurmukhi,
  listCategories,
  matchesFirstLetters,
  patternToRegExp,
  tokenize,
} from '../src';

const collide = (a: string, b: string) => expect(foldGurmukhi(a)).toBe(foldGurmukhi(b));
const differ = (a: string, b: string) => expect(foldGurmukhi(a)).not.toBe(foldGurmukhi(b));

describe('foldGurmukhi', () => {
  it('folds spelling variants together', () => {
    collide('ਤੀਕਾ', 'ਟੀਕਾ');     // retroflex → dental
    collide('ਖ਼ਾਲਸਾ', 'ਖਾਲਸਾ');   // nukta
    collide('ਗੁਰੂ', 'ਗੁਰੁ');      // vowel length
    collide('ਸਭ', 'ਸਭੁ');       // final short matra
    collide('ਸੰਤ', 'ਸਂਤ');       // nasal signs
    collide('ਪੱਕਾ', 'ਪਕਾ');      // addak
  });

  it('keeps contrastive distinctions', () => {
    differ('ਕਾਲ', 'ਕਲ');
    differ('ਘਰ', 'ਗਰ');
  });

  it('ignores non-Gurmukhi input', () => {
    expect(foldGurmukhi('abc123!')).toBe('');
  });
});

describe('tokenize', () => {
  it('drops dandas, numerals and pure punctuation', () => {
    expect(tokenize('ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥')).toEqual(['ਸਤਿ', 'ਨਾਮੁ', 'ਕਰਤਾ', 'ਪੁਰਖੁ']);
    expect(tokenize('ਗਉੜੀ ਮਹਲਾ ੫ ॥')).toEqual(['ਗਉੜੀ', 'ਮਹਲਾ']);
  });

  it('strips attached dandas', () => {
    expect(tokenize('ਸਚੁ॥')).toEqual(['ਸਚੁ']);
  });
});

describe('firstLetters', () => {
  it('takes the first letter of each word', () => {
    expect(firstLetters('ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥')).toBe('ਸਨਕਪ');
  });

  it('takes the vowel carrier for vowel-initial words', () => {
    expect(firstLetters('ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥')).toBe('ਆਸਜਸ');
  });
});

describe('matchesFirstLetters', () => {
  const line = 'ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥';

  it('matches word-by-word from the start of the line', () => {
    expect(matchesFirstLetters(line, ['ਸ', 'ਨ', 'ਕ'])).toBe(true);
    expect(matchesFirstLetters(line, 'ਸਨਕਪ')).toBe(true);
  });

  it('fails on a wrong letter or too many letters', () => {
    expect(matchesFirstLetters(line, 'ਸਕ')).toBe(false);
    expect(matchesFirstLetters(line, 'ਸਨਕਪਨ')).toBe(false);
  });

  it('matches nothing for an empty query', () => {
    expect(matchesFirstLetters(line, '')).toBe(false);
  });
});

describe('patternToRegExp', () => {
  it('compiles to a usable JavaScript regex', () => {
    const re = patternToRegExp('{velar}ਾ*');
    expect(re.test('ਕਾਲ')).toBe(true);
    expect(re.test('ਸਾਲ')).toBe(false);
  });

  it('supports alternation and single-character wildcards', () => {
    expect(patternToRegExp('ਗੁਰ(ਮੁਖਿ|ਮਤਿ)').test('ਗੁਰਮਤਿ')).toBe(true);
    expect(patternToRegExp('ਸ_ਤਿ').test('ਸਤਤਿ')).toBe(true);
  });

  it('anchors to the whole string when asked', () => {
    expect(patternToRegExp('ਸਤਿ').test('ਸਤਿਗੁਰ')).toBe(true);
    expect(patternToRegExp('ਸਤਿ', { anchored: true }).test('ਸਤਿਗੁਰ')).toBe(false);
  });

  it('gives a lone vowel sign a base letter', () => {
    expect(patternToRegExp('ਾ', { anchored: true }).test('ਕਾ')).toBe(true);
  });

  it('throws a readable error on a bad pattern', () => {
    expect(() => patternToRegExp('{nope}')).toThrow('Unknown category: nope');
  });
});

describe('categories', () => {
  it('lists every category with its characters', () => {
    expect(listCategories().map(c => c.name)).toEqual(Object.keys(CHAR_CATEGORIES));
  });
});

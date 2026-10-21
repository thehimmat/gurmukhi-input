import { describe, expect, it } from 'vitest';
import { resolveKeyboard } from '../src/keyboard';
import { isCombiningGurmukhi, isGurmukhiChar, isGurmukhiConsonant } from '../src/keymap';

function find(rows: ReturnType<typeof resolveKeyboard>, code: string) {
  return rows.flat().find(k => k.code === code)!;
}

describe('resolveKeyboard', () => {
  it('returns the plain layer', () => {
    const k = find(resolveKeyboard('gurmukhi-qwerty', {}), 'KeyK');
    expect(k).toEqual({ code: 'KeyK', hint: 'k', output: 'ਕ', display: 'ਕ' });
  });

  it('returns the shift layer', () => {
    expect(find(resolveKeyboard('gurmukhi-qwerty', { shift: true }), 'KeyK').output).toBe('ਖ');
  });

  it('returns the option layers', () => {
    expect(find(resolveKeyboard('gurmukhi-qwerty', { option: true }), 'KeyT').output).toBe('ਟ');
    expect(find(resolveKeyboard('gurmukhi-qwerty', { option: true, shift: true }), 'KeyT').output).toBe('ਠ');
  });

  it('shows combining marks on a dotted circle', () => {
    expect(find(resolveKeyboard('gurmukhi-qwerty', {}), 'KeyA').display).toBe('◌ਾ');
  });

  it('falls back to matras for context-sensitive layouts', () => {
    expect(find(resolveKeyboard('phonetic', { shift: true }), 'KeyA').output).toBe('ਾ');
    expect(find(resolveKeyboard('phonetic', {}), 'KeyI').output).toBe('ਿ');
  });

  it('shows the inherent-vowel key as empty after a consonant', () => {
    expect(find(resolveKeyboard('phonetic', {}), 'KeyA').output).toBe('');
  });

  it('leaves unmapped keys empty', () => {
    expect(find(resolveKeyboard('phonetic', {}), 'Digit1').output).toBe('');
  });

  it('throws on an unknown layout', () => {
    expect(() => resolveKeyboard('nope', {})).toThrow(/unknown layout "nope"/);
  });
});

describe('keymap helpers', () => {
  it('detects Gurmukhi characters', () => {
    expect(isGurmukhiChar('ਕ')).toBe(true);
    expect(isGurmukhiChar('k')).toBe(false);
  });

  it('detects consonants, including hakka rara', () => {
    expect(isGurmukhiConsonant('ਕ')).toBe(true);
    expect(isGurmukhiConsonant('ੜ')).toBe(true);
    expect(isGurmukhiConsonant('ਅ')).toBe(false);
  });

  it('detects combining marks', () => {
    expect(isCombiningGurmukhi('ਾ')).toBe(true);
    expect(isCombiningGurmukhi('ੰ')).toBe(true);
    expect(isCombiningGurmukhi('ਕ')).toBe(false);
  });
});

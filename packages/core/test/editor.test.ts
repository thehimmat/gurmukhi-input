import { describe, expect, it } from 'vitest';
import { applyKeydown, applyPaste, resolveLayout, type EditState } from '../src/editor';
import { LAYOUTS } from '../src/layouts';
import type { KeyEventLike } from '../src/dispatch';

const phonetic = LAYOUTS.phonetic;
const qwerty = LAYOUTS['gurmukhi-qwerty'];

function key(k: string, extra: Partial<KeyEventLike> = {}): KeyEventLike {
  return { key: k, code: '', shiftKey: false, altKey: false, metaKey: false, ctrlKey: false, ...extra };
}

// value with the caret at `|`, e.g. 'ਕ|ਮ'; a selection is written '[..]'
function at(marked: string): EditState {
  const sel = marked.match(/\[(.*)\]/);
  if (sel) {
    const start = marked.indexOf('[');
    const value = marked.replace('[', '').replace(']', '');
    return { value, selectionStart: start, selectionEnd: start + sel[1].length };
  }
  const caret = marked.indexOf('|');
  return { value: marked.replace('|', ''), selectionStart: caret, selectionEnd: caret };
}

describe('applyKeydown', () => {
  it('inserts at the caret and moves it', () => {
    expect(applyKeydown(at('|'), key('k'), phonetic)).toEqual(at('ਕ|'));
  });

  it('inserts in the middle of text', () => {
    expect(applyKeydown(at('ਕ|ਮ'), key('m'), phonetic)).toEqual(at('ਕਮ|ਮ'));
  });

  it('replaces a selection', () => {
    expect(applyKeydown(at('[ਕਮ]ਲ'), key('n'), phonetic)).toEqual(at('ਨ|ਲ'));
  });

  it('uses only the text before the caret as vowel context', () => {
    // caret is after ਕ, so 'A' becomes a matra even though ਅ follows
    expect(applyKeydown(at('ਕ|ਅ'), key('A'), phonetic)).toEqual(at('ਕਾ|ਅ'));
    expect(applyKeydown(at('|ਕ'), key('a'), phonetic)).toEqual(at('ਅ|ਕ'));
  });

  it('carries the inherent vowel to the next keydown as composing', () => {
    const inherent = applyKeydown(at('ਭ|'), key('a'), phonetic);
    expect(inherent).toEqual({ ...at('ਭ|'), composing: 'a' });
    expect(applyKeydown(inherent!, key('u'), phonetic)).toEqual(at('ਭਉ|'));
  });

  it('returns null for keys the browser should handle', () => {
    expect(applyKeydown(at('ਕ|'), key('Backspace'), phonetic)).toBeNull();
    expect(applyKeydown(at('ਕ|'), key('c', { metaKey: true }), phonetic)).toBeNull();
    expect(applyKeydown(at('ਕ|'), key(' '), phonetic)).toBeNull();
  });

  it('flags dead-key Option presses', () => {
    expect(applyKeydown(at('|'), key('Dead', { code: 'KeyE', altKey: true }), qwerty))
      .toEqual({ ...at('ਏ|'), endComposition: true });
  });

  it('leaves text inside an open brace alone in pattern mode', () => {
    expect(applyKeydown(at('{|'), key('k'), phonetic, { patternMode: true })).toBeNull();
    expect(applyKeydown(at('{v}|'), key('k'), phonetic, { patternMode: true })).toEqual(at('{v}ਕ|'));
  });

  it('passes pattern syntax through in pattern mode', () => {
    expect(applyKeydown(at('|'), key('*'), phonetic, { patternMode: true })).toBeNull();
  });
});

describe('applyPaste', () => {
  it('converts pasted roman text with context', () => {
    expect(applyPaste(at('|'), 'vAhigurU', phonetic)).toEqual(at('ਵਾਹਿਗੁਰੂ|'));
    expect(applyPaste(at('|'), 'nirBau', phonetic)).toEqual(at('ਨਿਰਭਉ|'));
  });

  it('uses the text before the caret as context', () => {
    expect(applyPaste(at('ਕ|'), 'A', phonetic)).toEqual(at('ਕਾ|'));
  });

  it('keeps unmapped characters', () => {
    expect(applyPaste(at('|'), 'k 1', phonetic)).toEqual(at('ਕ 1|'));
  });

  it('replaces a selection', () => {
    expect(applyPaste(at('ਸ[ਮ]ਲ'), 'k', phonetic)).toEqual(at('ਸਕ|ਲ'));
  });

  it('returns null when the pasted text already contains Gurmukhi', () => {
    expect(applyPaste(at('|'), 'ਸਤਿ nam', phonetic)).toBeNull();
  });
});

describe('resolveLayout', () => {
  it('looks up built-in layouts by name', () => {
    expect(resolveLayout('phonetic')).toBe(phonetic);
  });

  it('passes custom layouts through', () => {
    const custom = { name: 'x', description: '', keys: { k: 'ਕ' } };
    expect(resolveLayout(custom)).toBe(custom);
  });

  it('throws on an unknown name', () => {
    expect(() => resolveLayout('nope')).toThrow(/unknown layout "nope"/);
  });
});

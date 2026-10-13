import { describe, expect, it } from 'vitest';
import { applyKeydown, applyPaste, resolveLayout, type EditState } from '../src/editor';
import { LAYOUTS } from '../src/layouts';
import type { KeyEventLike } from '../src/dispatch';

const igurbani = LAYOUTS.igurbani;
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
    expect(applyKeydown(at('|'), key('k'), igurbani)).toEqual(at('ਕ|'));
  });

  it('inserts in the middle of text', () => {
    expect(applyKeydown(at('ਕ|ਮ'), key('m'), igurbani)).toEqual(at('ਕਮ|ਮ'));
  });

  it('replaces a selection', () => {
    expect(applyKeydown(at('[ਕਮ]ਲ'), key('n'), igurbani)).toEqual(at('ਨ|ਲ'));
  });

  it('uses only the text before the caret as vowel context', () => {
    // caret is after ਕ, so 'a' becomes a matra even though ਅ follows
    expect(applyKeydown(at('ਕ|ਅ'), key('a'), igurbani)).toEqual(at('ਕਾ|ਅ'));
    expect(applyKeydown(at('|ਕ'), key('a'), igurbani)).toEqual(at('ਅ|ਕ'));
  });

  it('returns null for keys the browser should handle', () => {
    expect(applyKeydown(at('ਕ|'), key('Backspace'), igurbani)).toBeNull();
    expect(applyKeydown(at('ਕ|'), key('c', { metaKey: true }), igurbani)).toBeNull();
    expect(applyKeydown(at('ਕ|'), key(' '), igurbani)).toBeNull();
  });

  it('flags dead-key Option presses', () => {
    expect(applyKeydown(at('|'), key('Dead', { code: 'KeyE', altKey: true }), qwerty))
      .toEqual({ ...at('ਏ|'), endComposition: true });
  });

  it('leaves text inside an open brace alone in pattern mode', () => {
    expect(applyKeydown(at('{|'), key('k'), igurbani, { patternMode: true })).toBeNull();
    expect(applyKeydown(at('{v}|'), key('k'), igurbani, { patternMode: true })).toEqual(at('{v}ਕ|'));
  });

  it('passes pattern syntax through in pattern mode', () => {
    expect(applyKeydown(at('|'), key('*'), igurbani, { patternMode: true })).toBeNull();
  });
});

describe('applyPaste', () => {
  it('converts pasted roman text with context', () => {
    expect(applyPaste(at('|'), 'vahigurU', igurbani)).toEqual(at('ਵਾਹਿਗੁਰੂ|'));
  });

  it('uses the text before the caret as context', () => {
    expect(applyPaste(at('ਕ|'), 'a', igurbani)).toEqual(at('ਕਾ|'));
  });

  it('keeps unmapped characters', () => {
    expect(applyPaste(at('|'), 'k 1', igurbani)).toEqual(at('ਕ 1|'));
  });

  it('replaces a selection', () => {
    expect(applyPaste(at('ਸ[ਮ]ਲ'), 'k', igurbani)).toEqual(at('ਸਕ|ਲ'));
  });

  it('returns null when the pasted text already contains Gurmukhi', () => {
    expect(applyPaste(at('|'), 'ਸਤਿ nam', igurbani)).toBeNull();
  });
});

describe('resolveLayout', () => {
  it('looks up built-in layouts by name', () => {
    expect(resolveLayout('igurbani')).toBe(igurbani);
  });

  it('passes custom layouts through', () => {
    const custom = { name: 'x', description: '', keys: { k: 'ਕ' } };
    expect(resolveLayout(custom)).toBe(custom);
  });

  it('throws on an unknown name', () => {
    expect(() => resolveLayout('nope')).toThrow(/unknown layout "nope"/);
  });
});

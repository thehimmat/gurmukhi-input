import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../src/layouts';
import { resolveKeydown, stripDeadKeyArtifacts, type KeyEventLike } from '../src/dispatch';

const igurbani = LAYOUTS.igurbani;
const qwerty = LAYOUTS['gurmukhi-qwerty'];

function key(k: string, extra: Partial<KeyEventLike> = {}): KeyEventLike {
  return { key: k, code: '', shiftKey: false, altKey: false, metaKey: false, ctrlKey: false, ...extra };
}

describe('resolveKeydown', () => {
  it('inserts mapped keys', () => {
    expect(resolveKeydown(key('k'), '', igurbani)).toEqual({ type: 'insert', text: 'ਕ' });
  });

  it('passes through named keys', () => {
    for (const k of ['Backspace', 'ArrowLeft', 'Enter', 'Tab']) {
      expect(resolveKeydown(key(k), '', igurbani)).toEqual({ type: 'passthrough' });
    }
  });

  it('passes through unmapped printable keys', () => {
    expect(resolveKeydown(key(' '), '', igurbani)).toEqual({ type: 'passthrough' });
  });

  it('passes through shortcuts', () => {
    expect(resolveKeydown(key('k', { metaKey: true }), '', igurbani).type).toBe('passthrough');
    expect(resolveKeydown(key('k', { ctrlKey: true }), '', igurbani).type).toBe('passthrough');
  });

  it('passes through Gurmukhi from a system keyboard', () => {
    expect(resolveKeydown(key('ਕ'), '', igurbani).type).toBe('passthrough');
  });

  describe('Option layers', () => {
    it('looks up option by e.code', () => {
      expect(resolveKeydown(key('†', { code: 'KeyT', altKey: true }), '', qwerty))
        .toEqual({ type: 'insert', text: 'ਟ' });
    });

    it('looks up optionShift by e.code', () => {
      expect(resolveKeydown(key('ˇ', { code: 'KeyT', altKey: true, shiftKey: true }), '', qwerty))
        .toEqual({ type: 'insert', text: 'ਠ' });
    });

    it('flags dead keys so the caller cleans up the accent', () => {
      expect(resolveKeydown(key('Dead', { code: 'KeyE', altKey: true }), '', qwerty))
        .toEqual({ type: 'insert', text: 'ਏ', endComposition: true });
    });

    it('passes through unmapped Option keys', () => {
      expect(resolveKeydown(key('å', { code: 'KeyZ', altKey: true }), '', qwerty).type).toBe('passthrough');
    });

    it('passes through Option on layouts without an Option layer', () => {
      expect(resolveKeydown(key('†', { code: 'KeyT', altKey: true }), '', igurbani).type).toBe('passthrough');
    });
  });

  describe('pattern mode', () => {
    it('passes through pattern syntax', () => {
      for (const k of ['_', '*', '{', '}', '(', ')', '|']) {
        expect(resolveKeydown(key(k), '', igurbani, { patternMode: true }).type).toBe('passthrough');
      }
    });

    it('leaves text inside an open brace unconverted', () => {
      expect(resolveKeydown(key('k'), '{', igurbani, { patternMode: true, valueHasOpenBrace: true }).type)
        .toBe('passthrough');
    });

    it('converts pattern syntax keys when pattern mode is off', () => {
      // igurbani maps '[' to ਞ
      expect(resolveKeydown(key('['), '', igurbani)).toEqual({ type: 'insert', text: 'ਞ' });
    });
  });
});

describe('stripDeadKeyArtifacts', () => {
  it('removes accent marks and keeps the caret in place', () => {
    expect(stripDeadKeyArtifacts('ਏ´ਕ', 2)).toEqual({ value: 'ਏਕ', caret: 1 });
  });

  it('leaves clean text alone', () => {
    expect(stripDeadKeyArtifacts('ਕਾ', 2)).toEqual({ value: 'ਕਾ', caret: 2 });
  });
});

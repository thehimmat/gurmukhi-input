import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../src/layouts';
import { resolveKeydown, type KeyEventLike } from '../src/dispatch';
import { applyKeydown, applyPaste, type EditResult, type EditState } from '../src/editor';
import { resolveKeyboard } from '../src/keyboard';
import { romanToGurmukhi } from '../src/transliterate';

// igurbani: types exactly like igurbani.com's search box, which is the
// GurbaniAkhar font keyboard: sihari before its consonant, vowels built from
// carriers (a+u → ਉ), <> → ੴ, [ ] → । ॥, digits are Gurmukhi.
const igurbani = LAYOUTS.igurbani;

function key(k: string, extra: Partial<KeyEventLike> = {}): KeyEventLike {
  return { key: k, code: '', shiftKey: false, altKey: false, metaKey: false, ctrlKey: false, ...extra };
}

const empty: EditState = { value: '', selectionStart: 0, selectionEnd: 0 };

// Type keys one by one; on passthrough insert the key as a browser would.
function type(keys: string, start: EditState = empty): EditResult {
  let state: EditResult = start;
  for (const k of keys) {
    const next = applyKeydown(state, key(k), igurbani);
    if (next) state = next;
    else {
      const { value, selectionStart: s, selectionEnd: e } = state;
      state = { value: value.slice(0, s) + k + value.slice(e), selectionStart: s + 1, selectionEnd: s + 1 };
    }
  }
  return state;
}

describe('igurbani layout (GurbaniAkhar keys, like igurbani.com)', () => {
  it('is registered next to phonetic and gurmukhi-qwerty', () => {
    expect(igurbani.name).toBe('igurbani');
    expect(Object.keys(LAYOUTS)).toEqual(['phonetic', 'igurbani', 'gurmukhi-qwerty']);
  });

  it('types sihari before its consonant', () => {
    expect(type('vwihgurU').value).toBe('ਵਾਹਿਗੁਰੂ');
    expect(type('ikrpw').value).toBe('ਕਿਰਪਾ');
  });

  it('builds ਉ from a + u, and u alone is a bare aunkar', () => {
    expect(type('au').value).toBe('ਉ');
    expect(type('u').value).toBe('ੁ');
  });

  it('types standalone vowels after a consonant with carriers', () => {
    expect(type('hoveI').value).toBe('ਹੋਵਈ');
    expect(type('gey').value).toBe('ਗਏ');
    expect(type('nwnkeyvY').value).toBe('ਨਾਨਕਏਵੈ');
  });

  it('combines < and > into ੴ, showing < while it waits', () => {
    expect(type('<').value).toBe('<');
    expect(type('<>').value).toBe('ੴ');
  });

  it('types dandas and Gurmukhi digits', () => {
    expect(type('[').value).toBe('।');
    expect(type(']').value).toBe('॥');
    expect(type('1234567890').value).toBe('੧੨੩੪੫੬੭੮੯੦');
  });

  it('types whole lines of Gurbani', () => {
    expect(type('<> siq nwmu krqw purKu inrBau inrvYru Akwl mUriq AjUnI sYBM gur pRswid ]').value).toBe(
      'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
    );
    expect(type('hY BI scu nwnk hosI BI scu ]1]').value).toBe('ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥');
  });

  it('shows a pending sihari until its consonant arrives', () => {
    expect(type('i').value).toBe('ਿ');
    expect(type('ik').value).toBe('ਕਿ');
  });

  it('returns the raw keys of the word being typed, and uses them next time', () => {
    const r = type('si');
    expect(r.composing).toBe('si');
    // 'si' and 'is' both render as ਸਿ; only the keys say the sihari is still pending
    expect(type('q', r).value).toBe('ਸਤਿ');
  });

  it('recovers the keys from the text when there is no buffer (caret moved, reload)', () => {
    const start: EditState = { value: 'ਕਿ', selectionStart: 2, selectionEnd: 2 };
    expect(type('r', start).value).toBe('ਕਿਰ');
  });

  it('only rewrites the word at the caret', () => {
    const start: EditState = { value: 'ਸਤਿ ਨਾਮੁ', selectionStart: 3, selectionEnd: 3 };
    const r = type('A', start);
    expect(r.value).toBe('ਸਤਿਅ ਨਾਮੁ');
    expect(r.selectionStart).toBe(4);
  });

  it('describes the edit as a compose action', () => {
    expect(resolveKeydown(key('w'), 'ਕ', igurbani)).toEqual({
      type: 'compose',
      deleteBefore: 1,
      text: 'ਕਾ',
      composing: 'kw',
    });
  });

  it('passes through space, named keys, shortcuts and native Gurmukhi', () => {
    expect(resolveKeydown(key(' '), 'ਕ', igurbani).type).toBe('passthrough');
    expect(resolveKeydown(key('Backspace'), 'ਕ', igurbani).type).toBe('passthrough');
    expect(resolveKeydown(key('c', { metaKey: true }), 'ਕ', igurbani).type).toBe('passthrough');
    expect(resolveKeydown(key('ਕ'), '', igurbani).type).toBe('passthrough');
  });

  it('leaves pattern syntax alone in pattern mode', () => {
    expect(applyKeydown(empty, key('*'), igurbani, { patternMode: true })).toBeNull();
  });

  it('converts pasted keys and leaves pasted Gurmukhi alone', () => {
    expect(applyPaste(empty, 'siq nwmu', igurbani)?.value).toBe('ਸਤਿ ਨਾਮੁ');
    expect(applyPaste(empty, 'ਸਤਿ', igurbani)).toBeNull();
  });

  it('converts a whole roman string', () => {
    expect(romanToGurmukhi('vwihgurU', igurbani)).toBe('ਵਾਹਿਗੁਰੂ');
  });

  it('shows the GurbaniAkhar keys on the on-screen keyboard', () => {
    const rows = resolveKeyboard('igurbani', {});
    const find = (code: string) => rows.flat().find((k) => k.code === code)!;
    expect(find('KeyW').output).toBe('ਾ');
    expect(find('KeyA').output).toBe('ੳ');
    expect(find('Digit1').output).toBe('੧');
    expect(find('BracketLeft').output).toBe('।');
    expect(find('BracketRight').output).toBe('॥');
  });
});

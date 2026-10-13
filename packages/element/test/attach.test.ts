import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachGurmukhi } from '../src';
import { press, type } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

function field(tag: 'input' | 'textarea' = 'input') {
  const el = document.createElement(tag);
  document.body.append(el);
  return el;
}

describe('attachGurmukhi', () => {
  it('defaults to the igurbani layout', () => {
    const input = field();
    attachGurmukhi(input);
    type(input, 'vahigurU');
    expect(input.value).toBe('ਵਾਹਿਗੁਰੂ');
  });

  it('works on a textarea', () => {
    const ta = field('textarea');
    attachGurmukhi(ta);
    type(ta, 'kml');
    expect(ta.value).toBe('ਕਮਲ');
  });

  it('fires a bubbling input event for every change, so frameworks see it', () => {
    const input = field();
    attachGurmukhi(input);
    const onInput = vi.fn();
    document.body.addEventListener('input', onInput);
    press(input, { key: 'k' });
    expect(onInput).toHaveBeenCalledOnce();
    expect(input.value).toBe('ਕ');
  });

  it('stops converting after detach', () => {
    const input = field();
    const attachment = attachGurmukhi(input);
    attachment.detach();
    type(input, 'k');
    expect(input.value).toBe('k');
  });

  it('can switch layout and options in place', () => {
    const input = field();
    const attachment = attachGurmukhi(input);
    attachment.update({ layout: 'gurmukhi-qwerty' });
    type(input, '1');
    attachment.update({ enabled: false });
    type(input, 'k');
    expect(input.value).toBe('੧k');
  });

  it('throws on an unknown layout', () => {
    expect(() => attachGurmukhi(field(), { layout: 'nope' })).toThrow(/unknown layout/);
  });

  it('strips the dead-key accent after an Option dead key', () => {
    vi.useFakeTimers();
    const input = field();
    input.focus();
    attachGurmukhi(input, { layout: 'gurmukhi-qwerty' });
    press(input, { key: 'Dead', code: 'KeyE', alt: true });
    // the browser then inserts the accent anyway
    input.value += '´';
    vi.runAllTimers();
    expect(input.value).toBe('ਏ');
    expect(input.selectionStart).toBe(1);
  });
});

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineGurmukhiElements, GurmukhiKeyboardElement } from '../src';

beforeAll(() => defineGurmukhiElements());
afterEach(() => { document.body.innerHTML = ''; });

function mount(html: string) {
  document.body.innerHTML = html;
  return document.querySelector('gurmukhi-keyboard') as GurmukhiKeyboardElement;
}

function key(kb: GurmukhiKeyboardElement, code: string) {
  return kb.shadowRoot!.querySelector<HTMLButtonElement>(`button[data-code="${code}"]`)!;
}

describe('<gurmukhi-keyboard>', () => {
  it('renders every key of the layout', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    expect(kb.shadowRoot!.querySelectorAll('button[data-code]')).toHaveLength(47);
    expect(key(kb, 'KeyK').textContent).toContain('ਕ');
  });

  it('shows combining marks on a dotted circle', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    expect(key(kb, 'KeyA').textContent).toContain('◌ਾ');
  });

  it('follows the shift and option attributes', () => {
    const kb = mount('<gurmukhi-keyboard option></gurmukhi-keyboard>');
    expect(key(kb, 'KeyT').textContent).toContain('ਟ');
    kb.setAttribute('shift', '');
    expect(key(kb, 'KeyT').textContent).toContain('ਠ');
  });

  it('disables unmapped keys', () => {
    const kb = mount('<gurmukhi-keyboard layout="igurbani"></gurmukhi-keyboard>');
    expect(key(kb, 'Digit1').disabled).toBe(true);
  });

  it('emits gurmukhi-keypress with the character', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    const onPress = vi.fn();
    kb.addEventListener('gurmukhi-keypress', e => onPress((e as CustomEvent).detail.char));
    key(kb, 'KeyK').click();
    expect(onPress).toHaveBeenCalledWith('ਕ');
  });

  it('inserts into the field named by for= at its caret', () => {
    document.body.innerHTML = '<input id="f" value="ਕਮ"><gurmukhi-keyboard for="f"></gurmukhi-keyboard>';
    const input = document.querySelector('input')!;
    const kb = document.querySelector('gurmukhi-keyboard') as GurmukhiKeyboardElement;
    input.setSelectionRange(1, 1);
    const onInput = vi.fn();
    input.addEventListener('input', onInput);
    key(kb, 'KeyN').click();
    expect(input.value).toBe('ਕਨਮ');
    expect(input.selectionStart).toBe(2);
    expect(onInput).toHaveBeenCalledOnce();
  });

  it('inserts into the input inside a <gurmukhi-input> named by for=', () => {
    document.body.innerHTML = '<gurmukhi-input id="g"></gurmukhi-input><gurmukhi-keyboard for="g"></gurmukhi-keyboard>';
    const kb = document.querySelector('gurmukhi-keyboard') as GurmukhiKeyboardElement;
    key(kb, 'KeyK').click();
    expect(document.querySelector('input')!.value).toBe('ਕ');
  });

  it('keeps focus in the field when a key is pressed', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    key(kb, 'KeyK').dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
  });

  it('toggles modifiers from the on-screen buttons', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    kb.shadowRoot!.querySelector<HTMLButtonElement>('button[data-mod="shift"]')!.click();
    expect(key(kb, 'KeyK').textContent).toContain('ਖ');
  });

  it('reflects physically held modifiers', () => {
    const kb = mount('<gurmukhi-keyboard></gurmukhi-keyboard>');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    expect(key(kb, 'KeyK').textContent).toContain('ਖ');
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }));
    expect(key(kb, 'KeyK').textContent).toContain('ਕ');
  });

  it('hides hints and toggles when asked', () => {
    const kb = mount('<gurmukhi-keyboard hide-hints hide-modifiers></gurmukhi-keyboard>');
    expect(kb.shadowRoot!.querySelector('.hint')).toBeNull();
    expect(kb.shadowRoot!.querySelector('button[data-mod]')).toBeNull();
  });
});

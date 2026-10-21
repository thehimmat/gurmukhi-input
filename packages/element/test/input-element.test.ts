import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineGurmukhiElements, GurmukhiInputElement } from '../src';
import { type } from './helpers';

beforeAll(() => defineGurmukhiElements());
afterEach(() => { document.body.innerHTML = ''; });

function mount(html: string) {
  document.body.innerHTML = html;
  return document.body.firstElementChild as GurmukhiInputElement;
}

describe('<gurmukhi-input>', () => {
  it('creates a native input when it has none', () => {
    const el = mount('<gurmukhi-input placeholder="Search" name="q"></gurmukhi-input>');
    const input = el.querySelector('input')!;
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Search');
    expect(input.name).toBe('q');
  });

  it('moves aria-label onto the input so the name is not announced twice', () => {
    const el = mount('<gurmukhi-input aria-label="Search"></gurmukhi-input>');
    expect(el.querySelector('input')!.getAttribute('aria-label')).toBe('Search');
    expect(el.hasAttribute('aria-label')).toBe(false);
    el.setAttribute('aria-label', 'Find');
    expect(el.querySelector('input')!.getAttribute('aria-label')).toBe('Find');
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('is labelled by a wrapping <label>', () => {
    document.body.innerHTML = '<label>Search <gurmukhi-input></gurmukhi-input></label>';
    expect(document.querySelector('label')!.control).toBe(document.querySelector('input'));
  });

  it('enhances a child input or textarea in place', () => {
    const el = mount('<gurmukhi-input><textarea id="t"></textarea></gurmukhi-input>');
    const ta = el.querySelector('textarea')!;
    expect(el.querySelectorAll('textarea, input')).toHaveLength(1);
    type(ta, 'kml');
    expect(ta.value).toBe('ਕਮਲ');
  });

  it('converts typing and exposes value', () => {
    const el = mount('<gurmukhi-input></gurmukhi-input>');
    type(el.querySelector('input')!, 'vAhigurU');
    expect(el.value).toBe('ਵਾਹਿਗੁਰੂ');
  });

  it('sets the value from the attribute and property', () => {
    const el = mount('<gurmukhi-input value="ਕ"></gurmukhi-input>');
    expect(el.querySelector('input')!.value).toBe('ਕ');
    el.value = 'ਮ';
    expect(el.querySelector('input')!.value).toBe('ਮ');
  });

  it('follows the layout attribute', () => {
    const el = mount('<gurmukhi-input layout="gurmukhi-qwerty"></gurmukhi-input>');
    const input = el.querySelector('input')!;
    type(input, '1');
    el.setAttribute('layout', 'phonetic');
    type(input, 'a');
    expect(input.value).toBe('੧ਅ');
  });

  it('supports pattern-mode', () => {
    const el = mount('<gurmukhi-input pattern-mode></gurmukhi-input>');
    const input = el.querySelector('input')!;
    type(input, 'k*');
    expect(input.value).toBe('ਕ*');
  });

  it('turns off with transliterate="off"', () => {
    const el = mount('<gurmukhi-input transliterate="off"></gurmukhi-input>');
    const input = el.querySelector('input')!;
    type(input, 'k');
    el.removeAttribute('transliterate');
    type(input, 'k');
    expect(input.value).toBe('kਕ');
  });

  it('lets input events bubble from the host', () => {
    const el = mount('<gurmukhi-input></gurmukhi-input>');
    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    type(el.querySelector('input')!, 'k');
    expect(onInput).toHaveBeenCalled();
  });

  it('submits with a form through the native input', () => {
    document.body.innerHTML = '<form><gurmukhi-input name="q"></gurmukhi-input></form>';
    const input = document.querySelector('input')!;
    type(input, 'k');
    expect(new FormData(document.querySelector('form')!).get('q')).toBe('ਕ');
  });

  it('stops converting when removed from the page', () => {
    const el = mount('<gurmukhi-input></gurmukhi-input>');
    const input = el.querySelector('input')!;
    el.remove();
    document.body.append(input);
    type(input, 'k');
    expect(input.value).toBe('k');
  });
});

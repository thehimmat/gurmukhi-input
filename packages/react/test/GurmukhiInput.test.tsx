import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { GurmukhiInput } from '../src';

afterEach(cleanup);

function Field(props: { layout?: string; patternMode?: boolean; transliterate?: boolean; initial?: string }) {
  const [value, setValue] = useState(props.initial ?? '');
  return (
    <GurmukhiInput
      aria-label="field"
      value={value}
      onChange={setValue}
      layout={props.layout}
      patternMode={props.patternMode}
      transliterate={props.transliterate}
    />
  );
}

function setup(props: Parameters<typeof Field>[0] = {}) {
  const utils = render(<Field {...props} />);
  const input = utils.getByLabelText('field') as HTMLInputElement;
  const type = (keys: string) => {
    for (const key of keys) {
      // keep the caret at the end, as a real field would after each insert
      input.selectionStart = input.selectionEnd = input.value.length;
      fireEvent.keyDown(input, { key });
    }
  };
  return { input, type };
}

describe('GurmukhiInput', () => {
  it('converts typed keys', () => {
    const { input, type } = setup();
    type('vahigurU');
    expect(input.value).toBe('ਵਾਹਿਗੁਰੂ');
  });

  it('uses the chosen layout', () => {
    const { input, type } = setup({ layout: 'gurmukhi-qwerty' });
    type('t1');
    expect(input.value).toBe('ਤ੧');
  });

  it('prevents the default only for converted keys', () => {
    const { input } = setup();
    expect(fireEvent.keyDown(input, { key: 'k' })).toBe(false);
    expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true);
  });

  it('does nothing when transliterate is off', () => {
    const { input } = setup({ transliterate: false });
    expect(fireEvent.keyDown(input, { key: 'k' })).toBe(true);
    expect(input.value).toBe('');
  });

  it('respects pattern mode', () => {
    const { input, type } = setup({ patternMode: true });
    type('k*');
    expect(input.value).toBe('ਕ');
  });

  it('converts pasted roman text', () => {
    const { input } = setup({ initial: 'ਕ' });
    input.selectionStart = input.selectionEnd = 1;
    fireEvent.paste(input, { clipboardData: { getData: () => 'a' } });
    expect(input.value).toBe('ਕਾ');
  });

  it('leaves pasted Gurmukhi to the browser', () => {
    const { input } = setup();
    expect(fireEvent.paste(input, { clipboardData: { getData: () => 'ਸਤਿ' } })).toBe(true);
  });

  it('places the caret after the inserted text', () => {
    // run animation frames by hand, after React has re-rendered
    const frames: FrameRequestCallback[] = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return 0; });
    const { input } = setup({ initial: 'ਕਮ' });
    input.selectionStart = input.selectionEnd = 1;
    fireEvent.keyDown(input, { key: 'n' });
    frames.forEach(cb => cb(0));
    expect(input.value).toBe('ਕਨਮ');
    expect(input.selectionStart).toBe(2);
    raf.mockRestore();
  });

  it('still calls external handlers', () => {
    const onKeyDown = vi.fn();
    const { getByLabelText } = render(
      <GurmukhiInput aria-label="ext" value="" onChange={() => {}} onKeyDown={onKeyDown} />,
    );
    fireEvent.keyDown(getByLabelText('ext'), { key: 'k' });
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { GurmukhiKeyboard } from '../src/keyboard';

afterEach(cleanup);

describe('GurmukhiKeyboard', () => {
  it('sends the produced character on click', () => {
    const onKeyPress = vi.fn();
    const { getByTitle } = render(<GurmukhiKeyboard onKeyPress={onKeyPress} showModifierToggles={false} />);
    fireEvent.click(getByTitle('k'));
    expect(onKeyPress).toHaveBeenCalledWith('ਕ');
  });

  it('shows the Option layer when controlled', () => {
    const { getByTitle } = render(<GurmukhiKeyboard option trackPhysicalModifiers={false} />);
    expect(getByTitle('t').textContent).toContain('ਟ');
  });
});

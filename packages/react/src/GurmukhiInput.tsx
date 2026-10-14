'use client';

import { forwardRef } from 'react';
import type { Layout } from '@atthebunga/gurmukhi-core';
import { useGurmukhiInput } from './useGurmukhiInput';

interface GurmukhiInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  // 'phonetic' (default) | 'igurbani' | 'gurmukhi-qwerty' | a custom Layout object
  layout?: string | Layout;
  // Disable transliteration (plain input)
  transliterate?: boolean;
  // Enable pattern-mode passthrough for { } _ * syntax
  patternMode?: boolean;
}

// Drop-in <input> replacement that automatically converts roman keystrokes
// to Gurmukhi unicode. Paste of existing Gurmukhi unicode passes through.
// Paste of ASCII is also converted.
const GurmukhiInput = forwardRef<HTMLInputElement, GurmukhiInputProps>(
  function GurmukhiInput(
    {
      value,
      onChange,
      layout = 'phonetic',
      transliterate = true,
      patternMode = false,
      onKeyDown: externalKeyDown,
      onPaste: externalPaste,
      ...rest
    },
    ref,
  ) {
    const { onKeyDown, onPaste } = useGurmukhiInput({
      value,
      onChange,
      layout,
      enabled: transliterate,
      patternMode,
    });

    return (
      <input
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { onKeyDown(e); externalKeyDown?.(e); }}
        onPaste={e => { onPaste(e); externalPaste?.(e); }}
        {...rest}
      />
    );
  },
);

export default GurmukhiInput;

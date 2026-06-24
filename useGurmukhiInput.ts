'use client';

import { useCallback } from 'react';
import { resolveKey } from './transliterate';
import { isGurmukhiChar } from './keymap';

// Keys that should always pass through unchanged even in transliteration mode
const PASSTHROUGH_KEYS = new Set([
  ' ', 'Backspace', 'Delete', 'Enter', 'Tab', 'Escape',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End', 'PageUp', 'PageDown',
]);

// Pattern syntax characters that should not be converted
const PATTERN_PASSTHROUGH = new Set(['_', '*', '{', '}', '(', ')', '|']);

interface UseGurmukhiInputOptions {
  value: string;
  onChange: (v: string) => void;
  // In pattern mode, curly-brace category names are left unconverted
  patternMode?: boolean;
  // Set to false to disable transliteration (acts as a plain input)
  enabled?: boolean;
}

interface GurmukhiInputHandlers {
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Hook that intercepts keydown events to convert roman keys to Gurmukhi.
// Spread the returned handlers onto any <input> or <textarea>.
// Pasted Gurmukhi unicode passes through untouched; pasted ASCII is converted.
export function useGurmukhiInput({
  value,
  onChange,
  patternMode = false,
  enabled = true,
}: UseGurmukhiInputOptions): GurmukhiInputHandlers {

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!enabled) return;
      if (e.key.length !== 1 || PASSTHROUGH_KEYS.has(e.key)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (patternMode && PATTERN_PASSTHROUGH.has(e.key)) return;

      // If already Gurmukhi unicode, let it through
      if (isGurmukhiChar(e.key)) return;

      // In pattern mode, don't convert text inside a { } category name
      if (patternMode && value.includes('{') && !value.includes('}')) return;

      const el = e.currentTarget;
      const start = el.selectionStart ?? value.length;
      const end   = el.selectionEnd   ?? value.length;
      const textBefore = value.slice(0, start);

      const gurmukhi = resolveKey(e.key, textBefore);
      if (!gurmukhi) return;

      e.preventDefault();
      const next = textBefore + gurmukhi + value.slice(end);
      onChange(next);

      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + gurmukhi.length;
      });
    },
    [enabled, patternMode, value, onChange],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!enabled) return;

      const pasted = e.clipboardData.getData('text');
      // If the pasted text contains any Gurmukhi, treat it as unicode — pass through
      if ([...pasted].some(ch => isGurmukhiChar(ch))) return;

      // Otherwise convert the pasted ASCII string to Gurmukhi
      e.preventDefault();
      const el = e.currentTarget as HTMLInputElement;
      const start = el.selectionStart ?? value.length;
      const end   = el.selectionEnd   ?? value.length;

      // Convert each pasted character with context
      let textBefore = value.slice(0, start);
      let converted = '';
      for (const ch of pasted) {
        const g = resolveKey(ch, textBefore + converted);
        converted += g ?? ch;
      }

      const next = textBefore + converted + value.slice(end);
      onChange(next);

      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + converted.length;
      });
    },
    [enabled, value, onChange],
  );

  return { onKeyDown, onPaste };
}

'use client';

import { useCallback, useMemo } from 'react';
import type { Layout } from './layouts';
import { LAYOUTS } from './layouts';
import { resolveKey } from './transliterate';
import { resolveKeydown, stripDeadKeyArtifacts } from './dispatch';
import { isGurmukhiChar } from './keymap';

interface UseGurmukhiInputOptions {
  value: string;
  onChange: (v: string) => void;
  // 'igurbani' (default) | 'gurmukhi-qwerty' | a custom Layout object
  layout?: string | Layout;
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
  layout: layoutProp = 'igurbani',
  patternMode = false,
  enabled = true,
}: UseGurmukhiInputOptions): GurmukhiInputHandlers {

  const layout = useMemo<Layout>(() => {
    if (typeof layoutProp === 'string') {
      const found = LAYOUTS[layoutProp];
      if (!found) throw new Error(`@atthebunga/gurmukhi-input: unknown layout "${layoutProp}"`);
      return found;
    }
    return layoutProp;
  }, [layoutProp]);

  const insertChar = useCallback(
    (el: HTMLInputElement | HTMLTextAreaElement, gurmukhi: string) => {
      const start = el.selectionStart ?? value.length;
      const end   = el.selectionEnd   ?? value.length;
      const next = value.slice(0, start) + gurmukhi + value.slice(end);
      onChange(next);

      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + gurmukhi.length;
      });
    },
    [value, onChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!enabled) return;

      const el = e.currentTarget;
      const start = el.selectionStart ?? value.length;
      const textBefore = value.slice(0, start);

      const action = resolveKeydown(e, textBefore, layout, {
        patternMode,
        valueHasOpenBrace: value.includes('{') && !value.includes('}'),
      });

      if (action.type === 'insert') {
        e.preventDefault();
        insertChar(el, action.text);

        // macOS dead keys still insert their accent after preventDefault.
        // Blur/refocus ends the composition, then strip the leftover mark.
        if (action.endComposition) {
          setTimeout(() => {
            el.blur();
            const caretNow = el.selectionStart ?? el.value.length;
            const cleaned = stripDeadKeyArtifacts(el.value, caretNow);
            if (cleaned.value !== el.value) onChange(cleaned.value);
            el.focus();
            requestAnimationFrame(() => {
              el.selectionStart = el.selectionEnd = cleaned.caret;
            });
          }, 0);
        }
      }
    },
    [enabled, patternMode, value, layout, insertChar, onChange],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!enabled) return;

      const pasted = e.clipboardData.getData('text');
      // If the pasted text contains any Gurmukhi, treat it as unicode — pass through
      if ([...pasted].some(ch => isGurmukhiChar(ch))) return;

      // Otherwise convert the pasted ASCII string to Gurmukhi
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart ?? value.length;
      const end   = el.selectionEnd   ?? value.length;

      // Convert each pasted character with context
      let textBefore = value.slice(0, start);
      let converted = '';
      for (const ch of pasted) {
        const g = resolveKey(ch, textBefore + converted, layout);
        converted += g ?? ch;
      }

      const next = textBefore + converted + value.slice(end);
      onChange(next);

      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + converted.length;
      });
    },
    [enabled, value, onChange, layout],
  );

  return { onKeyDown, onPaste };
}

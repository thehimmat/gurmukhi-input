'use client';

import { useCallback, useMemo } from 'react';
import type { EditState, Layout } from '@atthebunga/gurmukhi-core';
import { applyKeydown, applyPaste, resolveLayout, stripDeadKeyArtifacts } from '@atthebunga/gurmukhi-core';

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

type Field = HTMLInputElement | HTMLTextAreaElement;

function stateOf(el: Field, value: string): EditState {
  return {
    value,
    selectionStart: el.selectionStart ?? value.length,
    selectionEnd: el.selectionEnd ?? value.length,
  };
}

// Hook that intercepts keydown events to convert roman keys to Gurmukhi.
// Spread the returned handlers onto any <input> or <textarea>.
// Pasted Gurmukhi unicode passes through untouched; pasted ASCII is converted.
// All editing logic lives in @atthebunga/gurmukhi-core; this only wires it to React.
export function useGurmukhiInput({
  value,
  onChange,
  layout: layoutProp = 'igurbani',
  patternMode = false,
  enabled = true,
}: UseGurmukhiInputOptions): GurmukhiInputHandlers {

  const layout = useMemo(() => resolveLayout(layoutProp), [layoutProp]);

  // Commit a new value, then restore the caret once React has re-rendered
  const commit = useCallback(
    (el: Field, next: EditState) => {
      onChange(next.value);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = next.selectionStart;
      });
    },
    [onChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<Field>) => {
      if (!enabled) return;

      const el = e.currentTarget;
      const next = applyKeydown(stateOf(el, value), e, layout, { patternMode });
      if (!next) return;

      e.preventDefault();
      commit(el, next);

      // macOS dead keys still insert their accent after preventDefault.
      // Blur/refocus ends the composition, then strip the leftover mark.
      if (next.endComposition) {
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
    },
    [enabled, patternMode, value, layout, commit, onChange],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<Field>) => {
      if (!enabled) return;

      const el = e.currentTarget;
      const next = applyPaste(stateOf(el, value), e.clipboardData.getData('text'), layout);
      if (!next) return;

      e.preventDefault();
      commit(el, next);
    },
    [enabled, value, layout, commit],
  );

  return { onKeyDown, onPaste };
}

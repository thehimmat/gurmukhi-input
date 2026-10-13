import type { Layout } from './layouts';
import { isGurmukhiChar } from './keymap';
import { resolveKey } from './transliterate';

// The subset of a KeyboardEvent the dispatcher needs. Kept structural so it
// works with React synthetic events, DOM events, and plain test objects.
export type KeyEventLike = {
  key: string;
  code: string;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
};

export type KeydownAction =
  // endComposition: the key was a macOS dead key (Option+e, Option+u, …) and
  // the browser will still insert its accent mark — the caller must clean up.
  | { type: 'insert'; text: string; endComposition?: boolean }
  | { type: 'passthrough' };

// Accent marks macOS dead keys leave behind (˜ ´ ˆ ¨ ` etc.)
const DEAD_KEY_ARTIFACTS = /[˜´ˆ¨`ˋˊ¯~]/g;

// Remove dead-key accent marks from value, keeping the caret in place.
export function stripDeadKeyArtifacts(value: string, caret: number): { value: string; caret: number } {
  const left = value.slice(0, caret).replace(DEAD_KEY_ARTIFACTS, '');
  const right = value.slice(caret).replace(DEAD_KEY_ARTIFACTS, '');
  return { value: left + right, caret: left.length };
}

// Pattern syntax characters that should not be converted
const PATTERN_PASSTHROUGH = new Set(['_', '*', '{', '}', '(', ')', '|']);

// Decide what a keydown should do: insert Gurmukhi text, or let the browser
// handle it. Pure — no DOM access — so every framework binding can share it.
export function resolveKeydown(
  e: KeyEventLike,
  textBefore: string,
  layout: Layout,
  opts?: { patternMode?: boolean; valueHasOpenBrace?: boolean },
): KeydownAction {
  // Already Gurmukhi (e.g. a system Gurmukhi keyboard is active)
  if (e.key.length === 1 && isGurmukhiChar(e.key)) return { type: 'passthrough' };

  // Shortcuts (copy, paste, select all, …)
  if (e.metaKey || e.ctrlKey) return { type: 'passthrough' };

  // Option layers are keyed by e.code — e.key is a dead key or symbol on macOS
  if (e.altKey) {
    const map = e.shiftKey ? layout.optionShift : layout.option;
    const text = map?.[e.code];
    if (text) {
      return e.key === 'Dead'
        ? { type: 'insert', text, endComposition: true }
        : { type: 'insert', text };
    }
    return { type: 'passthrough' };
  }

  // Named keys (Backspace, ArrowLeft, Enter, …)
  if (e.key.length !== 1) return { type: 'passthrough' };

  if (opts?.patternMode) {
    if (PATTERN_PASSTHROUGH.has(e.key)) return { type: 'passthrough' };
    // Don't convert text inside a { } category name
    if (opts.valueHasOpenBrace) return { type: 'passthrough' };
  }

  const text = resolveKey(e.key, textBefore, layout);
  if (text) return { type: 'insert', text };
  return { type: 'passthrough' };
}

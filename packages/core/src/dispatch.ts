import type { Layout } from './layouts';
import { isGurmukhiChar } from './keymap';
import { resolveKeyEdit } from './transliterate';

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
  // deleteBefore: remove that many characters before the caret first (a vowel
  // sign moving before ੰ ੱ ਂ, or a dropped virama). composing: the key was the
  // inherent vowel; pass it back as opts.composing on the next keydown.
  | { type: 'insert'; text: string; deleteBefore?: number; endComposition?: boolean; composing?: string }
  // Encoded layouts: replace the deleteBefore characters before the caret
  // with text. composing is the raw keys of the word so far; pass it back as
  // opts.composing on the next keydown.
  | { type: 'compose'; deleteBefore: number; text: string; composing: string }
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
  opts?: { patternMode?: boolean; valueHasOpenBrace?: boolean; composing?: string },
): KeydownAction {
  // Already Gurmukhi (e.g. a system Gurmukhi keyboard is active)
  if (e.key.length === 1 && isGurmukhiChar(e.key)) return { type: 'passthrough' };

  // Shortcuts (copy, paste, select all, …)
  if (e.metaKey || e.ctrlKey) return { type: 'passthrough' };

  // Option layers are keyed by e.code — e.key is a dead key or symbol on macOS
  if (e.altKey && !layout.encoded) {
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

  if (layout.encoded) {
    if (e.altKey || /\s/.test(e.key)) return { type: 'passthrough' };
    return compose(e.key, textBefore, layout.encoded, opts?.composing);
  }

  const afterInherent = !!layout.inherentKey && opts?.composing === layout.inherentKey;
  const edit = resolveKeyEdit(e.key, textBefore, layout, afterInherent);
  if (!edit) return { type: 'passthrough' };
  const action: KeydownAction = { type: 'insert', text: edit.text };
  if (edit.deleteBefore) action.deleteBefore = edit.deleteBefore;
  if (edit.inherent) action.composing = e.key;
  return action;
}

// The word being typed, as keys: the caller's buffer if the text still ends
// with what it renders to, else recovered from the trailing Gurmukhi. The
// buffer matters mid-word: 'si' and 'is' both render as ਸਿ, but only 'si'
// puts the sihari on the next consonant.
function compose(
  key: string,
  textBefore: string,
  encoded: NonNullable<Layout['encoded']>,
  composing: string | undefined,
): KeydownAction {
  let keys: string;
  let deleteBefore: number;
  const rendered = composing ? encoded.toUnicode(composing) : '';
  if (composing && textBefore.endsWith(rendered)) {
    keys = composing;
    deleteBefore = rendered.length;
  } else {
    let start = textBefore.length;
    while (start > 0 && isGurmukhiChar(textBefore[start - 1])) start--;
    const word = textBefore.slice(start);
    keys = encoded.fromUnicode(word);
    deleteBefore = word.length;
  }
  keys += key;
  return { type: 'compose', deleteBefore, text: encoded.toUnicode(keys), composing: keys };
}

import type { Layout } from './layouts';
import { LAYOUTS } from './layouts';
import type { KeyEventLike } from './dispatch';
import { resolveKeydown } from './dispatch';
import { isGurmukhiChar } from './keymap';
import { resolveKey } from './transliterate';

// The text-field state the controller works on. Mirrors an <input>'s
// value / selectionStart / selectionEnd, so any binding can read and write it.
export type EditState = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

// endComposition: see KeydownAction — the binding must strip the dead-key
// accent the browser inserts after the event (stripDeadKeyArtifacts).
export type EditResult = EditState & { endComposition?: boolean };

export function resolveLayout(layout: string | Layout): Layout {
  if (typeof layout === 'string') {
    const found = LAYOUTS[layout];
    if (!found) throw new Error(`@atthebunga/gurmukhi-input: unknown layout "${layout}"`);
    return found;
  }
  return layout;
}

// Replace the selection with text and put the caret after it.
function splice(state: EditState, text: string): EditState {
  const { value, selectionStart: start, selectionEnd: end } = state;
  return {
    value: value.slice(0, start) + text + value.slice(end),
    selectionStart: start + text.length,
    selectionEnd: start + text.length,
  };
}

// Apply a keydown to the field state. Returns the next state, or null when the
// key isn't ours and the browser should handle it (don't preventDefault).
export function applyKeydown(
  state: EditState,
  e: KeyEventLike,
  layout: Layout,
  opts?: { patternMode?: boolean },
): EditResult | null {
  const { value, selectionStart } = state;
  const action = resolveKeydown(e, value.slice(0, selectionStart), layout, {
    patternMode: opts?.patternMode,
    valueHasOpenBrace: value.includes('{') && !value.includes('}'),
  });
  if (action.type === 'passthrough') return null;

  const next = splice(state, action.text);
  return action.endComposition ? { ...next, endComposition: true } : next;
}

// Apply a paste to the field state. Pasted Gurmukhi unicode returns null (let
// the browser paste it as-is); pasted ASCII is converted character by
// character, using the text before the caret as vowel context.
export function applyPaste(state: EditState, pasted: string, layout: Layout): EditState | null {
  if ([...pasted].some(ch => isGurmukhiChar(ch))) return null;

  const textBefore = state.value.slice(0, state.selectionStart);
  let converted = '';
  for (const ch of pasted) {
    const g = resolveKey(ch, textBefore + converted, layout);
    converted += g ?? ch;
  }
  return splice(state, converted);
}

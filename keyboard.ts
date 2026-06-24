import type { Layout } from './layouts';
import { LAYOUTS } from './layouts';
import { isCombiningGurmukhi } from './keymap';
import { US_ANSI_ROWS } from './geometry';

export type Modifiers = { shift?: boolean; option?: boolean };

export type ResolvedKey = {
  code: string;     // physical key code, e.g. 'KeyT'
  hint: string;     // ascii label for the current modifier state ('t' or 'T')
  output: string;   // actual Gurmukhi char produced, '' if unmapped (used for click-insert)
  display: string;  // render form: output, or ◌+output when output is a combining mark
};

const DOTTED_CIRCLE = '◌';

function toLayout(layout: string | Layout): Layout {
  if (typeof layout === 'string') {
    const found = LAYOUTS[layout];
    if (!found) throw new Error(`@atthebunga/gurmukhi-input: unknown layout "${layout}"`);
    return found;
  }
  return layout;
}

// Resolve every physical key to what the given layout produces under the
// current modifier state. Returns rows matching US_ANSI_ROWS.
export function resolveKeyboard(layout: string | Layout, mods: Modifiers): ResolvedKey[][] {
  const lay = toLayout(layout);

  return US_ANSI_ROWS.map(row =>
    row.map(pk => {
      const hint = mods.shift ? pk.shiftKey : pk.key;

      let output = '';
      if (mods.option) {
        const map = mods.shift ? lay.optionShift : lay.option;
        output = map?.[pk.code] ?? '';
      } else {
        output = lay.keys[hint] ?? lay.vowelMatra?.[hint] ?? '';
      }

      const display = output && isCombiningGurmukhi(output) ? DOTTED_CIRCLE + output : output;

      return { code: pk.code, hint, output, display };
    }),
  );
}

export { US_ANSI_ROWS } from './geometry';
export type { PhysicalKey } from './geometry';
export { default as GurmukhiKeyboard } from './GurmukhiKeyboard';
export type { Layout } from './layouts';
export { LAYOUTS } from './layouts';

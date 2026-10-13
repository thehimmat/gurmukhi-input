import type { Layout } from './layouts';
import { isCombiningGurmukhi } from './keymap';
import { US_ANSI_ROWS } from './geometry';
import { resolveLayout } from './editor';

export type Modifiers = { shift?: boolean; option?: boolean };

export type ResolvedKey = {
  code: string;     // physical key code, e.g. 'KeyT'
  hint: string;     // ascii label for the current modifier state ('t' or 'T')
  output: string;   // actual Gurmukhi char produced, '' if unmapped (used for click-insert)
  display: string;  // render form: output, or ◌+output when output is a combining mark
};

const DOTTED_CIRCLE = '◌';

// Resolve every physical key to what the given layout produces under the
// current modifier state. Returns rows matching US_ANSI_ROWS.
export function resolveKeyboard(layout: string | Layout, mods: Modifiers): ResolvedKey[][] {
  const lay = resolveLayout(layout);

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

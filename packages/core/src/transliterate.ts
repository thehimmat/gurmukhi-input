import type { Layout } from './layouts';
import { isGurmukhiConsonant, lastGurmukhiBase } from './keymap';

// Given the text before the cursor and a typed key, return the Gurmukhi
// character to insert (or null if the key has no mapping in this layout).
export function resolveKey(
  key: string,        // e.key — the character the key produces
  textBefore: string, // value to the left of the cursor
  layout: Layout,
): string | null {
  if (key in layout.keys) return layout.keys[key];

  // Context-sensitive vowels: matra after a consonant, standalone otherwise
  if (layout.vowelStandalone && key in layout.vowelStandalone) {
    const prev = lastGurmukhiBase(textBefore);
    if (prev && isGurmukhiConsonant(prev)) {
      return layout.vowelMatra![key];
    }
    return layout.vowelStandalone[key];
  }

  return null;
}

// Convert a full roman string to Gurmukhi (no context — treats each char as
// standalone). Useful for batch conversion or first-letter search mode.
export function romanToGurmukhi(roman: string, layout: Layout): string {
  if (layout.encoded) return layout.encoded.toUnicode(roman);
  return roman
    .split('')
    .map(ch => {
      if (ch in layout.keys) return layout.keys[ch];
      if (layout.vowelStandalone?.[ch]) return layout.vowelStandalone[ch];
      return ch;
    })
    .join('');
}

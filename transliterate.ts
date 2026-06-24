import {
  CONSONANT_KEY_MAP,
  VOWEL_STANDALONE,
  VOWEL_MATRAS,
  MARK_MAP,
  isGurmukhiConsonant,
  lastGurmukhiBase,
} from './keymap';

// Given the text before the cursor and a typed key, return the Gurmukhi
// character to insert (or null if the key has no mapping).
export function resolveKey(key: string, textBefore: string): string | null {
  // Marks are always combining — no context needed
  if (key in MARK_MAP) return MARK_MAP[key];

  // Consonant keys
  if (key in CONSONANT_KEY_MAP) return CONSONANT_KEY_MAP[key];

  // Vowel keys: decide standalone vs matra based on preceding character
  if (key in VOWEL_STANDALONE) {
    const prev = lastGurmukhiBase(textBefore);
    if (prev && isGurmukhiConsonant(prev)) {
      return VOWEL_MATRAS[key];
    }
    return VOWEL_STANDALONE[key];
  }

  return null;
}

// Convert a full roman string to Gurmukhi (no context — treats each char as
// standalone). Useful for batch conversion or first-letter search mode.
export function romanToGurmukhi(roman: string): string {
  return roman
    .split('')
    .map(ch => CONSONANT_KEY_MAP[ch] ?? VOWEL_STANDALONE[ch] ?? MARK_MAP[ch] ?? ch)
    .join('');
}

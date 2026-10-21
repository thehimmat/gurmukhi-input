import type { Layout } from './layouts';
import { isGurmukhiConsonant, lastGurmukhiBase } from './keymap';

// What a key does to the text before the caret: delete deleteBefore
// characters, then insert text. inherent: the key was the inherent vowel.
export type KeyEdit = { deleteBefore: number; text: string; inherent?: true };

// Marks a vowel sign is written before (ਕਿੰ, not ਕੰਿ). A virama among them
// is dropped, since a vowel can't follow one.
const TRAILING_MARKS = /[ੰੱਂ੍]+$/;
const VIRAMAS = /੍/g;

// A vowel key in context: the sign or letter it gives, and the marks after
// its consonant that the sign goes before ('' for a standalone vowel).
function resolveVowel(
  key: string,
  textBefore: string,
  layout: Layout,
  afterInherent: boolean,
): { vowel: string; marks: string } | null {
  if (!layout.vowelStandalone || !(key in layout.vowelStandalone)) return null;
  const marks = TRAILING_MARKS.exec(textBefore)?.[0] ?? '';
  const prev = lastGurmukhiBase(textBefore.slice(0, textBefore.length - marks.length));
  if (afterInherent || !prev || !isGurmukhiConsonant(prev)) {
    return { vowel: layout.vowelStandalone[key], marks: '' };
  }
  return { vowel: key === layout.inherentKey ? '' : layout.vowelMatra![key], marks };
}

// Given the text before the cursor and a typed key, return the Gurmukhi
// character the key gives (or null if the key has no mapping in this layout).
// '' is the inherent vowel: nothing to insert, but pass afterInherent on the
// next key so a vowel there is standalone. resolveKeyEdit says where it goes.
export function resolveKey(
  key: string,        // e.key — the character the key produces
  textBefore: string, // value to the left of the cursor
  layout: Layout,
  afterInherent = false,
): string | null {
  if (key in layout.keys) return layout.keys[key];
  return resolveVowel(key, textBefore, layout, afterInherent)?.vowel ?? null;
}

// The edit a key makes: resolveKey's character, with a vowel sign moved
// before any tippi, bindi or addak after its consonant, and a virama there
// dropped (ਕੰ + i → ਕਿੰ, ਕ੍ + A → ਕਾ).
export function resolveKeyEdit(
  key: string,
  textBefore: string,
  layout: Layout,
  afterInherent = false,
): KeyEdit | null {
  if (key in layout.keys) return { deleteBefore: 0, text: layout.keys[key] };
  const v = resolveVowel(key, textBefore, layout, afterInherent);
  if (!v) return null;
  const edit: KeyEdit = { deleteBefore: v.marks.length, text: v.vowel + v.marks.replace(VIRAMAS, '') };
  if (key === layout.inherentKey && v.vowel === '') edit.inherent = true;
  return edit;
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

import { fromUnicode, toUnicode } from '@atthebunga/gurmukhi-legacy';
import { US_ANSI_ROWS } from '../geometry';
import { isGurmukhiChar } from '../keymap';
import type { Layout } from './index';

// igurbani.com's search box is a plain text field set in the GurbaniAkhar
// font: what you type is the font's ASCII, so sihari goes before its
// consonant (ikrpw → ਕਿਰਪਾ), vowels are built from carriers (au → ਉ,
// hoveI → ਹੋਵਈ), <> is ੴ, [ ] are । ॥ and the number row is Gurmukhi.
// This layout reproduces it by converting the ASCII of the word being typed.

// The converter maps a lone < or > to the font's half-ੴ code points; show
// the key itself until the pair is complete.
const display = (keys: string): string => toUnicode(keys).replace(/Å/g, '<').replace(/Æ/g, '>');

// What each key types on its own, for the on-screen keyboard and resolveKey.
const keys: Record<string, string> = {};
for (const pk of US_ANSI_ROWS.flat()) {
  for (const ch of [pk.key, pk.shiftKey]) {
    const out = toUnicode(ch);
    if ([...out].some(c => isGurmukhiChar(c) || c === '।' || c === '॥')) keys[ch] = out;
  }
}

export const igurbani: Layout = {
  name: 'igurbani',
  description: 'igurbani.com / GurbaniAkhar keyboard: font ASCII in visual order (vwihgurU → ਵਾਹਿਗੁਰੂ)',
  keys,
  encoded: { toUnicode: display, fromUnicode },
};

import { phonetic } from './phonetic';
import { igurbani } from './igurbani';
import { gurmukhiQwerty } from './gurmukhi-qwerty';

// A keyboard layout maps typed keys to Gurmukhi.
//
// `keys` is looked up by e.key (the character the key produces). Layouts with
// context-sensitive vowels (phonetic) also set `vowelStandalone` / `vowelMatra`:
// a vowel key produces the matra after a consonant, the standalone letter
// otherwise. `option` / `optionShift` are looked up by e.code, since macOS
// turns Option+key into dead keys or symbols that don't identify the key.
//
// An `encoded` layout (igurbani) is a legacy-font keyboard: keys are the
// font's ASCII and only make sense as a whole word (sihari is typed before
// its consonant), so each key re-converts the word being typed. `keys` then
// only says what a key gives on its own, for the on-screen keyboard.
export type Layout = {
  name: string;
  description: string;
  keys: Record<string, string>;
  vowelStandalone?: Record<string, string>;
  vowelMatra?: Record<string, string>;
  option?: Record<string, string>;
  optionShift?: Record<string, string>;
  encoded?: EncodedLayout;
};

export type EncodedLayout = {
  toUnicode: (keys: string) => string;
  fromUnicode: (text: string) => string;
};

export const LAYOUTS: Record<string, Layout> = {
  phonetic,
  igurbani,
  'gurmukhi-qwerty': gurmukhiQwerty,
};

import { igurbani } from './igurbani';
import { gurmukhiQwerty } from './gurmukhi-qwerty';

// A keyboard layout maps typed keys to Gurmukhi.
//
// `keys` is looked up by e.key (the character the key produces). Layouts with
// context-sensitive vowels (igurbani) also set `vowelStandalone` / `vowelMatra`:
// a vowel key produces the matra after a consonant, the standalone letter
// otherwise. `option` / `optionShift` are looked up by e.code, since macOS
// turns Option+key into dead keys or symbols that don't identify the key.
export type Layout = {
  name: string;
  description: string;
  keys: Record<string, string>;
  vowelStandalone?: Record<string, string>;
  vowelMatra?: Record<string, string>;
  option?: Record<string, string>;
  optionShift?: Record<string, string>;
};

export const LAYOUTS: Record<string, Layout> = {
  igurbani,
  'gurmukhi-qwerty': gurmukhiQwerty,
};

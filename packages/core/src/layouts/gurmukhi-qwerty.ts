import type { Layout } from './index';

export const gurmukhiQwerty: Layout = {
  name: 'gurmukhi-qwerty',
  description: 'macOS "Gurmukhi - QWERTY" keyboard — phonetic QWERTY layout with Option-layer retroflexes',
  keys: {
    // ── Plain layer ────────────────────────────────────────────────────────
    // Vowel matras (combining — attach to preceding consonant)
    'a': 'ਾ', // aa matra
    'e': 'ੇ',
    'E': 'ੈ', // e / ai matras
    'i': 'ਿ',
    'I': 'ੀ', // i / ii matras
    'o': 'ੋ',
    'O': 'ੌ', // o / au matras
    'u': 'ੁ',
    'U': 'ੂ', // u / uu matras
    // Vowel carriers (standalone — for word-initial vowel sounds)
    'q': 'ੳ', // oora carrier (u/o sounds)
    'Q': 'ੲ', // eeree carrier (i sounds)
    'w': 'ਅ', // aa carrier (a/aa sounds)
    'W': 'ਆ', // long aa standalone
    // Consonants — plain
    's': 'ਸ',
    'S': 'ਸ਼',
    'd': 'ਦ',
    'D': 'ਧ',
    'f': '੍', // virama (sub-consonant joiner)
    'F': '਼', // nukta (combining dot below)
    'g': 'ਗ',
    'G': 'ਘ',
    'h': 'ਹ',
    'H': 'ਃ', // h / visarg
    'z': 'ਙ', // nga (velar nasal)
    'x': 'ੜ', // hakka rara
    'c': 'ਚ',
    'C': 'ਛ',
    'v': 'ਵ',
    'V': 'ੴ', // v / ik onkar
    'b': 'ਬ',
    'B': 'ਭ',
    'r': 'ਰ',
    'y': 'ਯ',
    't': 'ਤ',
    'T': 'ਥ',
    'p': 'ਪ',
    'P': 'ਫ',
    'l': 'ਲ',
    'L': 'ਲ਼',
    'j': 'ਜ',
    'J': 'ਝ',
    'k': 'ਕ',
    'K': 'ਖ',
    'n': 'ਨ',
    'N': 'ਣ',
    'm': 'ਮ',
    'M': 'ਂ', // m / bindi
    // Gurmukhi digits (number row, plain — matches macOS keyboard)
    '1': '੧',
    '2': '੨',
    '3': '੩',
    '4': '੪',
    '5': '੫',
    '6': '੬',
    '7': '੭',
    '8': '੮',
    '9': '੯',
    '0': '੦',
    // Punctuation & marks
    ']': 'ੰ', // tippi
    '[': 'ੱ', // addak (gemination)
    '.': '।', // danda
    '>': '॥', // double danda (Shift+.)
    '`': 'ੑ', // udaat (rare mark)
    '~': 'ੵ', // yakash (Shift+`)
  },
  // No context-sensitive vowels — all vowel forms are explicit keys above
  // ── Option layer (⌥) — keyed by e.code ──────────────────────────────────
  option: {
    // Retroflexes (unaspirated)
    'KeyT': 'ਟ', // ⌥t
    'KeyD': 'ਡ', // ⌥d
    // Nukta series (Persian/loanword consonants)
    'KeyG': 'ਗ਼', // ⌥g
    'KeyJ': 'ਜ਼', // ⌥j
    'KeyK': 'ਖ਼', // ⌥k
    'KeyP': 'ਫ਼', // ⌥p
    // Palatal nasal
    'KeyN': 'ਞ', // ⌥n
    // Rare mark
    'KeyM': 'ਁ', // ⌥m (chandrabindu)
    // Standalone vowel letters (for word-initial use)
    'KeyA': 'ਅ', // ⌥a
    'KeyE': 'ਏ', // ⌥e
    'KeyI': 'ਇ', // ⌥i
    'KeyO': 'ਓ', // ⌥o
    'KeyU': 'ਉ', // ⌥u
  },
  // ── Option+Shift layer (⌥⇧) — keyed by e.code ───────────────────────────
  optionShift: {
    // Retroflexes (aspirated)
    'KeyT': 'ਠ', // ⌥⇧T
    'KeyD': 'ਢ', // ⌥⇧D
    // Long standalone vowel letters
    'KeyA': 'ਆ', // ⌥⇧A
    'KeyE': 'ਐ', // ⌥⇧E
    'KeyI': 'ਈ', // ⌥⇧I
    'KeyO': 'ਔ', // ⌥⇧O
    'KeyU': 'ਊ', // ⌥⇧U
  }
};

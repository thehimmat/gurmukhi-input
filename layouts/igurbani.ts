import type { Layout } from './index';

export const igurbani: Layout = {
  name: 'igurbani',
  description: 'igurbani.com phonetic layout — the standard for Gurbani software',
  keys: {
    // Gutturals / sibilants
    's': 'ਸ',
    'S': 'ਸ਼', // sha (ਸ + nukta)
    'h': 'ਹ',
    // Velars
    'k': 'ਕ',
    'K': 'ਖ',
    'g': 'ਗ',
    'G': 'ਘ',
    '`': 'ਙ', // nga — backtick (free key in igurbani)
    // Palatals
    'c': 'ਚ',
    'C': 'ਛ',
    'j': 'ਜ',
    'J': 'ਝ',
    '[': 'ਞ', // nya — square bracket (free key in igurbani)
    // Retroflexes (igurbani uses t/T/d/D for retroflexes)
    't': 'ਟ',
    'T': 'ਠ',
    'd': 'ਡ',
    'D': 'ਢ',
    'N': 'ਣ',
    'R': 'ੜ', // hakka rara
    // Dentals (igurbani uses q/Q/z/Z for dentals)
    'q': 'ਤ',
    'Q': 'ਥ',
    'z': 'ਦ',
    'Z': 'ਧ',
    'n': 'ਨ',
    // Labials
    'p': 'ਪ',
    'P': 'ਫ',
    'f': 'ਫ਼', // fa with nukta — Persian loanwords
    'b': 'ਬ',
    'B': 'ਭ',
    'm': 'ਮ',
    // Sonorants
    'X': 'ਯ', // yaya (capital X in igurbani)
    'r': 'ਰ',
    'l': 'ਲ',
    'v': 'ਵ',
    'w': 'ਵ', // two ways to type vava
    'L': 'ਲ਼', // lla with nukta
    // Combining marks
    'M': 'ਂ', // bindi
    '^': 'ੰ', // tippi
    'W': 'ੱ', // addak (gemination)
    ':': 'ਃ', // visarg
    '~': '੍', // virama (sub-consonant joiner)
  },
  // Context-sensitive vowels
  vowelStandalone: {
    'a': 'ਅ',
    'A': 'ਆ',
    'i': 'ਇ',
    'I': 'ਈ',
    'u': 'ੳ', // oora carrier (original igurbani)
    'U': 'ਊ',
    'e': 'ਏ',
    'E': 'ਐ',
    'o': 'ਓ',
    'O': 'ਔ',
  },
  vowelMatra: {
    'a': 'ਾ',
    'A': 'ਾ',
    'i': 'ਿ',
    'I': 'ੀ',
    'u': 'ੁ',
    'U': 'ੂ',
    'e': 'ੇ',
    'E': 'ੈ',
    'o': 'ੋ',
    'O': 'ੌ',
  }
  // igurbani has no Option-layer mappings (purely ASCII)
};

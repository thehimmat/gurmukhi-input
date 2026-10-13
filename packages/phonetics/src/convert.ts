import rulesJson from '../data/rules.json';

// The rule set, exported from gurmukhi-rule-builder (data/rules.json)
export type Rules = {
  exportedAt: string;
  primitives: Record<string, string>;
  overrides: Record<string, string>;
  vowelClusters: Record<string, string>;
  specialMarkRules: { mark: string; name: string; effect: string }[];
  placeOfArticulation: Record<string, string>;
  nasalResolution: Record<string, string>;
  lowToneConsonants: string[];
};

export const rules: Rules = rulesJson;

const VOWEL_DIACRITICS = new Set(['ਾ', 'ਿ', 'ੀ', 'ੁ', 'ੂ', 'ੇ', 'ੈ', 'ੋ', 'ੌ']);
const NASALS = new Set(['ਂ', 'ੰ']);
const ADDAK = 'ੱ'; // gemination mark
const VIRAMA = '੍'; // halant / virama
const INHERENT_VOWEL = 'ə';
// Independent vowel letters are a syllable nucleus on their own, so they never
// take the inherent schwa a bare consonant does. ਅ's own value is also "ə",
// which is why the final-schwa drop must not key on the string.
const INDEPENDENT_VOWELS = new Set(['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ', 'ਊ', 'ਏ', 'ਐ', 'ਓ', 'ਔ']);

export type ConvertOptions = {
  // Keep the trailing inherent schwa on a final bare consonant
  finalSchwa: boolean;
  // Give independent vowels an inherent schwa too. Wrong, but it's what the
  // stored voice-search keys were built with, so phoneticKey keeps it.
  independentVowelSchwa: boolean;
};

function ipaOf(char: string): string {
  return rules.primitives[char] ?? '';
}

// Tippi / bindi take the place of articulation of the consonant after them
function resolveNasal(nextConsonant: string | null): string {
  if (!nextConsonant) return 'n̪';
  const place = rules.placeOfArticulation[nextConsonant] ?? 'dental';
  return rules.nasalResolution[place] ?? 'n̪';
}

// Convert one Gurmukhi word to IPA. Handles consonant + vowel sign, the
// inherent vowel, nasal assimilation, gemination (addak) and virama clusters.
// Does not model tone.
export function convertWord(word: string, opts: ConvertOptions): string {
  const chars = [...word];
  let result = '';
  // result.length right after an inherent schwa was appended; if nothing
  // follows it, that schwa is the word-final one
  let inherentEnd = -1;
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];
    const next = chars[i + 1] ?? null;

    if (ch === ADDAK) {
      if (next) result += ipaOf(next);
      i++;
      continue;
    }

    if (ch === VIRAMA) {
      i++;
      continue;
    }

    if (NASALS.has(ch)) {
      result += resolveNasal(next);
      i++;
      continue;
    }

    // A vowel sign not consumed by a consonant below
    if (VOWEL_DIACRITICS.has(ch)) {
      result += ipaOf(ch);
      i++;
      continue;
    }

    // Consonant + vowel sign pairs with a hand-tuned pronunciation
    if (next && rules.overrides[ch + next]) {
      result += rules.overrides[ch + next];
      i += 2;
      continue;
    }

    const consonant = ipaOf(ch);
    result += consonant;

    if (next && VOWEL_DIACRITICS.has(next)) {
      result += ipaOf(next);
      i += 2;
      const afterVowel = chars[i] ?? null;
      if (afterVowel && NASALS.has(afterVowel)) {
        result += resolveNasal(chars[i + 1] ?? null);
        i++;
      }
      continue;
    }

    // Consonant cluster: no inherent vowel
    if (next === VIRAMA) {
      i += 2;
      continue;
    }

    if (consonant !== '' && (opts.independentVowelSchwa || !INDEPENDENT_VOWELS.has(ch))) {
      result += INHERENT_VOWEL;
      inherentEnd = result.length;
    }
    i++;
  }

  if (!opts.finalSchwa && inherentEnd === result.length) {
    result = result.slice(0, -INHERENT_VOWEL.length);
  }
  return result;
}

// Apply fn to each whitespace-separated word, keeping the whitespace
export function eachWord(text: string, fn: (word: string) => string): string {
  return text.split(/(\s+)/).map(part => (/^\s*$/.test(part) ? part : fn(part))).join('');
}

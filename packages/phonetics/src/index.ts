import { convertWord, eachWord } from './convert';
import { normalizeIPA } from './normalize';

export { rules } from './convert';
export type { Rules } from './convert';
export { normalizeIPA } from './normalize';
export { romanPhoneticKey } from './roman';

export type IpaOptions = {
  // Keep the trailing inherent schwa on a word-final bare consonant. Default
  // false: Gurbani recitation usually leaves a final mukta consonant unvoiced.
  finalSchwa?: boolean;
};

// Faithful IPA for display. Accepts a word or a line; words are converted
// independently and whitespace is kept.
export function toIPA(text: string, opts: IpaOptions = {}): string {
  const finalSchwa = opts.finalSchwa ?? false;
  return eachWord(text, w => convertWord(w, { finalSchwa, independentVowelSchwa: false, legacyMarks: false }));
}

// A deliberately lossy key for fuzzy matching (voice or romanized search):
// two words a listener can't tell apart should get the same key. Stable —
// identical to the keys gurmukhi-voice-search stores in words.phonetic_ipa.
export function phoneticKey(text: string): string {
  return eachWord(text, w => normalizeIPA(convertWord(w, { finalSchwa: true, independentVowelSchwa: true, legacyMarks: true })));
}

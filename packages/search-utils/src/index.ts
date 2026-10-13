// Spelling-variant folding — the words.search_fold key
export { foldGurmukhi } from './fold';

// Word split used by the search index
export { tokenize } from './tokenize';

// First-letter search
export { firstLetters, matchesFirstLetters } from './first-letters';

// {category} pattern language
export { compilePattern, listCategories, patternToRegExp } from './pattern';
export type { CompileResult } from './pattern';

// Character taxonomy and syllables
export {
  CONSONANTS,
  VOWEL_CARRIERS,
  VOWEL_DIACRITICS,
  NASAL_MARKS,
  VIRAMA,
  ADDAK,
  VISARG,
  BASE_CHARS,
  CHAR_CATEGORIES,
  MUKTA_SYMBOL,
  VOWEL_SIGN_OPTIONS,
  isCombiningMark,
  isBaseChar,
  parseSyllables,
} from './chars';
export type { Syllable } from './chars';

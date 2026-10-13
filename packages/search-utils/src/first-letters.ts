import { tokenize } from './tokenize';

// The first letter of each word in a line, using the same word split as the
// search index (tokenize). 'ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥' → 'ਸਨਕਪ'
export function firstLetters(line: string): string {
  return tokenize(line).map(w => String.fromCodePoint(w.codePointAt(0)!)).join('');
}

// First-letter search for one line: word i must start with letters[i], counting
// from the start of the line. Same rule as the search_first_letters RPC
// (`word like letter || '%'`), so client and database results agree.
// `letters` is an array, or a string split into codepoints.
export function matchesFirstLetters(line: string, letters: string | string[]): boolean {
  const wanted = typeof letters === 'string' ? [...letters] : letters;
  if (wanted.length === 0) return false;
  const words = tokenize(line);
  if (wanted.length > words.length) return false;
  return wanted.every((letter, i) => words[i].startsWith(letter));
}

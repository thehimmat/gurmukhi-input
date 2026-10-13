# @atthebunga/gurmukhi-search-utils

Building blocks for searching Gurmukhi text, extracted from the search used by [search.atthebunga.com](https://search.atthebunga.com). Pure TypeScript with no dependencies.

```bash
npm install @atthebunga/gurmukhi-search-utils
```

## Spelling-variant folding

```ts
import { foldGurmukhi } from '@atthebunga/gurmukhi-search-utils';

foldGurmukhi('ਟੀਕਾ') === foldGurmukhi('ਤੀਕਾ');   // retroflex ↔ dental
foldGurmukhi('ਖ਼ਾਲਸਾ') === foldGurmukhi('ਖਾਲਸਾ'); // nukta
foldGurmukhi('ਸਭੁ') === foldGurmukhi('ਸਭ');      // final short matra
```

`foldGurmukhi` reduces a string to a lossy key that spelling variants share:
- retroflex consonants fold to dental, and ੜ to ਰ
- nukta, vowel length and nasal signs fold away
- addak and visarga are dropped
- one grammatical final short matra is dropped

Aspiration and kanna are kept, because they distinguish words. Fold both the stored text and the query, then match on prefix. Non-Gurmukhi characters are ignored.

The key is **stable**. It is identical to `words.search_fold` in gurmukhi-kosh, so changing it means rebuilding that column.

## First-letter search

```ts
import { firstLetters, matchesFirstLetters, tokenize } from '@atthebunga/gurmukhi-search-utils';

firstLetters('ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥');              // 'ਸਨਕਪ'
matchesFirstLetters('ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥', 'ਸਨਕ');  // true
tokenize('ਗਉੜੀ ਮਹਲਾ ੫ ॥');                          // ['ਗਉੜੀ', 'ਮਹਲਾ']
```

`tokenize` is the word split the search index uses: it drops dandas, numerals and pure punctuation. `matchesFirstLetters` follows the same rule as the `search_first_letters` database function: word *i* must start with letter *i*, counting from the start of the line. Client-side and database results therefore agree.

## Pattern language

The same syntax `<gurmukhi-input pattern-mode>` leaves unconverted while you type:

| Syntax | Matches |
|---|---|
| `ਸਤਿ` | the literal text |
| `_` | any one character |
| `*` | any run of characters |
| `{velar}` | any character in a category (see `listCategories()`) |
| `(ਮੁਖਿ\|ਮਤਿ)` | either alternative |

A pattern that starts with a lone vowel sign (`ਾ`, `{ooraVowels}`) gets an implied base letter in front of it.

```ts
import { compilePattern, patternToRegExp } from '@atthebunga/gurmukhi-search-utils';

compilePattern('{velar}ਾ*');          // { ok: true, regex: '[ਕਖਗਘਙ]ਾ.*' }  — for Postgres ~
patternToRegExp('ਗੁਰ(ਮੁਖਿ|ਮਤਿ)').test('ਗੁਰਮਤਿ');           // true — JavaScript
patternToRegExp('ਸਤਿ', { anchored: true }).test('ਸਤਿਗੁਰ'); // false
```

## Characters and syllables

The package also exports:
- the character sets `CONSONANTS`, `VOWEL_CARRIERS`, `VOWEL_DIACRITICS` and `NASAL_MARKS`
- the pattern categories, as `CHAR_CATEGORIES`
- `parseSyllables(word)`, which splits a word into akhar syllables: a base letter plus its vowel sign and marks

## Related

To match on pronunciation, such as voice search or romanized queries like "waheguru", use [`@atthebunga/gurmukhi-phonetics`](../phonetics) (`phoneticKey` and `romanPhoneticKey`).

## License

MIT

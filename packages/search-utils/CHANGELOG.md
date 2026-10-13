# @atthebunga/gurmukhi-search-utils

## 0.1.0

### Minor Changes

- First release, extracted from gurmukhi-kosh and gurmukhi-search:
  - `foldGurmukhi` (the `words.search_fold` key)
  - `tokenize`
  - the `{category}` pattern compiler (`compilePattern`), plus a new `patternToRegExp`
  - the character taxonomy and `parseSyllables`
  - new `firstLetters` and `matchesFirstLetters`

  Output is identical to the original code across the SGGS fixture corpus.

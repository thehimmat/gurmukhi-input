# @atthebunga/gurmukhi-phonetics

## 0.2.0

### Minor Changes

- 3aa7947: `toIPA` reads nukta letters as their own sounds (ਸ਼ ʃ, ਖ਼ x, ਗ਼ ɣ, ਜ਼ z, ਫ਼ f, ਲ਼ ɭ) instead of the base letter plus a stray schwa, reads precomposed nukta letters (U+0A36 …) instead of dropping them, and reads yakash as a subjoined ਯ (ਬਿਗੵਾਪ੍ਤਿ → bɪgjaːpt̪ɪ). `phoneticKey` is unchanged.

## 0.1.0

### Minor Changes

- First release: `toIPA` (from gurmukhi-kosh) and `phoneticKey` (from gurmukhi-voice-search) as one package, sharing the rule-builder's `rules.json`. Output is identical to both originals across about 7,000 SGGS words.
- `romanPhoneticKey`: maps a romanized query ("waheguru", "satnam") toward the phonetic-key alphabet, from gurmukhi-voice-search's search route.

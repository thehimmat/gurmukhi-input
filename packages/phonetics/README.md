# @atthebunga/gurmukhi-phonetics

Gurmukhi → IPA pronunciation, plus a fuzzy **phonetic key** for matching what someone said or typed in roman letters against Gurmukhi text. No dependencies.

```bash
npm install @atthebunga/gurmukhi-phonetics
```

```ts
import { toIPA, phoneticKey } from '@atthebunga/gurmukhi-phonetics';

toIPA('ਸਤਿ ਨਾਮੁ');                    // 'sət̪ɪ n̪aːmʊ'
toIPA('ਕ');                           // 'k'   — final inherent schwa dropped
toIPA('ਕ', { finalSchwa: true });     // 'kə'

phoneticKey('ਸੰਗਤਿ');                 // 'sangati'
phoneticKey('ਟ') === phoneticKey('ਤ'); // true — retroflex/dental collapse
```

Both functions take a word or a line. Each word is converted on its own, and whitespace is kept.

## `toIPA(text, { finalSchwa? })`

Faithful IPA for display. It handles the inherent vowel, vowel signs, independent vowels, nasal assimilation of tippi and bindi to the next consonant, addak gemination and virama clusters. It doesn't model tone. By default it drops the inherent schwa at the end of a word, because Gurbani recitation usually leaves a final consonant unvoiced. Pass `finalSchwa: true` to keep it.

## `phoneticKey(text)`

A deliberately lossy key. It removes the distinctions a listener can't reliably hear: vowel length, retroflex vs dental, and which nasal. Store the key next to each word, then compare it with the key of a query.

The key is **stable**. It is identical to the keys `gurmukhi-voice-search` stores in `words.phonetic_ipa`, including one known quirk: independent vowels get an inherent schwa (`ਅਉ` → `aaua`). Fixing that would change about 25% of the stored keys, so it will come as a major version bump with a re-index.

## `romanPhoneticKey(text)`

Maps a romanized query toward the same alphabet: `wh`/`w` → `v`, `ee` → `i`, `oo` → `u`, `aa` → `a`, aspirates such as `bh`/`dh` → `b`/`d`, and so on. It's approximate by design, so compare its output to stored keys with a similarity measure (for example Postgres trigrams), not equality.

```ts
romanPhoneticKey('Waheguru'); // 'vaheguru'  (phoneticKey('ਵਾਹਿਗੁਰੂ') is 'vahiguru')
```

## Rules

The conversion is data-driven. The rules are exported from [gurmukhi-rule-builder](https://github.com/thehimmat/gurmukhi-rule-builder) and shipped as `@atthebunga/gurmukhi-phonetics/rules.json`, and also exported as `rules`.

To update them:
1. Replace `data/rules.json` with a new rule-builder export.
2. Run `UPDATE_GOLDEN=1 pnpm test` and review the diff to `test/golden.json`. It covers about 7,000 words from SGGS.
3. If any `phoneticKey` values changed, release a major version, because stored keys need rebuilding.

## License

MIT

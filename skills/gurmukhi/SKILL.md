---
name: gurmukhi
description: Work with Gurmukhi (Punjabi script) and Gurbani. Use when building a page, artifact or app that needs Gurmukhi typing or an on-screen Gurmukhi keyboard; when converting legacy-font Gurmukhi (AnmolLipi, GurbaniAkhar, Asees, Joy…) to Unicode; when giving the pronunciation (IPA) of Gurmukhi; or when searching Gurbani or looking up a Gurbani word.
---

# Gurmukhi

## Gurmukhi typing in a page or artifact

Use the `@atthebunga/gurmukhi-element` web component. It works in plain HTML (including Claude artifacts), Vue, Svelte and Angular. For React apps, use `@atthebunga/gurmukhi-input` instead.

```html
<label>Search
  <gurmukhi-input id="q" placeholder="vahigurU"></gurmukhi-input>
</label>
<gurmukhi-keyboard for="q"></gurmukhi-keyboard>
<script type="module" src="https://cdn.jsdelivr.net/npm/@atthebunga/gurmukhi-element@0.1.0/dist/cdn.js"></script>
```

- Typing roman keys produces Gurmukhi. With the default `igurbani` layout, `vahigurU` gives ਵਾਹਿਗੁਰੂ: vowels after a consonant become matras, and a capital letter gives the long vowel. Set `layout="gurmukhi-qwerty"` for the macOS Gurmukhi QWERTY keyboard.
- `<gurmukhi-input>` wraps a real `<input>`, so forms, `name` and `input` events work as usual. Label it by wrapping it in `<label>`; `<label for>` pointing at the element itself won't reach the input.
- Read `.value` on the element, or listen for `input` events. For search boxes that use the pattern syntax `{ } _ * ( ) |`, add `pattern-mode`.
- Theme the keyboard with CSS variables: `--gk-bg`, `--gk-key-bg`, `--gk-key-color`, `--gk-key-border`, `--gk-hint-color`, `--gk-key-active-bg`.
- Pin an exact version. Claude artifacts only load scripts from a pinned version that is at least two weeks old, so use a release that old or older.
- Load a Gurmukhi font, for example Google Fonts "Noto Sans Gurmukhi".

## Processing Gurmukhi text in code (npm, no dependencies)

| Need | Package | Call |
|---|---|---|
| Pronunciation | `@atthebunga/gurmukhi-phonetics` | `toIPA('ਸਤਿ ਨਾਮੁ')` → `sət̪ɪ n̪aːmʊ`; `phoneticKey` and `romanPhoneticKey` for fuzzy or voice matching |
| Legacy fonts | `@atthebunga/gurmukhi-legacy` | `toUnicode('<> siq nwmu')` → `ੴ ਸਤਿ ਨਾਮੁ`; `encodingForFont('Asees')`; `fromUnicode` |
| Search helpers | `@atthebunga/gurmukhi-search-utils` | `foldGurmukhi` (spelling variants), `firstLetters`, `tokenize`, `patternToRegExp('{velar}ਾ*')` |
| Typing engine | `@atthebunga/gurmukhi-core` | `applyKeydown` / `applyPaste` for custom bindings |

## MCP tools (when the gurmukhi MCP server is connected)

- **Offline:**
  - `type_gurmukhi`: roman keystrokes → Gurmukhi
  - `gurmukhi_to_ipa`
  - `convert_legacy_font`: pass `font` when the font name is known
  - `unicode_to_anmollipi`
  - `first_letters`
- **Online** (search.atthebunga.com):
  - `search_gurbani`: modes `contains`, `first_letter` and `pattern`. The query must be Gurmukhi, so set `typed: "phonetic"` for roman input.
  - `lookup_word`: exact spelling; try variants such as ਨਾਮ / ਨਾਮੁ.
  - `list_search_filters`: valid writer and raag names.

Quote Gurbani exactly as the tools return it. Translations come from the site's data; say so when you use them.

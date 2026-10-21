# @atthebunga/gurmukhi-mcp

## 0.3.0

### Minor Changes

- 9b2ccc4: Phonetic layout: `a` after a consonant is now the inherent vowel. It writes nothing, and the vowel typed next is standalone, so `nirBau` gives ਨਿਰਭਉ and `gauRI` gives ਗਉੜੀ. Type `A` for the kanna ਾ (`vAhigurU` → ਵਾਹਿਗੁਰੂ; `vahigurU` now gives ਵਹਿਗੁਰੂ). Standalone `u` now gives ਉ instead of the bare carrier ੳ.

  A vowel sign now goes before tippi, bindi and addak (`k^i` → ਕਿੰ instead of ਕੰਿ), and a virama before a vowel is dropped (`k~A` → ਕਾ instead of ਕ੍ਾ). New export: `resolveKeyEdit`, which returns the characters to delete and the text to insert.

### Patch Changes

- Updated dependencies [3aa7947]
- Updated dependencies [9b2ccc4]
  - @atthebunga/gurmukhi-phonetics@0.2.0
  - @atthebunga/gurmukhi-core@0.3.0

## 0.2.0

### Minor Changes

- 385b317: New `igurbani` layout that types exactly like igurbani.com: GurbaniAkhar font keys in visual order (`vwihgurU` → ਵਾਹਿਗੁਰੂ, sihari before its consonant, `au` → ਉ, `<>` → ੴ, `[` `]` → । ॥, Gurmukhi digits).

  **Breaking:** the old phonetic layout is renamed from `igurbani` to `phonetic`. It is still the default, so code that doesn't pass a layout is unaffected. If you passed `layout: 'igurbani'`, pass `layout: 'phonetic'` to keep the old behaviour.

  Core: layouts can be `encoded` (legacy-font keyboards). Their keydowns return a new `compose` action, and `EditState`/`EditResult` carry `composing`, the raw keys of the word being typed, which bindings pass back on the next keydown. Core now depends on `@atthebunga/gurmukhi-legacy`.

### Patch Changes

- Updated dependencies [385b317]
  - @atthebunga/gurmukhi-core@0.2.0

## 0.1.0

### Minor Changes

- First release: an MCP server with eight read-only tools.
  - Phonetic typing, IPA, legacy-font conversion both ways, and first letters run offline.
  - Gurbani search, the word dictionary and the search filters use the search.atthebunga.com APIs.
  - Runs over stdio (`npx @atthebunga/gurmukhi-mcp`) or as a stateless streamable-HTTP fetch handler.

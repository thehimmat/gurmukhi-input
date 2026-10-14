---
"@atthebunga/gurmukhi-input": major
"@atthebunga/gurmukhi-core": minor
"@atthebunga/gurmukhi-element": minor
"@atthebunga/gurmukhi-mcp": minor
---

New `igurbani` layout that types exactly like igurbani.com: GurbaniAkhar font keys in visual order (`vwihgurU` → ਵਾਹਿਗੁਰੂ, sihari before its consonant, `au` → ਉ, `<>` → ੴ, `[` `]` → । ॥, Gurmukhi digits).

**Breaking:** the old phonetic layout is renamed from `igurbani` to `phonetic`. It is still the default, so code that doesn't pass a layout is unaffected. If you passed `layout: 'igurbani'`, pass `layout: 'phonetic'` to keep the old behaviour.

Core: layouts can be `encoded` (legacy-font keyboards). Their keydowns return a new `compose` action, and `EditState`/`EditResult` carry `composing`, the raw keys of the word being typed, which bindings pass back on the next keydown. Core now depends on `@atthebunga/gurmukhi-legacy`.

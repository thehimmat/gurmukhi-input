# @atthebunga/gurmukhi-input

## 2.0.0

### Major Changes

- 385b317: New `igurbani` layout that types exactly like igurbani.com: GurbaniAkhar font keys in visual order (`vwihgurU` → ਵਾਹਿਗੁਰੂ, sihari before its consonant, `au` → ਉ, `<>` → ੴ, `[` `]` → । ॥, Gurmukhi digits).

  **Breaking:** the old phonetic layout is renamed from `igurbani` to `phonetic`. It is still the default, so code that doesn't pass a layout is unaffected. If you passed `layout: 'igurbani'`, pass `layout: 'phonetic'` to keep the old behaviour.

  Core: layouts can be `encoded` (legacy-font keyboards). Their keydowns return a new `compose` action, and `EditState`/`EditResult` carry `composing`, the raw keys of the word being typed, which bindings pass back on the next keydown. Core now depends on `@atthebunga/gurmukhi-legacy`.

### Patch Changes

- Updated dependencies [385b317]
  - @atthebunga/gurmukhi-core@0.2.0

## 1.4.0

### Minor Changes

- Built on `@atthebunga/gurmukhi-core`. The public API is unchanged from 1.3.0.
- The published package no longer includes a stale build chunk.

## 1.3.0

- Last release before the monorepo. Source recovered from the published build; see #1.

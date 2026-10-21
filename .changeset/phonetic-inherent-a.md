---
"@atthebunga/gurmukhi-core": minor
"@atthebunga/gurmukhi-input": major
"@atthebunga/gurmukhi-element": minor
"@atthebunga/gurmukhi-mcp": minor
---

Phonetic layout: `a` after a consonant is now the inherent vowel. It writes nothing, and the vowel typed next is standalone, so `nirBau` gives ਨਿਰਭਉ and `gauRI` gives ਗਉੜੀ. Type `A` for the kanna ਾ (`vAhigurU` → ਵਾਹਿਗੁਰੂ; `vahigurU` now gives ਵਹਿਗੁਰੂ). Standalone `u` now gives ਉ instead of the bare carrier ੳ.

A vowel sign now goes before tippi, bindi and addak (`k^i` → ਕਿੰ instead of ਕੰਿ), and a virama before a vowel is dropped (`k~A` → ਕਾ instead of ਕ੍ਾ). New export: `resolveKeyEdit`, which returns the characters to delete and the text to insert.

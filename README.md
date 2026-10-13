# gurmukhi-input

Gurmukhi tooling for apps: real-time phonetic input (type roman keys, get Gurmukhi Unicode) pronunciation, and search.

| Package | What it is |
|---|---|
| [`@atthebunga/gurmukhi-core`](packages/core) | The framework-agnostic engine: layouts, keystroke resolution and a pure editing controller |
| [`@atthebunga/gurmukhi-input`](packages/react) | React hook, `<GurmukhiInput>` and on-screen keyboard |
| [`@atthebunga/gurmukhi-phonetics`](packages/phonetics) | Gurmukhi → IPA pronunciation and a fuzzy phonetic key for voice and romanized search |
| [`@atthebunga/gurmukhi-search-utils`](packages/search-utils) | Spelling-variant folding, first-letter search, tokenizing and a `{category}` pattern language |
| [`@atthebunga/gurmukhi-legacy`](packages/legacy) | Legacy-font text (AnmolLipi/GurbaniAkhar, Asees, Joy, …) ↔ Unicode |
| [`@atthebunga/gurmukhi-mcp`](packages/mcp) | MCP server for Claude: typing, IPA, legacy fonts, Gurbani search and dictionary. Includes a matching [skill](skills/gurmukhi/SKILL.md) |
| [`@atthebunga/gurmukhi-element`](packages/element) | `<gurmukhi-input>`, `<gurmukhi-keyboard>` and `attachGurmukhi()` for any framework or plain HTML, plus a CDN build |

## Development

```bash
pnpm install
pnpm check   # build, typecheck and test every package
```

The core is built before the packages that depend on it, so run `pnpm check` (or `pnpm build`) once before running the React tests on their own.

## Releasing

Releases use [changesets](https://github.com/changesets/changesets). A PR that changes a published package adds one with `pnpm changeset`. On merge, the Release workflow opens a "Version packages" PR, and merging that publishes to npm with provenance. CI runs `pnpm check` on every PR.

## License

MIT

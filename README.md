# gurmukhi-input

Real-time Gurmukhi phonetic input: type roman keys, get Gurmukhi Unicode.

| Package | What it is |
|---|---|
| [`@atthebunga/gurmukhi-core`](packages/core) | The framework-agnostic engine: layouts, keystroke resolution and a pure editing controller |
| [`@atthebunga/gurmukhi-input`](packages/react) | React hook, `<GurmukhiInput>` and on-screen keyboard |
| [`@atthebunga/gurmukhi-element`](packages/element) | `<gurmukhi-input>`, `<gurmukhi-keyboard>` and `attachGurmukhi()` for any framework or plain HTML, plus a CDN build |

## Development

```bash
pnpm install
pnpm check   # build, typecheck and test every package
```

The core is built before the packages that depend on it, so run `pnpm check` (or `pnpm build`) once before running the React tests on their own.

## License

MIT

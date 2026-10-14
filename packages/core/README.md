# @atthebunga/gurmukhi-core

The engine behind [`@atthebunga/gurmukhi-input`](../react): real-time Gurmukhi phonetic input with no framework and no DOM dependency. Use it to build Gurmukhi typing into any UI: Vue, Svelte, Angular, plain DOM, React Native or a terminal.

```bash
npm install @atthebunga/gurmukhi-core
```

## Editing controller

The controller is a pair of pure functions. Each takes the field state (`value`, `selectionStart`, `selectionEnd`) and an event, and returns the next state. A return of `null` means the event isn't for the controller, so let the browser handle it.

```ts
import { applyKeydown, applyPaste, resolveLayout } from '@atthebunga/gurmukhi-core';

const layout = resolveLayout('phonetic'); // or 'igurbani', 'gurmukhi-qwerty', or a custom Layout

input.addEventListener('keydown', e => {
  const next = applyKeydown(
    { value: input.value, selectionStart: input.selectionStart!, selectionEnd: input.selectionEnd! },
    e,
    layout,
  );
  if (!next) return;
  e.preventDefault();
  input.value = next.value;
  input.setSelectionRange(next.selectionStart, next.selectionEnd);
});
```

`applyPaste(state, text, layout)` works the same way for paste events. Pasted Gurmukhi returns `null`, so it goes in unchanged. Pasted roman text is converted.

On macOS, some Option-layer keys are dead keys. For those, `applyKeydown` sets `endComposition: true`, because the browser inserts an accent mark after the event that you need to remove. Strip it with `stripDeadKeyArtifacts(value, caret)` once the event has finished.

## Also exported

- `LAYOUTS`, `Layout`: the built-in `phonetic`, `igurbani` and `gurmukhi-qwerty` layouts, and the type for defining your own.
- `igurbani` is an *encoded* layout (`Layout.encoded`): keys are GurbaniAkhar font ASCII, so a keydown returns a `compose` action that rewrites the word before the caret. Bindings must keep `EditResult.composing` and pass it back as `EditState.composing` on the next keydown.
- `resolveKey`, `romanToGurmukhi`, `resolveKeydown`: lower-level lookups.
- `resolveKeyboard`, `US_ANSI_ROWS`: data for drawing an on-screen keyboard.
- `isGurmukhiChar`, `isGurmukhiConsonant`, `isCombiningGurmukhi`, `lastGurmukhiBase`: Unicode helpers.

## Conformance fixtures

The expected behaviour lives in `fixtures/keystrokes.json`: language-neutral test vectors that ship with the package (`@atthebunga/gurmukhi-core/fixtures/keystrokes.json`). Core and every framework binding run them, and ports to other languages should too. See [`fixtures/README.md`](fixtures/README.md) for how to run a case.

See the [React package README](../react/README.md) for full layout tables.

## License

MIT

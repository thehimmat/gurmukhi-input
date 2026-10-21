# @atthebunga/gurmukhi-element

Real-time Gurmukhi phonetic input for **any framework or plain HTML**: type roman keys, get Gurmukhi Unicode. Built on [`@atthebunga/gurmukhi-core`](../core). Using React? See [`@atthebunga/gurmukhi-input`](../react).

## Plain HTML / CDN

```html
<label>Search <gurmukhi-input id="q" placeholder="vAhigurU"></gurmukhi-input></label>
<gurmukhi-keyboard for="q"></gurmukhi-keyboard>

<script type="module" src="https://cdn.jsdelivr.net/npm/@atthebunga/gurmukhi-element@0.1.0/dist/cdn.js"></script>
```

The CDN file is one self-registering ES module, about 5 KB gzipped. Pin an exact version. Claude artifacts require an exact version, and the CDNs they allow (jsdelivr, unpkg) both serve this file.

## npm

```bash
npm install @atthebunga/gurmukhi-element
```

```ts
import '@atthebunga/gurmukhi-element/define'; // registers <gurmukhi-input> and <gurmukhi-keyboard>
// or, to register yourself / use only the helper:
import { defineGurmukhiElements, attachGurmukhi } from '@atthebunga/gurmukhi-element';
```

Importing the package during server rendering is safe; the elements only register in the browser.

## `<gurmukhi-input>`

It enhances a **real** `<input>` or `<textarea>` in the light DOM, either one you put inside it or one it creates. Labels, forms, validation, your CSS and framework bindings all keep working as they do on a plain input.

```html
<gurmukhi-input layout="gurmukhi-qwerty" name="q" placeholder="Type…"></gurmukhi-input>

<!-- bring your own field: every attribute and style is yours -->
<gurmukhi-input pattern-mode>
  <textarea id="notes" rows="4" class="my-field"></textarea>
</gurmukhi-input>
```

| Attribute | |
|---|---|
| `layout` | `phonetic` (default), `igurbani` (igurbani.com / GurbaniAkhar keys) or `gurmukhi-qwerty` |
| `pattern-mode` | Leave `{ } _ * ( ) \|` and text inside `{ }` unconverted, for search patterns |
| `transliterate="off"` | Plain typing, without removing the element |
| `value` | Initial value. The `.value` property reads and writes the field |
| `placeholder`, `name`, `disabled`, `required`, `readonly`, `autocomplete`, `maxlength` | Copied to the input it creates |
| `aria-label`, `aria-describedby` | Moved to the input it creates |

For a visible label, wrap the element in a `<label>`, or put your own `<input id>` inside and use `<label for>`. `<label for>` pointing at the `<gurmukhi-input>` itself doesn't label the field.

Every conversion fires a bubbling `input` event, so `v-model`, `bind:value`, `ngModel` and `addEventListener('input')` all see the changes.

## `<gurmukhi-keyboard>`

An on-screen keyboard. Clicking a key inserts its character at the caret of the field named by `for` (an `<input>`, `<textarea>` or `<gurmukhi-input>`) without taking focus away from it. It also fires a `gurmukhi-keypress` event with `detail.char`.

| Attribute | |
|---|---|
| `for` | id of the target field |
| `layout` | `gurmukhi-qwerty` (default), `phonetic` or `igurbani`. The `.layout` property also accepts a custom `Layout` object |
| `shift`, `option` | Fix that modifier on |
| `no-track` | Don't reflect physically held Shift/Option |
| `hide-hints`, `hide-modifiers` | Hide the ASCII key hints / the Shift and Option buttons |

Theme it with CSS variables on the element: `--gk-bg`, `--gk-key-bg`, `--gk-key-border`, `--gk-key-color`, `--gk-hint-color`, `--gk-key-active-bg`, `--gk-focus`. Style individual keys with `gurmukhi-keyboard::part(key)`.

## `attachGurmukhi(field, options)`

Adds Gurmukhi typing to an existing field, with no custom element involved.

```ts
const g = attachGurmukhi(document.querySelector('input')!, { layout: 'phonetic' });
g.update({ layout: 'gurmukhi-qwerty' });  // switch in place
g.detach();                               // back to plain typing
```

### Vue

```vue
<script setup>
import '@atthebunga/gurmukhi-element/define';
const q = ref('');
</script>
<template>
  <gurmukhi-input><input v-model="q" /></gurmukhi-input>
</template>
```

Tell Vue it's a custom element: `compilerOptions.isCustomElement = tag => tag.startsWith('gurmukhi-')`.

### Svelte

```svelte
<script>
  import '@atthebunga/gurmukhi-element/define';
  let q = '';
</script>
<gurmukhi-input><input bind:value={q} /></gurmukhi-input>
```

## Behaviour

The typing rules and all three layouts are documented in the [React package README](../react/README.md#layout-phonetic-default). Every package runs the same [conformance fixtures](../core/fixtures), so they behave identically.

## License

MIT

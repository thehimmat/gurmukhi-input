# @atthebunga/gurmukhi-input

React hook and component for real-time Gurmukhi phonetic keyboard input. Converts keystrokes to Gurmukhi unicode as you type — no Gurmukhi keyboard required. Pasted Gurmukhi unicode passes through untouched.

## Features

- Three built-in layouts:
  - `phonetic` (default): type what you hear, with context-sensitive vowels. `a` after a consonant gives the matra ਾ, not standalone ਅ.
  - `igurbani`: types exactly like [igurbani.com](https://igurbani.com) and the GurbaniAkhar font keyboard.
  - `gurmukhi-qwerty`: matches the macOS Gurmukhi - QWERTY keyboard.
- Option-layer support for `gurmukhi-qwerty`: Option+T → ਟ, Option+N → ਞ, etc.
- Optional on-screen keyboard viewer that reflects the active layout and previews Shift/Option layers
- Pasted Gurmukhi unicode passes through; pasted ASCII is converted
- Extensible: pass a custom `Layout` object for your own mapping
- TypeScript-first

## Installation

```bash
npm install @atthebunga/gurmukhi-input
```

React 18+ is a peer dependency.

## Usage

### Hook

```tsx
import { useGurmukhiInput } from '@atthebunga/gurmukhi-input';

function SearchBar() {
  const [value, setValue] = useState('');
  const { onKeyDown, onPaste } = useGurmukhiInput({ value, onChange: setValue });
  return <input value={value} onChange={e => setValue(e.target.value)} onKeyDown={onKeyDown} onPaste={onPaste} />;
}
```

### Drop-in component

```tsx
import { GurmukhiInput } from '@atthebunga/gurmukhi-input';

<GurmukhiInput value={value} onChange={setValue} placeholder="ਖੋਜੋ…" />
```

### Choosing a layout

```tsx
// Default — phonetic layout (vahigurU → ਵਾਹਿਗੁਰੂ)
useGurmukhiInput({ value, onChange: setValue })

// igurbani.com / GurbaniAkhar keys (vwihgurU → ਵਾਹਿਗੁਰੂ)
useGurmukhiInput({ value, onChange: setValue, layout: 'igurbani' })

// macOS Gurmukhi - QWERTY keyboard
useGurmukhiInput({ value, onChange: setValue, layout: 'gurmukhi-qwerty' })

// Custom layout object
import type { Layout } from '@atthebunga/gurmukhi-input';
const myLayout: Layout = { name: 'custom', description: '...', keys: { 's': 'ਸ', ... } };
useGurmukhiInput({ value, onChange: setValue, layout: myLayout })
```

### Accessing raw layout data

```ts
import { LAYOUTS } from '@atthebunga/gurmukhi-input';

console.log(LAYOUTS['phonetic'].keys);       // all consonant/mark mappings
console.log(LAYOUTS['gurmukhi-qwerty'].option); // Option-layer mappings
```

---

## On-screen keyboard

An optional visual keyboard that reflects the active layout — useful for discovering where
obscure letters (retroflexes, nukta consonants, rare marks) live. It previews the Shift and
Option layers via on-screen toggle buttons, and also reflects physically held Shift/Option keys.
Imported from a separate sub-path so it's only bundled if you use it:

```tsx
import { GurmukhiKeyboard } from '@atthebunga/gurmukhi-input/keyboard';

<GurmukhiKeyboard
  layout="gurmukhi-qwerty"
  onKeyPress={char => insertIntoInput(char)}  // optional: click-to-insert
/>
```

Props:

| Prop | Default | Description |
|------|---------|-------------|
| `layout` | `'gurmukhi-qwerty'` | `'phonetic'`, `'igurbani'`, `'gurmukhi-qwerty'`, or a custom `Layout` |
| `shift` / `option` | — | Controlled modifier state (omit to let the component manage it) |
| `trackPhysicalModifiers` | `true` | Reflect physically held Shift/Alt keys |
| `showModifierToggles` | `true` | Render on-screen Shift / Option toggle buttons |
| `showKeyHints` | `true` | Show the small ASCII key label in each key's corner |
| `onKeyPress` | — | Called with the produced Gurmukhi character when a key is clicked |
| `className` / `style` | — | Passed to the root element |

Vowel and other combining marks render with a dotted circle (◌ਾ), matching the macOS Keyboard
Viewer convention.

### Theming

Styled with CSS variables so you can match your app:

```css
.my-keyboard {
  --gk-bg: #f5ede0;
  --gk-key-bg: #fff;
  --gk-key-border: #c8b89a;
  --gk-key-color: #3d2b1f;
  --gk-hint-color: #a0896a;
  --gk-key-active-bg: #8b5e3c;
}
```

### Building a custom viewer

The geometry and resolver are exported too, if you want to render your own:

```ts
import { US_ANSI_ROWS, resolveKeyboard } from '@atthebunga/gurmukhi-input/keyboard';

const rows = resolveKeyboard('gurmukhi-qwerty', { shift: false, option: true });
// rows[r][c] = { code, hint, output, display }
```

---

## Upgrading from 1.x

In 1.x the phonetic layout was called `igurbani`. It is now `phonetic`, and it is still the default, so code that doesn't pass a layout is unaffected. `igurbani` now means the igurbani.com keyboard. If you passed `layout: 'igurbani'` and want the old behaviour, pass `layout: 'phonetic'`.

## Layout: `phonetic` (default)

Type what you hear, in logical order: `vahigurU` gives ਵਾਹਿਗੁਰੂ. (Called `igurbani` before 2.0.)

Vowel keys are **context-sensitive**: after a Gurmukhi consonant they produce a matra (combining vowel sign); otherwise a standalone vowel letter.

### Consonants & marks

| Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ |
|-----|---------|-----|---------|-----|---------|
| `s` | ਸ | `S` | ਸ਼ | `h` | ਹ |
| `k` | ਕ | `K` | ਖ | `g` | ਗ |
| `G` | ਘ | `` ` `` | ਙ | | |
| `c` | ਚ | `C` | ਛ | `j` | ਜ |
| `J` | ਝ | `[` | ਞ | | |
| `t` | ਟ | `T` | ਠ | `d` | ਡ |
| `D` | ਢ | `N` | ਣ | `R` | ੜ |
| `q` | ਤ | `Q` | ਥ | `z` | ਦ |
| `Z` | ਧ | `n` | ਨ | | |
| `p` | ਪ | `P` | ਫ | `f` | ਫ਼ |
| `b` | ਬ | `B` | ਭ | `m` | ਮ |
| `X` | ਯ | `r` | ਰ | `l` | ਲ |
| `L` | ਲ਼ | `v`/`w` | ਵ | | |
| `M` | ਂ | `^` | ੰ | `W` | ੱ |
| `:` | ਃ | `~` | ੍ | | |

### Vowels (context-sensitive)

| Key | Standalone | After consonant |
|-----|-----------|-----------------|
| `a` | ਅ | ਾ |
| `A` | ਆ | ਾ |
| `i` | ਇ | ਿ |
| `I` | ਈ | ੀ |
| `u` | ੳ | ੁ |
| `U` | ਊ | ੂ |
| `e` | ਏ | ੇ |
| `E` | ਐ | ੈ |
| `o` | ਓ | ੋ |
| `O` | ਔ | ੌ |

---

## Layout: `igurbani`

Types exactly like the search box on [igurbani.com](https://igurbani.com), which uses the GurbaniAkhar font keyboard (shared by AnmolLipi, GurbaniLipi and others). Keys are typed in the order the letters appear on the page:

- **Sihari before its consonant:** `ikrpw` gives ਕਿਰਪਾ, and `vwihgurU` gives ਵਾਹਿਗੁਰੂ. A sihari shows on its own until the next consonant arrives.
- **Vowels from carriers:** `a` is ੳ, `A` is ਅ and `e` is ੲ. Add a sign to build the vowel: `au` gives ਉ, `Aw` gives ਆ, `eI` gives ਈ. This works after a consonant too: `hoveI` gives ਹੋਵਈ. `u` on its own is a bare aunkar ◌ੁ.
- **Symbols:** `<` then `>` gives ੴ, `[` gives ।, `]` gives ॥, and the number row types ੧੨੩.

Each key re-converts the word being typed, so the hook and the web component keep the word's raw keys between keystrokes (`composing` in the core engine).

| Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ |
|-----|---------|-----|---------|-----|---------|-----|---------|
| `0` | ੦ | `1` | ੧ | `2` | ੨ | `3` | ੩ |
| `4` | ੪ | `5` | ੫ | `6` | ੬ | `7` | ੭ |
| `8` | ੮ | `9` | ੯ | `` ` `` | ◌ੱ | `~` | ◌ੱ |
| `@` | ◌ੑ | `^` | ਖ਼ | `&` | ਫ਼ | `q` | ਤ |
| `Q` | ਥ | `w` | ◌ਾ | `W` | ਾਂ | `e` | ੲ |
| `E` | ਓ | `r` | ਰ | `R` | ੍ਰ | `t` | ਟ |
| `T` | ਠ | `y` | ◌ੇ | `Y` | ◌ੈ | `u` | ◌ੁ |
| `U` | ◌ੂ | `i` | ◌ਿ | `I` | ◌ੀ | `o` | ◌ੋ |
| `O` | ◌ੌ | `p` | ਪ | `P` | ਫ | `[` | । |
| `]` | ॥ | `\` | ਞ | `\|` | ਙ | `a` | ੳ |
| `A` | ਅ | `s` | ਸ | `S` | ਸ਼ | `d` | ਦ |
| `D` | ਧ | `f` | ਡ | `F` | ਢ | `g` | ਗ |
| `G` | ਘ | `h` | ਹ | `H` | ੍ਹ | `j` | ਜ |
| `J` | ਝ | `k` | ਕ | `K` | ਖ | `l` | ਲ |
| `L` | ਲ਼ | `z` | ਜ਼ | `Z` | ਗ਼ | `x` | ਣ |
| `X` | ਯ | `c` | ਚ | `C` | ਛ | `v` | ਵ |
| `V` | ੜ | `b` | ਬ | `B` | ਭ | `n` | ਨ |
| `N` | ◌ਂ | `m` | ਮ | `M` | ◌ੰ |  |  |

## Layout: `gurmukhi-qwerty`

Matches the macOS **Gurmukhi - QWERTY** keyboard exactly (extracted from the system keyboard bundle). Vowels are not context-sensitive — carriers and matras are separate explicit keys.

### Plain layer

| Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ | Key | ਗੁਰਮੁਖੀ |
|-----|---------|-----|---------|-----|---------|
| `s` | ਸ | `S` | ਸ਼ | `h` | ਹ |
| `g` | ਗ | `G` | ਘ | `z` | ਙ |
| `c` | ਚ | `C` | ਛ | `j` | ਜ |
| `J` | ਝ | `n` | ਨ | `N` | ਣ |
| `t` | ਤ | `T` | ਥ | `d` | ਦ |
| `D` | ਧ | `x` | ੜ | | |
| `p` | ਪ | `P` | ਫ | `b` | ਬ |
| `B` | ਭ | `m` | ਮ | `M` | ਂ |
| `k` | ਕ | `K` | ਖ | `r` | ਰ |
| `y` | ਯ | `l` | ਲ | `L` | ਲ਼ |
| `v` | ਵ | `V` | ੴ | `f` | ੍ |
| `H` | ਃ | `]` | ੰ | `[` | ੱ |

### Vowels (explicit — no context-switching)

| Key | ਗੁਰਮੁਖੀ | Description |
|-----|---------|-------------|
| `q` | ੳ | Oora carrier (word-initial u/o sounds) |
| `Q` | ੲ | Eeree carrier (word-initial i sounds) |
| `w` | ਅ | Aa carrier (word-initial a sounds) |
| `W` | ਆ | Standalone long aa vowel |
| `a` | ਾ | Aa matra (after consonant) |
| `e` | ੇ | E matra |
| `E` | ੈ | Ai matra |
| `i` | ਿ | I matra |
| `I` | ੀ | Ii matra |
| `o` | ੋ | O matra |
| `O` | ੌ | Au matra |
| `u` | ੁ | U matra |
| `U` | ੂ | Uu matra |

### Option (⌥) layer

| Keys | ਗੁਰਮੁਖੀ | Description |
|------|---------|-------------|
| ⌥T | ਟ | Retroflex ta |
| ⌥D | ਡ | Retroflex da |
| ⌥N | ਞ | Palatal nasal (nya) |
| ⌥G | ਗ਼ | Ga with nukta |
| ⌥J | ਜ਼ | Ja with nukta |
| ⌥K | ਖ਼ | Kha with nukta |
| ⌥P | ਫ਼ | Pha with nukta |
| ⌥A | ਅ | Standalone short a vowel |
| ⌥E | ਏ | Standalone e vowel |
| ⌥I | ਇ | Standalone short i vowel |
| ⌥O | ਓ | Standalone o vowel |
| ⌥U | ਉ | Standalone short u vowel |

### Option+Shift (⌥⇧) layer

| Keys | ਗੁਰਮੁਖੀ | Description |
|------|---------|-------------|
| ⌥⇧T | ਠ | Aspirated retroflex ta |
| ⌥⇧D | ਢ | Aspirated retroflex da |
| ⌥⇧A | ਆ | Standalone long aa vowel |
| ⌥⇧E | ਐ | Standalone ai vowel |
| ⌥⇧I | ਈ | Standalone long ii vowel |
| ⌥⇧O | ਔ | Standalone au vowel |
| ⌥⇧U | ਊ | Standalone long uu vowel |

---

## Custom layouts

```ts
import type { Layout } from '@atthebunga/gurmukhi-input';

const myLayout: Layout = {
  name: 'my-layout',
  description: 'My custom mapping',
  keys: { 'k': 'ਕ', 'g': 'ਗ', /* ... */ },
  vowelStandalone: { 'a': 'ਅ', /* ... */ },  // optional: enables context-sensitive vowels
  vowelMatra:      { 'a': 'ਾ', /* ... */ },
  option:      { 'KeyT': 'ਟ', /* ... */ },   // optional: Option-layer by e.code
  optionShift: { 'KeyT': 'ਠ', /* ... */ },
};
```

## License

MIT

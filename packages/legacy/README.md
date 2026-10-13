# @atthebunga/gurmukhi-legacy

Convert Gurmukhi typed in **legacy fonts** to Unicode, and Unicode back to AnmolLipi/GurbaniAkhar. Supported fonts:
- **AnmolLipi / GurbaniAkhar**, and the fonts that share their keyboard: GurbaniLipi, GurbaniWeb, Prabhki, WebAkhar, Lord, God
- **Asees**
- **Joy**
- **AnandpurSahib**
- **Satluj**
- **SONY**

No dependencies, MIT licensed. A TypeScript port of the converter in [gurmukhi-transliterate](https://github.com/thehimmat/gurmukhi-transliterate), and identical to it.

```bash
npm install @atthebunga/gurmukhi-legacy
```

```ts
import { toUnicode, convert, encodingForFont, fromUnicode } from '@atthebunga/gurmukhi-legacy';

toUnicode('<> siq nwmu ]1]');          // 'ੴ ਸਤਿ ਨਾਮੁ ॥੧॥'
toUnicode('fJ', 'asees');               // 'ਇ'

convert('k§k');
// { text: 'ਕ§ਕ', encoding: 'anmollipi',
//   warnings: [{ position: 1, char: '§', kind: 'unmapped', message: 'no mapping; passed through' }] }

encodingForFont('CKPHAK+GurbaniAkharThick'); // 'anmollipi' — font names as PDFs report them
fromUnicode('ਸਤਿ ਨਾਮੁ');                   // 'siq nwmu'
```

## Converting to Unicode

`convert(text, encoding = 'anmollipi')` returns `{ text, warnings, encoding }`. `toUnicode` returns just the text. The `encoding` is one of `ENCODINGS`.

The converter handles the fonts' typing conventions:
- Sihari is typed before its consonant, and moves after the cluster in Unicode.
- Subjoined letters and nukta may be typed after the vowel sign (Asees, Joy).
- Independent vowels can be built from a carrier plus a sign.
- Tippi and bindi share a key in some layouts, so the right one is chosen from the vowel before it.
- `।।` becomes `॥`.
- Satluj text from a PDF made on a Mac, where bytes were read as Mac Roman, is repaired.

Line structure is preserved and no character is dropped. Anything the layout can't map passes through and is reported in `warnings`, as are siharis with no consonant to attach to.

If you know the font, for example from a PDF's font list or a word processor's style, pass its name to `encodingForFont` to choose the encoding.

## Converting from Unicode

`fromUnicode(text)` produces AnmolLipi/GurbaniAkhar keys, for setting text in those fonts. Converting back with `toUnicode` returns the original text exactly, except for one case: AnmolLipi's digit keys draw Gurmukhi numerals, so Latin digits come back as `੦-੯`.

## Not included yet

Encoding detection (`detect_encoding` in the Python version) needs a Gurbani word list (~1 MB) to recognise Asees, Joy and the other non-AnmolLipi layouts, so it isn't in this package yet.

## Updating from gurmukhi-transliterate

The key maps in `src/layouts.data.ts` are generated from the Python package, which is their source of truth. The tests compare against golden output from it.

```bash
python3 scripts/export-layouts.py ../gurmukhi-transliterate > src/layouts.data.ts
python3 scripts/golden.py ../gurmukhi-transliterate > test/golden.json
pnpm test
```

## License

MIT

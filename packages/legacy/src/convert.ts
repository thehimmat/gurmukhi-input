import { CP1252_HIGH, LAYOUT_DATA, MAC_ROMAN_HIGH } from './layouts.data';
import type { LayoutData } from './types';

// Port of gurmukhi-transliterate's GurmukhiLegacy.convert (legacy.py). Kept
// structurally identical so the golden tests can hold it to the Python output.

export const ENCODINGS = ['anmollipi', 'asees', 'joy', 'anandpursahib', 'satluj', 'sony'] as const;
export type Encoding = (typeof ENCODINGS)[number];

export type Layout = Readonly<{
  name: Encoding;
  label: string;
  keys: Readonly<Record<string, string>>;
  combos: readonly (readonly [string, string])[];
  sihari: ReadonlySet<string>;
  passthrough: ReadonlySet<string>;
  fonts: readonly string[];
  oneNasalKey: boolean;
  joinDandas: boolean;
  macRomanRepair: boolean;
}>;

function toLayout(d: LayoutData): Layout {
  return {
    ...d,
    name: d.name as Encoding,
    combos: d.combos.map(([k, v]) => [k, v] as const),
    sihari: new Set(d.sihari),
    passthrough: new Set(d.passthrough),
  };
}

export const LAYOUTS: Readonly<Record<Encoding, Layout>> = Object.fromEntries(
  ENCODINGS.map(e => [e, toLayout(LAYOUT_DATA[e])]),
) as Record<Encoding, Layout>;

export type ConversionWarning = {
  position: number; // index into the input text, in code points
  char: string;
  kind: 'unmapped' | 'orphan_sihari';
  message: string;
};

export type ConversionResult = {
  text: string;
  warnings: ConversionWarning[];
  encoding: Encoding; // the layout used
};

// Independent vowels some layouts build from a carrier plus a sign
const COMPOSE: [string, string][] = [
  ['ਅਾ', 'ਆ'], ['ਅੈ', 'ਐ'], ['ਅੌ', 'ਔ'], ['ੲਿ', 'ਇ'], ['ੲੀ', 'ਈ'], ['ੲੇ', 'ਏ'],
  ['ੳੁ', 'ਉ'], ['ੳੂ', 'ਊ'], ['ੳੋ', 'ਓ'], ['ਉੂ', 'ਊ'],
];
// Fonts let a nasal or addak be typed before the vowel sign below the letter;
// Unicode puts the vowel sign first (ਸਮੁੰਦ, not ਸਮੰੁਦ)
const SIGN_FIRST = /([ੰਂੱ])([ੁੂ])/g;
// Bindi, not tippi, goes with these vowels
const BINDI_AFTER = /(?<=[ਾੀੇੈੋੌਆਈਏਐਓਔ])ੰ/g;
// Keys whose output joins the preceding consonant: nukta, virama, yakash and
// the udaat sign Shabad OS uses for pairin haha (ਤੁਮੑਾਰੀ)
const JOINS = new Set(['਼', '੍', 'ੵ', 'ੑ']);
// Two keys typists overlay to draw one sign; Unicode has one code point for it
const OVERLAID: [string, string][] = [['ੁੂ', 'ੂ'], ['ੂੁ', 'ੂ'], ['ਂਂ', 'ਂ'], ['ੰੰ', 'ੰ']];

// Characters a Mac Roman reading of a byte gives that Windows-1252 has no
// character for: a PDF made on a Mac shows Satluj's 0xC3 as '√', not 'Ã'
const CP1252_SET = new Set(CP1252_HIGH);
const MAC_ONLY = new Set([...MAC_ROMAN_HIGH].filter(c => !CP1252_SET.has(c)));

// Re-read a line decoded as Mac Roman as the Windows-1252 text the font expects
function macRomanToWindows(line: string): string {
  return [...line].map(c => {
    const cp = c.codePointAt(0)!;
    if (cp < 0x80) return c;
    const byte = MAC_ROMAN_HIGH.indexOf(c);
    return byte === -1 ? c : CP1252_HIGH[byte];
  }).join('');
}

function isClusterBase(u: string): boolean {
  const c = u[0];
  const cp = c.codePointAt(0)!;
  return (cp >= 0x0a15 && cp <= 0x0a39) || (cp >= 0x0a59 && cp <= 0x0a5e) || 'ਅੲੳ'.includes(c);
}

// Characters a sihari may never attach to or move across
function isWordBreak(u: string): boolean {
  const c = u[0];
  return !(c >= '਀' && c <= '੿') || (c >= '੦' && c <= '੯') || '।॥ੴ'.includes(c);
}

function startsWithAt(text: readonly string[], combo: readonly string[], i: number): boolean {
  if (i + combo.length > text.length) return false;
  for (let k = 0; k < combo.length; k++) if (text[i + k] !== combo[k]) return false;
  return true;
}

export function getLayout(encoding: string): Layout {
  const layout = LAYOUTS[encoding.toLowerCase() as Encoding];
  if (!layout) throw new Error(`Unsupported encoding: ${encoding}; choose from ${ENCODINGS.join(', ')}`);
  return layout;
}

// Convert legacy-font text to Unicode Gurmukhi, reporting anything suspect.
// Line structure is preserved exactly and no input character is dropped:
// unmapped characters pass through and are reported in `warnings`.
export function convert(input: string, encoding: Encoding = 'anmollipi'): ConversionResult {
  const layout = getLayout(encoding);
  let source = input;
  if (layout.macRomanRepair && [...source].some(c => MAC_ONLY.has(c))) {
    source = source.split('\n')
      .map(line => ([...line].some(c => MAC_ONLY.has(c)) ? macRomanToWindows(line) : line))
      .join('\n');
  }
  const text = [...source];
  const combos = layout.combos.map(([k, v]) => [[...k], v] as const);

  // [unicode, length] for the token at i, or [null, 1] if unmapped
  function match(i: number): [string | null, number] {
    for (const [combo, replacement] of combos) {
      if (startsWithAt(text, combo, i)) return [replacement, combo.length];
    }
    const k = layout.keys[text[i]];
    return k !== undefined ? [k, 1] : [null, 1];
  }

  const SIHARI = 'ਿ';
  const chars: string[] = [];
  const warnings: ConversionWarning[] = [];
  let pendingSihari: number | null = null;  // input position of a sihari waiting for its consonant
  let lastClusterEnd: number | null = null; // where an orphan sihari goes, within the current word
  let consEnd: number | null = null;        // end of the current cluster's consonant part

  function flushOrphan() {
    if (pendingSihari === null) return;
    const at = lastClusterEnd ?? chars.length;
    chars.splice(at, 0, SIHARI);
    warnings.push({ position: pendingSihari, char: text[pendingSihari], kind: 'orphan_sihari', message: 'sihari with no following consonant in its word' });
    pendingSihari = null;
  }

  let i = 0;
  while (i < text.length) {
    let [u, length] = match(i);

    if (u === null) {
      if (layout.passthrough.has(text[i])) {
        u = text[i];
      } else {
        flushOrphan();
        lastClusterEnd = consEnd = null;
        chars.push(text[i]);
        warnings.push({ position: i, char: text[i], kind: 'unmapped', message: 'no mapping; passed through' });
        i += 1;
        continue;
      }
    }

    if (!u) { // decorative key (e.g. a headline bar)
      i += length;
      continue;
    }

    if (length === 1 && layout.sihari.has(text[i])) {
      if (pendingSihari !== null) flushOrphan();
      pendingSihari = i;
      i += 1;
      continue;
    }

    const cps = [...u];
    if (isClusterBase(u)) {
      // a key may carry a whole syllable (Joy: ਕੇ, ਪ੍ਰ): split off its signs
      let k = 1;
      while (k < cps.length && (JOINS.has(cps[k]) || isClusterBase(cps[k]))) k++;
      chars.push(cps.slice(0, k).join(''));
      i += length;
      // The cluster continues through a nukta, subjoined letters and a bare
      // virama with its consonant.
      while (i < text.length) {
        const [next, n] = match(i);
        if (!next || !JOINS.has([...next][0])) break;
        chars.push(next);
        i += n;
        if (next === '੍' && i < text.length) {
          const [after, m] = match(i);
          if (after && isClusterBase(after)) {
            chars.push(after);
            i += m;
          }
        }
      }
      consEnd = chars.length;
      if (pendingSihari !== null) {
        chars.push(SIHARI);
        pendingSihari = null;
      }
      if (cps.length > k) chars.push(cps.slice(k).join(''));
      lastClusterEnd = chars.length;
      continue;
    }

    if (JOINS.has(cps[0]) && consEnd !== null) {
      // typed after the vowel sign (Asees/Joy): belongs with the consonant
      chars.splice(consEnd, 0, u);
      consEnd += 1;
      lastClusterEnd = chars.length;
      i += length;
      continue;
    }

    if (isWordBreak(u)) {
      flushOrphan();
      lastClusterEnd = consEnd = null;
    }

    chars.push(u);
    i += length;
  }

  flushOrphan();
  let out = chars.join('');
  for (const [parts, sign] of OVERLAID) out = out.split(parts).join(sign);
  out = out.replace(SIGN_FIRST, '$2$1');
  for (const [parts, vowel] of COMPOSE) out = out.split(parts).join(vowel);
  if (layout.oneNasalKey) out = out.replace(BINDI_AFTER, 'ਂ');
  if (layout.joinDandas) out = out.split('।।').join('॥');
  return { text: out.normalize('NFC'), warnings, encoding: layout.name };
}

// Convert legacy-font text to Unicode Gurmukhi. Use `convert` to get warnings.
export function toUnicode(text: string, encoding: Encoding = 'anmollipi'): string {
  return convert(text, encoding).text;
}

// The encoding a font uses, from its name as a PDF or word processor reports
// it ('CKPHAK+Asees', 'GurbaniAkharThick'), or null if unknown.
export function encodingForFont(fontName: string): Encoding | null {
  const name = fontName.replace(/^[A-Z]{6}\+/, '').toLowerCase().replace(/[\s_-]/g, '');
  for (const layout of Object.values(LAYOUTS)) {
    if (layout.fonts.some(f => name.startsWith(f))) return layout.name;
  }
  return null;
}

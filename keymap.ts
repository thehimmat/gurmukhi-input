// Gurmukhi unicode helpers used by the transliteration engine.

export const GURMUKHI_START = 0x0A00;
export const GURMUKHI_END   = 0x0A7F;

export function isGurmukhiChar(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return cp >= GURMUKHI_START && cp <= GURMUKHI_END;
}

// Returns true if ch is a Gurmukhi base consonant that can take a vowel matra.
// ਕ (U+0A15) through ਹ (U+0A39) covers all primary consonants.
// ੜ (U+0A5C) is the hakka rara, outside that range.
const GURMUKHI_CONSONANTS_RE = /^[ਕ-ਹੜ]$/;
export function isGurmukhiConsonant(ch: string): boolean {
  return GURMUKHI_CONSONANTS_RE.test(ch);
}

// Returns true if ch is a Gurmukhi combining mark (matra, nukta, virama, nasal
// signs, etc.) — i.e. a character that attaches to a base letter rather than
// standing alone. Used by the keyboard viewer to prefix a dotted circle (◌).
export function isCombiningGurmukhi(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (
    cp === 0x0A01 ||                    // adak bindi (chandrabindu)
    cp === 0x0A02 ||                    // bindi
    cp === 0x0A03 ||                    // visarg
    cp === 0x0A3C ||                    // nukta
    (cp >= 0x0A3E && cp <= 0x0A4C) ||   // vowel signs (matras)
    cp === 0x0A4D ||                    // virama
    cp === 0x0A51 ||                    // udaat
    cp === 0x0A70 ||                    // tippi
    cp === 0x0A71 ||                    // addak
    cp === 0x0A75                       // yakash
  );
}

// Walks backwards through text, skipping nukta/virama/subjoined marks,
// and returns the first "real" base character. Used to determine matra context.
export function lastGurmukhiBase(text: string): string {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    const cp = ch.codePointAt(0) ?? 0;
    // Skip nukta (0A3C), virama (0A4D), subjoined (0A70-0A71)
    if (cp === 0x0A3C || cp === 0x0A4D || cp === 0x0A70 || cp === 0x0A71) continue;
    return ch;
  }
  return '';
}

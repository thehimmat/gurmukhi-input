// Unicode Gurmukhi → AnmolLipi / GurbaniAkhar keys, for text set in those
// fonts. The inverse of convert(…, 'anmollipi'): toUnicode(fromUnicode(s)) === s
// for any NFC Gurmukhi the font can draw.

const BASE: Record<string, string> = {
  'ੳ': 'a', 'ਅ': 'A', 'ੲ': 'e',
  'ਸ': 's', 'ਹ': 'h',
  'ਕ': 'k', 'ਖ': 'K', 'ਗ': 'g', 'ਘ': 'G', 'ਙ': '|',
  'ਚ': 'c', 'ਛ': 'C', 'ਜ': 'j', 'ਝ': 'J', 'ਞ': '\\',
  'ਟ': 't', 'ਠ': 'T', 'ਡ': 'f', 'ਢ': 'F', 'ਣ': 'x',
  'ਤ': 'q', 'ਥ': 'Q', 'ਦ': 'd', 'ਧ': 'D', 'ਨ': 'n',
  'ਪ': 'p', 'ਫ': 'P', 'ਬ': 'b', 'ਭ': 'B', 'ਮ': 'm',
  'ਯ': 'X', 'ਰ': 'r', 'ਲ': 'l', 'ਵ': 'v', 'ੜ': 'V',
};

// Nukta letters the font has a key for (NFC keeps these decomposed)
const NUKTA_FORMS: Record<string, string> = {
  'ਸ਼': 'S', 'ਖ਼': '^', 'ਗ਼': 'Z', 'ਜ਼': 'z', 'ਫ਼': '&', 'ਲ਼': 'L',
};

// Subjoined letters and other marks that join the consonant
const JOINED: Record<string, string> = {
  '੍ਹ': 'H', '੍ਰ': 'R', '੍ਵ': 'Í', '੍ਯ': 'Î', '੍ਟ': '†', '੍ਨ': '˜', '੍ਤ': 'œ', '੍ਚ': 'ç',
  'ੵ': '´', 'ੑ': '@',
};

const SIGNS: Record<string, string> = {
  'ਾ': 'w', 'ੀ': 'I', 'ੁ': 'u', 'ੂ': 'U', 'ੇ': 'y', 'ੈ': 'Y', 'ੋ': 'o', 'ੌ': 'O',
  'ੰ': 'M', 'ਂ': 'N', 'ੱ': '`', 'ਃ': 'Ú', 'ਁ': '`N',
};
const SIHARI = 'ਿ';

// Independent vowels, typed as carrier + sign (sihari before the carrier)
const INDEPENDENT: Record<string, string> = {
  'ਆ': 'Aw', 'ਐ': 'AY', 'ਔ': 'AO', 'ਇ': 'ie', 'ਈ': 'eI', 'ਏ': 'ey', 'ਉ': 'au', 'ਊ': 'aU', 'ਓ': 'E',
};

const OTHER: Record<string, string> = {
  '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  '।': '[', '॥': ']', 'ੴ': '<>',
};

export function fromUnicode(text: string): string {
  const cps = [...text.normalize('NFC')];
  let out = '';
  let i = 0;

  while (i < cps.length) {
    const c = cps[i];

    if (BASE[c]) {
      // the cluster: base letter (+ nukta) + subjoined letters and joining marks
      let cluster: string;
      if (cps[i + 1] === '਼') {
        cluster = NUKTA_FORMS[c + '਼'] ?? BASE[c] + 'æ';
        i += 2;
      } else {
        cluster = BASE[c];
        i += 1;
      }
      for (;;) {
        const pair = cps[i] === '੍' ? cps[i] + (cps[i + 1] ?? '') : null;
        if (pair && JOINED[pair]) {
          cluster += JOINED[pair];
          i += 2;
        } else if (JOINED[cps[i]]) {
          cluster += JOINED[cps[i]];
          i += 1;
        } else {
          break;
        }
      }
      // its signs; sihari is typed before the cluster
      let sihari = '';
      let signs = '';
      while (i < cps.length && (cps[i] === SIHARI || SIGNS[cps[i]])) {
        if (cps[i] === SIHARI) sihari = 'i';
        else signs += SIGNS[cps[i]];
        i += 1;
      }
      out += sihari + cluster + signs;
      continue;
    }

    out += INDEPENDENT[c] ?? SIGNS[c] ?? OTHER[c] ?? c;
    i += 1;
  }
  return out;
}

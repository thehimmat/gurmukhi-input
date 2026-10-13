// A legacy font's keyboard layout, as exported from gurmukhi-transliterate
export type LayoutData = {
  name: string;
  label: string;
  // single key → Unicode (one or more code points); '' for decorative keys
  keys: Record<string, string>;
  // key sequences matched before single keys, in order
  combos: [string, string][];
  // keys for sihari, which these fonts type before its consonant
  sihari: string[];
  // unmapped keys that are literal text, not errors
  passthrough: string[];
  // font-name prefixes (lowercase) that use this layout
  fonts: string[];
  // tippi and bindi share a key: pick by the vowel before it
  oneNasalKey: boolean;
  // '।।' typed as two single dandas → '॥'
  joinDandas: boolean;
  // undo a Mac Roman reading of the font's bytes (PDFs made on a Mac)
  macRomanRepair: boolean;
};

// Layouts
export type { Layout, EncodedLayout } from './layouts';
export { LAYOUTS } from './layouts';

// Keystroke resolution
export { resolveKey, resolveKeyEdit, romanToGurmukhi } from './transliterate';
export type { KeyEdit } from './transliterate';
export { resolveKeydown, stripDeadKeyArtifacts } from './dispatch';
export type { KeyEventLike, KeydownAction } from './dispatch';

// Editing controller — what framework bindings call
export { applyKeydown, applyPaste, resolveLayout } from './editor';
export type { EditState, EditResult } from './editor';

// On-screen keyboard data
export { resolveKeyboard } from './keyboard';
export type { Modifiers, ResolvedKey } from './keyboard';
export { US_ANSI_ROWS } from './geometry';
export type { PhysicalKey } from './geometry';

// Unicode helpers
export {
  GURMUKHI_START,
  GURMUKHI_END,
  isGurmukhiChar,
  isGurmukhiConsonant,
  isCombiningGurmukhi,
  lastGurmukhiBase,
} from './keymap';

export { useGurmukhiInput } from './useGurmukhiInput';
export { default as GurmukhiInput } from './GurmukhiInput';

// Re-exported from @atthebunga/gurmukhi-core for backwards compatibility
export {
  romanToGurmukhi,
  resolveKey,
  resolveKeydown,
  stripDeadKeyArtifacts,
  isGurmukhiChar,
  isGurmukhiConsonant,
  isCombiningGurmukhi,
  LAYOUTS,
} from '@atthebunga/gurmukhi-core';
export type { KeyEventLike, KeydownAction, Layout } from '@atthebunga/gurmukhi-core';

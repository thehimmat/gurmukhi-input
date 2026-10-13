import { GurmukhiInputElement } from './input-element';
import { GurmukhiKeyboardElement } from './keyboard-element';

// Register <gurmukhi-input> and <gurmukhi-keyboard>. Safe to call more than
// once, and a no-op outside the browser.
export function defineGurmukhiElements() {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get('gurmukhi-input')) customElements.define('gurmukhi-input', GurmukhiInputElement);
  if (!customElements.get('gurmukhi-keyboard')) customElements.define('gurmukhi-keyboard', GurmukhiKeyboardElement);
}

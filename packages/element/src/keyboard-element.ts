import { resolveKeyboard, type Layout } from '@atthebunga/gurmukhi-core';
import { writeField, type GurmukhiField } from './attach';
import { BaseElement } from './base';

// Per-row left indent (in key widths) to approximate ANSI stagger
const ROW_INDENT = [0, 0.5, 0.75, 1.25];

const STYLE = `
:host {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  background: var(--gk-bg, #2b2b2b);
  font-family: "Noto Sans Gurmukhi", system-ui, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}
.row { display: flex; gap: 6px; }
.mods { display: flex; gap: 6px; margin-bottom: 2px; }
button {
  font: inherit;
  color: var(--gk-key-color, #f5f5f5);
  background: var(--gk-key-bg, #3a3a3a);
  border: 1px solid var(--gk-key-border, #555);
}
.key {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 7px;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}
.key:disabled { opacity: 0.35; cursor: default; }
.key:focus-visible, .mod:focus-visible { outline: 2px solid var(--gk-focus, #c9a46a); outline-offset: 1px; }
.hint {
  position: absolute;
  top: 3px;
  left: 4px;
  font-size: 9px;
  color: var(--gk-hint-color, #888);
  font-family: system-ui, sans-serif;
}
.mod {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-family: system-ui, sans-serif;
  cursor: pointer;
}
.mod[aria-pressed="true"] { background: var(--gk-key-active-bg, #5a4632); }
.mod:disabled { opacity: 0.5; cursor: default; }
`;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
}

// <gurmukhi-keyboard for="field-id" layout="gurmukhi-qwerty" shift option
//                    hide-hints hide-modifiers no-track>
//
// Clicking a key inserts its character into the field named by `for` (an
// <input>, <textarea>, or <gurmukhi-input>) and fires `gurmukhi-keypress`.
// Theme it with the same --gk-* CSS variables as the React keyboard.
export class GurmukhiKeyboardElement extends BaseElement {
  static observedAttributes = ['layout', 'shift', 'option', 'hide-hints', 'hide-modifiers', 'no-track'];

  // Custom layout object; overrides the layout attribute
  private layoutObject: Layout | null = null;
  private shiftState = false;
  private optionState = false;
  private tracking = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    // Keep focus (and the caret) in the field while clicking keys
    root.addEventListener('mousedown', e => {
      if ((e.target as Element).closest('button')) e.preventDefault();
    });
    root.addEventListener('click', e => this.onClick(e));
  }

  get layout(): string | Layout {
    return this.layoutObject ?? this.getAttribute('layout') ?? 'gurmukhi-qwerty';
  }

  set layout(v: string | Layout) {
    if (typeof v === 'string') {
      this.layoutObject = null;
      this.setAttribute('layout', v);
    } else {
      this.layoutObject = v;
      this.render();
    }
  }

  // The field keys are inserted into, from the `for` attribute
  get target(): GurmukhiField | null {
    const id = this.getAttribute('for');
    const el = id ? (this.getRootNode() as Document | ShadowRoot).getElementById(id) : null;
    if (!el) return null;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el;
    return el.querySelector('input, textarea');
  }

  connectedCallback() {
    this.updateTracking();
    this.render();
  }

  disconnectedCallback() {
    this.setTracking(false);
  }

  attributeChangedCallback(name: string) {
    if (name === 'no-track') this.updateTracking();
    this.render();
  }

  private get shift() { return this.hasAttribute('shift') || this.shiftState; }
  private get option() { return this.hasAttribute('option') || this.optionState; }

  // Mirror physically held Shift / Option keys
  private syncModifiers = (e: KeyboardEvent) => {
    if (this.shiftState === e.shiftKey && this.optionState === e.altKey) return;
    this.shiftState = e.shiftKey;
    this.optionState = e.altKey;
    this.render();
  };

  private updateTracking() {
    this.setTracking(this.isConnected && !this.hasAttribute('no-track'));
  }

  private setTracking(on: boolean) {
    if (on === this.tracking) return;
    this.tracking = on;
    if (on) {
      window.addEventListener('keydown', this.syncModifiers);
      window.addEventListener('keyup', this.syncModifiers);
    } else {
      window.removeEventListener('keydown', this.syncModifiers);
      window.removeEventListener('keyup', this.syncModifiers);
    }
  }

  private onClick(e: Event) {
    const button = (e.target as Element).closest('button');
    if (!button || button.disabled) return;

    const mod = button.dataset.mod;
    if (mod === 'shift') this.shiftState = !this.shiftState;
    if (mod === 'option') this.optionState = !this.optionState;
    if (mod) return this.render();

    const char = button.dataset.output;
    if (!char) return;
    this.insert(char);
    this.dispatchEvent(new CustomEvent('gurmukhi-keypress', { detail: { char }, bubbles: true, composed: true }));
  }

  private insert(char: string) {
    const field = this.target;
    if (!field) return;
    const len = field.value.length;
    const start = field.selectionStart ?? len;
    const end = field.selectionEnd ?? len;
    writeField(field, {
      value: field.value.slice(0, start) + char + field.value.slice(end),
      selectionStart: start + char.length,
      selectionEnd: start + char.length,
    });
  }

  private render() {
    if (!this.shadowRoot) return;
    const rows = resolveKeyboard(this.layout, { shift: this.shift, option: this.option });
    const hints = !this.hasAttribute('hide-hints');

    const mods = this.hasAttribute('hide-modifiers') ? '' : `
      <div class="mods">
        <button type="button" class="mod" data-mod="shift" aria-pressed="${this.shift}" ${this.hasAttribute('shift') ? 'disabled' : ''}>⇧ Shift</button>
        <button type="button" class="mod" data-mod="option" aria-pressed="${this.option}" ${this.hasAttribute('option') ? 'disabled' : ''}>⌥ Option</button>
      </div>`;

    const keys = rows.map((row, ri) => `
      <div class="row" style="padding-left:${ROW_INDENT[ri] * 46}px">${row.map(k => `
        <button type="button" class="key" part="key" data-code="${k.code}" data-output="${escapeHtml(k.output)}"
          title="${escapeHtml(k.hint)}" aria-label="${escapeHtml(k.output || k.hint)}" ${k.output ? '' : 'disabled'}>
          ${hints ? `<span class="hint" aria-hidden="true">${escapeHtml(k.hint)}</span>` : ''}<span>${escapeHtml(k.display)}</span>
        </button>`).join('')}
      </div>`).join('');

    this.shadowRoot.innerHTML = `<style>${STYLE}</style>${mods}<div role="group" aria-label="Gurmukhi keyboard">${keys}</div>`;
  }
}

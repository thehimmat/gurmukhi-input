import { attachGurmukhi, type GurmukhiAttachment, type GurmukhiField } from './attach';
import { BaseElement } from './base';

// Attributes copied onto the <input> the element creates for itself
const FORWARDED = ['placeholder', 'name', 'disabled', 'required', 'readonly', 'autocomplete', 'maxlength'];
// Moved rather than copied, so assistive tech doesn't announce the name twice
const MOVED = ['aria-label', 'aria-describedby'];

// <gurmukhi-input layout="phonetic" pattern-mode transliterate="off">
//
// Light DOM on purpose: it enhances a real <input> or <textarea> (yours, if
// you put one inside, or one it creates), so labels, forms, validation, page
// styles and framework bindings keep working as they would on a plain input.
export class GurmukhiInputElement extends BaseElement {
  static observedAttributes = ['layout', 'pattern-mode', 'transliterate', 'value', ...FORWARDED, ...MOVED];

  private attachment: GurmukhiAttachment | null = null;
  private created = false;

  // The native field being enhanced
  get field(): GurmukhiField | null {
    return this.querySelector('input, textarea');
  }

  get value(): string {
    return this.field?.value ?? this.getAttribute('value') ?? '';
  }

  set value(v: string) {
    const field = this.field;
    if (field) field.value = v;
    else this.setAttribute('value', v);
  }

  connectedCallback() {
    let field = this.field;
    if (!field) {
      field = document.createElement('input');
      field.type = 'text';
      field.lang = 'pa';
      for (const name of FORWARDED) {
        const v = this.getAttribute(name);
        if (v !== null) field.setAttribute(name, v);
      }
      this.created = true;
      this.append(field);
      for (const name of MOVED) this.moveToField(name, this.getAttribute(name));
    }
    const initial = this.getAttribute('value');
    if (initial !== null) field.value = initial;

    this.attachment?.detach();
    this.attachment = attachGurmukhi(field, this.options());
  }

  disconnectedCallback() {
    this.attachment?.detach();
    this.attachment = null;
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (!this.attachment) return;
    if (name === 'layout' || name === 'pattern-mode' || name === 'transliterate') {
      this.attachment.update(this.options());
    } else if (MOVED.includes(name)) {
      if (this.created) this.moveToField(name, value);
    } else if (name === 'value') {
      if (value !== null && this.field) this.field.value = value;
    } else if (this.created && this.field) {
      if (value === null) this.field.removeAttribute(name);
      else this.field.setAttribute(name, value);
    }
  }

  private moveToField(name: string, value: string | null) {
    // Removing the host attribute calls back here with null; ignore that
    if (value === null || !this.field) return;
    this.field.setAttribute(name, value);
    this.removeAttribute(name);
  }

  private options() {
    return {
      layout: this.getAttribute('layout') ?? 'phonetic',
      patternMode: this.hasAttribute('pattern-mode'),
      enabled: this.getAttribute('transliterate') !== 'off',
    };
  }
}

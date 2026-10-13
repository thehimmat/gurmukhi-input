import type { EditState, Layout } from '@atthebunga/gurmukhi-core';
import { applyKeydown, applyPaste, resolveLayout, stripDeadKeyArtifacts } from '@atthebunga/gurmukhi-core';

export type GurmukhiField = HTMLInputElement | HTMLTextAreaElement;

export type AttachOptions = {
  // 'igurbani' (default) | 'gurmukhi-qwerty' | a custom Layout object
  layout?: string | Layout;
  // Leave { } _ * ( ) | and text inside { } unconverted
  patternMode?: boolean;
  // false turns conversion off without detaching
  enabled?: boolean;
};

export type GurmukhiAttachment = {
  // Change options in place, e.g. to switch layout
  update(options: AttachOptions): void;
  // Remove the listeners; the field goes back to plain typing
  detach(): void;
};

function stateOf(field: GurmukhiField): EditState {
  const len = field.value.length;
  return {
    value: field.value,
    selectionStart: field.selectionStart ?? len,
    selectionEnd: field.selectionEnd ?? len,
  };
}

// Write a new state and announce it with a bubbling `input` event, the same
// event the browser fires for typing, so v-model, bind:value, ngModel and
// plain listeners all pick it up.
export function writeField(field: GurmukhiField, next: EditState) {
  field.value = next.value;
  field.setSelectionRange(next.selectionStart, next.selectionEnd);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

// Make an existing <input> or <textarea> type Gurmukhi. Works with any
// framework, or none: it only listens for keydown and paste on the field.
export function attachGurmukhi(field: GurmukhiField, options: AttachOptions = {}): GurmukhiAttachment {
  let layout = resolveLayout(options.layout ?? 'igurbani');
  let patternMode = options.patternMode ?? false;
  let enabled = options.enabled ?? true;

  function onKeyDown(e: KeyboardEvent) {
    if (!enabled) return;
    const next = applyKeydown(stateOf(field), e, layout, { patternMode });
    if (!next) return;

    e.preventDefault();
    writeField(field, next);

    // macOS dead keys still insert their accent after preventDefault.
    // Blur/refocus ends the composition, then strip the leftover mark.
    if (next.endComposition) {
      setTimeout(() => {
        field.blur();
        const cleaned = stripDeadKeyArtifacts(field.value, field.selectionStart ?? field.value.length);
        field.focus();
        if (cleaned.value !== field.value) {
          writeField(field, { value: cleaned.value, selectionStart: cleaned.caret, selectionEnd: cleaned.caret });
        } else {
          field.setSelectionRange(cleaned.caret, cleaned.caret);
        }
      }, 0);
    }
  }

  function onPaste(e: ClipboardEvent) {
    if (!enabled || !e.clipboardData) return;
    const next = applyPaste(stateOf(field), e.clipboardData.getData('text'), layout);
    if (!next) return;

    e.preventDefault();
    writeField(field, next);
  }

  // Typed as HTMLElement so the keydown/paste listener types resolve
  const target: HTMLElement = field;
  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('paste', onPaste);

  return {
    update(next) {
      if (next.layout !== undefined) layout = resolveLayout(next.layout);
      if (next.patternMode !== undefined) patternMode = next.patternMode;
      if (next.enabled !== undefined) enabled = next.enabled;
    },
    detach() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('paste', onPaste);
    },
  };
}

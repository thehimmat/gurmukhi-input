// Drive a real <input> the way a browser would: dispatch the event, and if
// nobody called preventDefault, perform the browser's default action.

export type Field = HTMLInputElement | HTMLTextAreaElement;

export function browserInsert(field: Field, text: string) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  field.value = field.value.slice(0, start) + text + field.value.slice(end);
  field.setSelectionRange(start + text.length, start + text.length);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

export type KeyInit = { key: string; code?: string; shift?: boolean; alt?: boolean; meta?: boolean; ctrl?: boolean };

export function press(field: Field, k: KeyInit): boolean {
  const ev = new KeyboardEvent('keydown', {
    key: k.key,
    code: k.code ?? '',
    shiftKey: !!k.shift,
    altKey: !!k.alt,
    metaKey: !!k.meta,
    ctrlKey: !!k.ctrl,
    bubbles: true,
    cancelable: true,
  });
  const notPrevented = field.dispatchEvent(ev);
  if (notPrevented && k.key.length === 1 && !k.alt && !k.meta && !k.ctrl) browserInsert(field, k.key);
  return notPrevented;
}

export function type(field: Field, text: string) {
  for (const key of text) press(field, { key });
}

export function paste(field: Field, text: string): boolean {
  const ev = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', { value: { getData: () => text } });
  const notPrevented = field.dispatchEvent(ev);
  if (notPrevented) browserInsert(field, text);
  return notPrevented;
}

export function setCaret(field: Field, start: number, end = start) {
  field.setSelectionRange(start, end);
}

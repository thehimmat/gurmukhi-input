// Physical US-ANSI keyboard geometry.
// Each key carries its e.code plus the characters it produces on a US keyboard
// (unshifted and shifted), which the resolver uses to look up the active layout.

export type PhysicalKey = {
  code: string;      // e.code, e.g. 'KeyT', 'Digit1', 'Backquote'
  key: string;       // unshifted US char, e.g. 't', '1', '`'
  shiftKey: string;  // shifted US char, e.g. 'T', '!', '~'
};

export const US_ANSI_ROWS: PhysicalKey[][] = [
  // Number row
  [
    { code: 'Backquote', key: '`', shiftKey: '~' },
    { code: 'Digit1', key: '1', shiftKey: '!' },
    { code: 'Digit2', key: '2', shiftKey: '@' },
    { code: 'Digit3', key: '3', shiftKey: '#' },
    { code: 'Digit4', key: '4', shiftKey: '$' },
    { code: 'Digit5', key: '5', shiftKey: '%' },
    { code: 'Digit6', key: '6', shiftKey: '^' },
    { code: 'Digit7', key: '7', shiftKey: '&' },
    { code: 'Digit8', key: '8', shiftKey: '*' },
    { code: 'Digit9', key: '9', shiftKey: '(' },
    { code: 'Digit0', key: '0', shiftKey: ')' },
    { code: 'Minus', key: '-', shiftKey: '_' },
    { code: 'Equal', key: '=', shiftKey: '+' },
  ],
  // Top letter row
  [
    { code: 'KeyQ', key: 'q', shiftKey: 'Q' },
    { code: 'KeyW', key: 'w', shiftKey: 'W' },
    { code: 'KeyE', key: 'e', shiftKey: 'E' },
    { code: 'KeyR', key: 'r', shiftKey: 'R' },
    { code: 'KeyT', key: 't', shiftKey: 'T' },
    { code: 'KeyY', key: 'y', shiftKey: 'Y' },
    { code: 'KeyU', key: 'u', shiftKey: 'U' },
    { code: 'KeyI', key: 'i', shiftKey: 'I' },
    { code: 'KeyO', key: 'o', shiftKey: 'O' },
    { code: 'KeyP', key: 'p', shiftKey: 'P' },
    { code: 'BracketLeft', key: '[', shiftKey: '{' },
    { code: 'BracketRight', key: ']', shiftKey: '}' },
    { code: 'Backslash', key: '\\', shiftKey: '|' },
  ],
  // Home row
  [
    { code: 'KeyA', key: 'a', shiftKey: 'A' },
    { code: 'KeyS', key: 's', shiftKey: 'S' },
    { code: 'KeyD', key: 'd', shiftKey: 'D' },
    { code: 'KeyF', key: 'f', shiftKey: 'F' },
    { code: 'KeyG', key: 'g', shiftKey: 'G' },
    { code: 'KeyH', key: 'h', shiftKey: 'H' },
    { code: 'KeyJ', key: 'j', shiftKey: 'J' },
    { code: 'KeyK', key: 'k', shiftKey: 'K' },
    { code: 'KeyL', key: 'l', shiftKey: 'L' },
    { code: 'Semicolon', key: ';', shiftKey: ':' },
    { code: 'Quote', key: "'", shiftKey: '"' },
  ],
  // Bottom letter row
  [
    { code: 'KeyZ', key: 'z', shiftKey: 'Z' },
    { code: 'KeyX', key: 'x', shiftKey: 'X' },
    { code: 'KeyC', key: 'c', shiftKey: 'C' },
    { code: 'KeyV', key: 'v', shiftKey: 'V' },
    { code: 'KeyB', key: 'b', shiftKey: 'B' },
    { code: 'KeyN', key: 'n', shiftKey: 'N' },
    { code: 'KeyM', key: 'm', shiftKey: 'M' },
    { code: 'Comma', key: ',', shiftKey: '<' },
    { code: 'Period', key: '.', shiftKey: '>' },
    { code: 'Slash', key: '/', shiftKey: '?' },
  ],
];

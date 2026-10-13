# Conformance fixtures

`keystrokes.json` holds the expected behaviour of the Gurmukhi input engine as language-neutral test vectors. Every binding and every port runs the same cases: the React and web-component packages, and any future Python or Dart version. A change in behaviour is a change to this file. The format is described in `keystrokes.schema.json`.

## Running a case

1. Start from `start`. It defaults to an empty value. A missing `selection` means the caret sits at the end of the value.
2. Apply each step through the editing controller (`applyKeydown` / `applyPaste`):
   - `{ "type": "abc" }`: one keydown per character, with no modifiers.
   - `{ "key": …, "code": …, "shift"/"alt"/"meta"/"ctrl": … }`: a single keydown.
   - `{ "paste": "…" }`: a paste.
3. When the controller returns `null` (passthrough), apply what a browser would do by default:
   - A keydown for a single character with no Alt, Meta or Ctrl inserts that character at the selection.
   - Every other keydown leaves the state unchanged.
   - A paste inserts the text unchanged.
4. Compare the final state with `expected`. `endComposition` is checked only when `expected` sets it.

All offsets are UTF-16 code units, matching DOM `selectionStart`.

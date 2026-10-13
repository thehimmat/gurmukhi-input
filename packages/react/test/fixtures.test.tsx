import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import fixtures from '@atthebunga/gurmukhi-core/fixtures/keystrokes.json';
import { GurmukhiInput } from '../src';

// Runs the shared conformance cases through the real component, so the React
// wiring (preventDefault, caret restore, paste) is held to the same contract
// as the core controller. See packages/core/fixtures/README.md.

type State = { value: string; selection?: number[] };
type Step =
  | { type: string }
  | { key: string; code?: string; shift?: boolean; alt?: boolean; meta?: boolean; ctrl?: boolean }
  | { paste: string };
type Case = { name: string; layout: string; patternMode?: boolean; start?: State; steps: Step[]; expected: State };

let frames: FrameRequestCallback[] = [];
beforeEach(() => {
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return 0; });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function flushFrames() {
  const pending = frames;
  frames = [];
  pending.forEach(cb => cb(0));
}

function Field({ c }: { c: Case }) {
  const [value, setValue] = useState(c.start?.value ?? '');
  return <GurmukhiInput aria-label="field" value={value} onChange={setValue} layout={c.layout} patternMode={c.patternMode} />;
}

// What the browser does when we don't preventDefault
function browserInsert(input: HTMLInputElement, text: string) {
  const start = input.selectionStart!;
  const next = input.value.slice(0, start) + text + input.value.slice(input.selectionEnd!);
  fireEvent.change(input, { target: { value: next } });
  input.selectionStart = input.selectionEnd = start + text.length;
}

function* keys(steps: Step[]) {
  for (const step of steps) {
    if ('paste' in step) yield step;
    else if ('type' in step) for (const key of step.type) yield { key };
    else yield step;
  }
}

describe('conformance fixtures (React)', () => {
  it.each((fixtures.cases as Case[]).map(c => [c.name, c] as const))('%s', (_, c) => {
    const { getByLabelText } = render(<Field c={c} />);
    const input = getByLabelText('field') as HTMLInputElement;
    const len = input.value.length;
    [input.selectionStart, input.selectionEnd] = c.start?.selection ?? [len, len];

    for (const ev of keys(c.steps)) {
      if ('paste' in ev) {
        const notPrevented = fireEvent.paste(input, { clipboardData: { getData: () => ev.paste } });
        if (notPrevented) browserInsert(input, ev.paste);
      } else {
        const notPrevented = fireEvent.keyDown(input, {
          key: ev.key,
          code: 'code' in ev ? ev.code : '',
          shiftKey: 'shift' in ev && !!ev.shift,
          altKey: 'alt' in ev && !!ev.alt,
          metaKey: 'meta' in ev && !!ev.meta,
          ctrlKey: 'ctrl' in ev && !!ev.ctrl,
        });
        const modified = 'alt' in ev && ev.alt || 'meta' in ev && ev.meta || 'ctrl' in ev && ev.ctrl;
        if (notPrevented && ev.key.length === 1 && !modified) browserInsert(input, ev.key);
      }
      act(flushFrames);
    }

    const want = c.expected.selection ?? [c.expected.value.length, c.expected.value.length];
    expect({ value: input.value, selection: [input.selectionStart, input.selectionEnd] })
      .toEqual({ value: c.expected.value, selection: want });
  });
});

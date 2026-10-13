import { afterEach, describe, expect, it } from 'vitest';
import fixtures from '@atthebunga/gurmukhi-core/fixtures/keystrokes.json';
import { attachGurmukhi } from '../src';
import { paste, press } from './helpers';

// The shared conformance cases, run through attachGurmukhi with real DOM
// events. See packages/core/fixtures/README.md.

type State = { value: string; selection?: number[] };
type Step =
  | { type: string }
  | { key: string; code?: string; shift?: boolean; alt?: boolean; meta?: boolean; ctrl?: boolean }
  | { paste: string };
type Case = { name: string; layout: string; patternMode?: boolean; start?: State; steps: Step[]; expected: State };

afterEach(() => { document.body.innerHTML = ''; });

describe('conformance fixtures (attachGurmukhi)', () => {
  it.each((fixtures.cases as Case[]).map(c => [c.name, c] as const))('%s', (_, c) => {
    const input = document.createElement('input');
    document.body.append(input);
    input.value = c.start?.value ?? '';
    const [s, e] = c.start?.selection ?? [input.value.length, input.value.length];
    input.setSelectionRange(s, e);
    attachGurmukhi(input, { layout: c.layout, patternMode: c.patternMode });

    for (const step of c.steps) {
      if ('paste' in step) paste(input, step.paste);
      else if ('type' in step) for (const key of step.type) press(input, { key });
      else press(input, step);
    }

    const want = c.expected.selection ?? [c.expected.value.length, c.expected.value.length];
    expect({ value: input.value, selection: [input.selectionStart, input.selectionEnd] })
      .toEqual({ value: c.expected.value, selection: want });
  });
});

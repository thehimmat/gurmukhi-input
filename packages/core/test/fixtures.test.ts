import { describe, expect, it } from 'vitest';
import fixtures from '../fixtures/keystrokes.json';
import schema from '../fixtures/keystrokes.schema.json';
import { applyKeydown, applyPaste, resolveLayout, type EditResult, type EditState } from '../src/editor';
import type { KeyEventLike } from '../src/dispatch';

type State = { value: string; selection?: number[]; endComposition?: boolean };
type Step =
  | { type: string }
  | { key: string; code?: string; shift?: boolean; alt?: boolean; meta?: boolean; ctrl?: boolean }
  | { paste: string };
type Case = { name: string; layout: string; patternMode?: boolean; start?: State; steps: Step[]; expected: State };

const cases = fixtures.cases as Case[];

function toEdit(s: State = { value: '' }): EditState {
  const [start, end] = s.selection ?? [s.value.length, s.value.length];
  return { value: s.value, selectionStart: start, selectionEnd: end };
}

function insert(state: EditState, text: string): EditState {
  const { value, selectionStart: start, selectionEnd: end } = state;
  const caret = start + text.length;
  return { value: value.slice(0, start) + text + value.slice(end), selectionStart: caret, selectionEnd: caret };
}

// Expand steps into individual key events / pastes
function* events(steps: Step[]): Generator<KeyEventLike | { paste: string }> {
  for (const step of steps) {
    if ('paste' in step) yield step;
    else if ('type' in step) {
      for (const key of step.type) {
        yield { key, code: '', shiftKey: false, altKey: false, metaKey: false, ctrlKey: false };
      }
    } else {
      yield {
        key: step.key,
        code: step.code ?? '',
        shiftKey: step.shift ?? false,
        altKey: step.alt ?? false,
        metaKey: step.meta ?? false,
        ctrlKey: step.ctrl ?? false,
      };
    }
  }
}

// Run a case; on passthrough, do what a browser would by default
function run(c: Case): EditResult {
  const layout = resolveLayout(c.layout);
  let state: EditResult = toEdit(c.start);
  for (const ev of events(c.steps)) {
    if ('paste' in ev) {
      state = applyPaste(state, ev.paste, layout) ?? insert(state, ev.paste);
      continue;
    }
    const next = applyKeydown(state, ev, layout, { patternMode: c.patternMode });
    if (next) state = next;
    else if (ev.key.length === 1 && !ev.altKey && !ev.metaKey && !ev.ctrlKey) state = insert(state, ev.key);
    else state = { ...state, endComposition: undefined };
  }
  return state;
}

describe('conformance fixtures', () => {
  it.each(cases.map(c => [c.name, c] as const))('%s', (_, c) => {
    const actual = run(c);
    const want = toEdit(c.expected);
    expect({ value: actual.value, selection: [actual.selectionStart, actual.selectionEnd] })
      .toEqual({ value: want.value, selection: [want.selectionStart, want.selectionEnd] });
    if (c.expected.endComposition !== undefined) {
      expect(actual.endComposition ?? false).toBe(c.expected.endComposition);
    }
  });
});

describe('fixture file', () => {
  it('has unique case names', () => {
    const names = cases.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('only uses layouts the schema allows', () => {
    const allowed = schema.$defs.case.properties.layout.enum;
    for (const c of cases) expect(allowed).toContain(c.layout);
  });

  it('only uses known case fields', () => {
    const known = Object.keys(schema.$defs.case.properties);
    for (const c of cases) for (const k of Object.keys(c)) expect(known).toContain(k);
  });
});

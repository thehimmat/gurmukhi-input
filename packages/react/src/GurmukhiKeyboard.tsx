'use client';

import { useEffect, useState } from 'react';
import type { Layout } from '@atthebunga/gurmukhi-core';
import { resolveKeyboard } from '@atthebunga/gurmukhi-core';

interface GurmukhiKeyboardProps {
  // 'phonetic' | 'igurbani' | 'gurmukhi-qwerty' | a custom Layout object. Default 'gurmukhi-qwerty'.
  layout?: string | Layout;
  // Controlled modifier state (optional). If provided, overrides internal state.
  shift?: boolean;
  option?: boolean;
  // Listen to physical Shift/Alt holds and reflect them live. Default true.
  trackPhysicalModifiers?: boolean;
  // Show on-screen Shift / Option toggle buttons. Default true.
  showModifierToggles?: boolean;
  // Show the small ASCII key hint in each key's corner. Default true.
  showKeyHints?: boolean;
  // Called with the produced Gurmukhi character when a key is clicked.
  onKeyPress?: (char: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Per-row left indent (in key-width fractions) to approximate ANSI stagger.
const ROW_INDENT = [0, 0.5, 0.75, 1.25];

export default function GurmukhiKeyboard({
  layout = 'gurmukhi-qwerty',
  shift: shiftProp,
  option: optionProp,
  trackPhysicalModifiers = true,
  showModifierToggles = true,
  showKeyHints = true,
  onKeyPress,
  className,
  style,
}: GurmukhiKeyboardProps) {
  const [shiftState, setShiftState] = useState(false);
  const [optionState, setOptionState] = useState(false);

  const shift = shiftProp ?? shiftState;
  const option = optionProp ?? optionState;

  // Live-reflect physically held Shift/Alt
  useEffect(() => {
    if (!trackPhysicalModifiers) return;
    function sync(e: KeyboardEvent) {
      if (shiftProp === undefined) setShiftState(e.shiftKey);
      if (optionProp === undefined) setOptionState(e.altKey);
    }
    window.addEventListener('keydown', sync);
    window.addEventListener('keyup', sync);
    return () => {
      window.removeEventListener('keydown', sync);
      window.removeEventListener('keyup', sync);
    };
  }, [trackPhysicalModifiers, shiftProp, optionProp]);

  const rows = resolveKeyboard(layout, { shift, option });

  return (
    <div
      className={className}
      style={{
        // Theming hooks (override via CSS vars or style)
        ['--gk-bg' as string]: 'var(--gk-bg, #2b2b2b)',
        ['--gk-key-bg' as string]: 'var(--gk-key-bg, #3a3a3a)',
        ['--gk-key-border' as string]: 'var(--gk-key-border, #555)',
        ['--gk-key-color' as string]: 'var(--gk-key-color, #f5f5f5)',
        ['--gk-hint-color' as string]: 'var(--gk-hint-color, #888)',
        ['--gk-key-active-bg' as string]: 'var(--gk-key-active-bg, #5a4632)',
        background: 'var(--gk-bg)',
        borderRadius: 10,
        padding: 10,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: '"Noto Sans Gurmukhi", system-ui, sans-serif',
        userSelect: 'none',
        ...style,
      }}
    >
      {showModifierToggles && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
          <ModToggle
            label="⇧ Shift"
            active={shift}
            disabled={shiftProp !== undefined}
            onClick={() => setShiftState(s => !s)}
          />
          <ModToggle
            label="⌥ Option"
            active={option}
            disabled={optionProp !== undefined}
            onClick={() => setOptionState(s => !s)}
          />
        </div>
      )}

      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6, paddingLeft: `${ROW_INDENT[ri] * 46}px` }}>
          {row.map(k => {
            const empty = k.output === '';
            return (
              <button
                key={k.code}
                type="button"
                disabled={empty}
                onClick={() => { if (!empty) onKeyPress?.(k.output); }}
                title={k.hint}
                style={{
                  position: 'relative',
                  width: 46,
                  height: 46,
                  borderRadius: 7,
                  border: '1px solid var(--gk-key-border)',
                  background: 'var(--gk-key-bg)',
                  color: 'var(--gk-key-color)',
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: empty ? 'default' : (onKeyPress ? 'pointer' : 'default'),
                  opacity: empty ? 0.35 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {showKeyHints && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: 4,
                      fontSize: 9,
                      color: 'var(--gk-hint-color)',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {k.hint}
                  </span>
                )}
                <span>{k.display}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ModToggle({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid var(--gk-key-border)',
        background: active ? 'var(--gk-key-active-bg)' : 'var(--gk-key-bg)',
        color: 'var(--gk-key-color)',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

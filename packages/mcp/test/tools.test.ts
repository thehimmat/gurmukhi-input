import { describe, expect, it } from 'vitest';
import { call, connect } from './helpers';

describe('tool list', () => {
  it('offers every tool, all read-only', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).sort()).toEqual([
      'convert_legacy_font', 'first_letters', 'gurmukhi_to_ipa', 'list_search_filters',
      'lookup_word', 'search_gurbani', 'type_gurmukhi', 'unicode_to_anmollipi',
    ]);
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint, t.name).toBe(true);
      expect(t.description!.length, t.name).toBeGreaterThan(40);
    }
  });
});

describe('type_gurmukhi', () => {
  it('turns phonetic roman typing into Gurmukhi', async () => {
    const r = await call(await connect(), 'type_gurmukhi', { text: 'vahigurU' });
    expect(r.structuredContent).toEqual({ gurmukhi: 'ਵਾਹਿਗੁਰੂ', layout: 'phonetic' });
  });

  it('uses the chosen layout', async () => {
    const r = await call(await connect(), 'type_gurmukhi', { text: 't1', layout: 'gurmukhi-qwerty' });
    expect(r.structuredContent.gurmukhi).toBe('ਤ੧');
  });

  it('types igurbani.com (GurbaniAkhar) keys', async () => {
    const r = await call(await connect(), 'type_gurmukhi', { text: '<> siq nwmu', layout: 'igurbani' });
    expect(r.structuredContent.gurmukhi).toBe('ੴ ਸਤਿ ਨਾਮੁ');
  });

  it('leaves text that is already Gurmukhi alone', async () => {
    const r = await call(await connect(), 'type_gurmukhi', { text: 'ਸਤਿ' });
    expect(r.structuredContent.gurmukhi).toBe('ਸਤਿ');
  });
});

describe('gurmukhi_to_ipa', () => {
  it('gives display IPA and the phonetic key', async () => {
    const r = await call(await connect(), 'gurmukhi_to_ipa', { text: 'ਸਤਿ ਨਾਮੁ' });
    expect(r.structuredContent).toEqual({ ipa: 'sət̪ɪ n̪aːmʊ', phoneticKey: 'sati namu' });
  });

  it('keeps the final schwa when asked', async () => {
    const r = await call(await connect(), 'gurmukhi_to_ipa', { text: 'ਕ', finalSchwa: true });
    expect(r.structuredContent.ipa).toBe('kə');
  });
});

describe('convert_legacy_font', () => {
  it('converts AnmolLipi by default', async () => {
    const r = await call(await connect(), 'convert_legacy_font', { text: '<> siq nwmu' });
    expect(r.structuredContent).toEqual({ unicode: 'ੴ ਸਤਿ ਨਾਮੁ', encoding: 'anmollipi', warnings: [] });
  });

  it('picks the encoding from a font name', async () => {
    const r = await call(await connect(), 'convert_legacy_font', { text: 'fJ', font: 'CKPHAK+Asees' });
    expect(r.structuredContent).toMatchObject({ unicode: 'ਇ', encoding: 'asees' });
  });

  it('reports unmapped characters', async () => {
    const r = await call(await connect(), 'convert_legacy_font', { text: 'k§' });
    expect(r.structuredContent.warnings).toEqual([{ position: 1, char: '§', kind: 'unmapped', message: 'no mapping; passed through' }]);
  });

  it('errors on a font it does not know', async () => {
    const r = await call(await connect(), 'convert_legacy_font', { text: 'k', font: 'Arial' });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/Arial/);
  });
});

describe('unicode_to_anmollipi', () => {
  it('converts Unicode to AnmolLipi keys', async () => {
    const r = await call(await connect(), 'unicode_to_anmollipi', { text: 'ਸਤਿ ਨਾਮੁ' });
    expect(r.structuredContent).toEqual({ anmollipi: 'siq nwmu' });
  });
});

describe('first_letters', () => {
  it('gives the first letters of a line for first-letter search', async () => {
    const r = await call(await connect(), 'first_letters', { text: 'ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥੧॥' });
    expect(r.structuredContent).toEqual({ firstLetters: 'ਸਨਕਪ', words: ['ਸਤਿ', 'ਨਾਮੁ', 'ਕਰਤਾ', 'ਪੁਰਖੁ'] });
  });
});

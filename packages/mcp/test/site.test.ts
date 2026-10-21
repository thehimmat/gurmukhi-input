import { describe, expect, it } from 'vitest';
import searchFixture from './fixture-search.json';
import wordFixture from './fixture-word.json';
import metaFixture from './fixture-meta.json';
import { call, connect, fakeFetch } from './helpers';

// Fixtures are real responses from search.atthebunga.com (trimmed).

describe('search_gurbani', () => {
  it('queries the site search API and returns compact lines', async () => {
    const f = fakeFetch({ '/api/search': { body: searchFixture } });
    const r = await call(await connect(f.fetch), 'search_gurbani', { query: 'ਨਾਮੁ' });
    expect(f.calls[0].searchParams.get('mode')).toBe('contains');
    expect(f.calls[0].searchParams.get('q')).toBe('ਨਾਮੁ');
    expect(f.calls[0].searchParams.get('page')).toBe('0');
    const first = r.structuredContent.lines[0];
    expect(first).toMatchObject({ ang: 1, gurmukhi: expect.stringContaining('ਸਤਿ ਨਾਮੁ'), translation: expect.any(String) });
    expect(r.structuredContent).toMatchObject({ page: 0, total: searchFixture.total });
  });

  it('passes mode, filters and page', async () => {
    const f = fakeFetch({ '/api/search': { body: { lines: [], total: 0, page: 2, pageSize: 20 } } });
    await call(await connect(f.fetch), 'search_gurbani', {
      query: 'ਸਨਕਪ', mode: 'first_letter', writers: ['Guru Nanak Dev Ji', 'Guru Angad Dev Ji'], raags: ['Jap'], page: 2,
    });
    const sp = f.calls[0].searchParams;
    expect(sp.get('mode')).toBe('first_letter');
    expect(sp.getAll('writer')).toEqual(['Guru Nanak Dev Ji', 'Guru Angad Dev Ji']);
    expect(sp.getAll('raag')).toEqual(['Jap']);
    expect(sp.get('page')).toBe('2');
  });

  it('turns roman typing into Gurmukhi before searching', async () => {
    const f = fakeFetch({ '/api/search': { body: { lines: [], total: 0, page: 0, pageSize: 20 } } });
    await call(await connect(f.fetch), 'search_gurbani', { query: 'nwmu', typed: 'anmollipi' });
    expect(f.calls[0].searchParams.get('q')).toBe('ਨਾਮੁ');
    await call(await connect(f.fetch), 'search_gurbani', { query: 'nAmu', typed: 'phonetic' });
    expect(f.calls[1].searchParams.get('q')).toBe('ਨਾਮੁ');
  });

  it('reports a site error as a tool error', async () => {
    const f = fakeFetch({ '/api/search': { status: 400, body: { error: 'canceling statement due to statement timeout' } } });
    const r = await call(await connect(f.fetch), 'search_gurbani', { query: 'ਸਨਕਪ', mode: 'first_letter' });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/statement timeout/);
  });

  it('reports a network failure as a tool error', async () => {
    const f = fakeFetch({ '/api/search': new TypeError('fetch failed') });
    const r = await call(await connect(f.fetch), 'search_gurbani', { query: 'ਨਾਮੁ' });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/fetch failed/);
  });
});

describe('lookup_word', () => {
  it('returns the dictionary entry, trimmed, with a link', async () => {
    const f = fakeFetch({ '/api/word': { body: wordFixture } });
    const r = await call(await connect(f.fetch), 'lookup_word', { word: 'ਨਾਮੁ' });
    expect(decodeURIComponent(f.calls[0].pathname)).toBe('/api/word/ਨਾਮੁ');
    const e = r.structuredContent;
    expect(e).toMatchObject({ found: true, word: 'ਨਾਮੁ', frequency: 3531, ipa: 'n̪aːmʊ' });
    expect(e.url).toBe('https://site.test/word/' + encodeURIComponent('ਨਾਮੁ'));
    expect(e.definitions[0]).toMatchObject({ text: expect.stringContaining('ਨਾਮ') });
    expect(e.etymology[0]).toMatchObject({ language: 'Sanskrit' });
    expect(e.variants).toContain('ਨਾਮੰ');
    expect(e.topWriters[0]).toEqual({ writer: 'Guru Arjan Dev Ji', count: 78 });
  });

  it('says so when the word is not in the dictionary', async () => {
    const f = fakeFetch({ '/api/word': { status: 404, body: { error: 'Word not found' } } });
    const r = await call(await connect(f.fetch), 'lookup_word', { word: 'ਨਹੀਂਸ਼ਬਦ' });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent).toEqual({ found: false, word: 'ਨਹੀਂਸ਼ਬਦ' });
  });
});

describe('list_search_filters', () => {
  it('lists raags, writers and corpora', async () => {
    const f = fakeFetch({ '/api/meta': { body: metaFixture } });
    const r = await call(await connect(f.fetch), 'list_search_filters', {});
    expect(r.structuredContent.writers).toContainEqual({ name: 'Guru Nanak Dev Ji', lines: expect.any(Number) });
    expect(r.structuredContent.raags.length).toBe(metaFixture.raags.length);
    expect(r.structuredContent.corpora[0]).toEqual({ id: 1, name: 'Sri Guru Granth Sahib Ji', lines: 60403 });
  });
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod';
import { applyPaste, resolveLayout } from '@atthebunga/gurmukhi-core';
import { ENCODINGS, convert, encodingForFont, fromUnicode, toUnicode } from '@atthebunga/gurmukhi-legacy';
import { phoneticKey, toIPA } from '@atthebunga/gurmukhi-phonetics';
import { firstLetters, tokenize } from '@atthebunga/gurmukhi-search-utils';
import { SiteError, createSite, type SiteOptions } from './site';

export type ServerOptions = SiteOptions;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true };
const OFFLINE = { ...READ_ONLY, openWorldHint: false };
const ONLINE = { ...READ_ONLY, openWorldHint: true };

function ok<T extends Record<string, unknown>>(data: T): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function fail(message: string): CallToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

// Phonetic typing as if each character were typed into an empty field
function typeGurmukhi(text: string, layout: string): string {
  const typed = applyPaste({ value: '', selectionStart: 0, selectionEnd: 0 }, text, resolveLayout(layout));
  return typed ? typed.value : text; // null: already Gurmukhi
}

const LAYOUT = z.enum(['phonetic', 'igurbani', 'gurmukhi-qwerty']);

export function createGurmukhiServer(opts: ServerOptions = {}): McpServer {
  const site = createSite(opts);
  const server = new McpServer(
    { name: 'gurmukhi', title: 'Gurmukhi & Gurbani', version: '0.1.0' },
    {
      instructions:
        'Tools for Gurmukhi (Punjabi script) and Gurbani. Text tools run offline: phonetic typing, IPA, ' +
        'legacy-font conversion, first letters. search_gurbani, lookup_word and list_search_filters query ' +
        `${site.base} (Sri Guru Granth Sahib, Dasam Bani and more, with a word dictionary). ` +
        'Search expects Gurmukhi; if the user typed roman letters, set `typed` so the query is converted first.',
    },
  );

  server.registerTool('type_gurmukhi', {
    title: 'Type Gurmukhi phonetically',
    description:
      'Convert roman keystrokes to Gurmukhi Unicode, as the @atthebunga/gurmukhi-input keyboard would. ' +
      'phonetic layout (default): consonants k=ਕ K=ਖ g=ਗ, dentals q=ਤ z=ਦ, retroflex t=ਟ d=ਡ; vowels A i u e o (capital = long) ' +
      'become matras after a consonant and standalone vowels elsewhere, e.g. "vAhigurU" → ਵਾਹਿਗੁਰੂ; a after a consonant is the inherent vowel, e.g. "nirBau" → ਨਿਰਭਉ. ' +
      'igurbani follows igurbani.com and the GurbaniAkhar font: sihari before its consonant, e.g. "vwihgurU" → ਵਾਹਿਗੁਰੂ, "<>" → ੴ. ' +
      'gurmukhi-qwerty follows the macOS Gurmukhi QWERTY keyboard. Text that is already Gurmukhi is returned unchanged.',
    inputSchema: { text: z.string().describe('Roman keystrokes to convert'), layout: LAYOUT.default('phonetic') },
    outputSchema: { gurmukhi: z.string(), layout: LAYOUT },
    annotations: OFFLINE,
  }, async ({ text, layout }) => ok({ gurmukhi: typeGurmukhi(text, layout), layout }));

  server.registerTool('gurmukhi_to_ipa', {
    title: 'Gurmukhi pronunciation (IPA)',
    description:
      'Pronunciation of Gurmukhi text in IPA, plus a lossy phonetic key for fuzzy matching (the key voice search uses). ' +
      'Handles the inherent vowel, vowel signs, nasal assimilation, addak and conjuncts; does not model tone. ' +
      'The word-final inherent schwa is dropped by default, as in Gurbani recitation.',
    inputSchema: {
      text: z.string().describe('Gurmukhi word or line'),
      finalSchwa: z.boolean().default(false).describe('Keep the inherent schwa at the end of words'),
    },
    outputSchema: { ipa: z.string(), phoneticKey: z.string() },
    annotations: OFFLINE,
  }, async ({ text, finalSchwa }) => ok({ ipa: toIPA(text, { finalSchwa }), phoneticKey: phoneticKey(text) }));

  server.registerTool('convert_legacy_font', {
    title: 'Convert legacy Gurmukhi font text to Unicode',
    description:
      'Convert text typed in a pre-Unicode Gurmukhi font (it looks like Latin gibberish, e.g. "<> siq nwmu") to Unicode. ' +
      `Encodings: ${ENCODINGS.join(', ')} (anmollipi covers GurbaniAkhar, GurbaniLipi, Prabhki, WebAkhar). ` +
      'Pass the font name instead of the encoding when known, e.g. from a PDF ("CKPHAK+Asees"). ' +
      'Unmapped characters pass through and are listed in warnings.',
    inputSchema: {
      text: z.string(),
      encoding: z.enum(ENCODINGS).optional().describe('Default anmollipi'),
      font: z.string().optional().describe('Font name; picks the encoding'),
    },
    outputSchema: {
      unicode: z.string(),
      encoding: z.enum(ENCODINGS),
      warnings: z.array(z.object({ position: z.number(), char: z.string(), kind: z.string(), message: z.string() })),
    },
    annotations: OFFLINE,
  }, async ({ text, encoding, font }) => {
    let enc = encoding;
    if (!enc && font) {
      const found = encodingForFont(font);
      if (!found) return fail(`Unknown font "${font}". Pass one of these encodings instead: ${ENCODINGS.join(', ')}.`);
      enc = found;
    }
    const r = convert(text, enc ?? 'anmollipi');
    return ok({ unicode: r.text, encoding: r.encoding, warnings: r.warnings });
  });

  server.registerTool('unicode_to_anmollipi', {
    title: 'Unicode Gurmukhi to AnmolLipi keys',
    description:
      'Convert Unicode Gurmukhi to the keystrokes of the AnmolLipi / GurbaniAkhar fonts, for setting text in those fonts. ' +
      'Latin digits become Gurmukhi numerals (the fonts have no Latin digits).',
    inputSchema: { text: z.string() },
    outputSchema: { anmollipi: z.string() },
    annotations: OFFLINE,
  }, async ({ text }) => ok({ anmollipi: fromUnicode(text) }));

  server.registerTool('first_letters', {
    title: 'First letters of a Gurbani line',
    description:
      'The first letter of each word of a Gurmukhi line, as used for first-letter search (e.g. "ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ" → ਸਨਕਪ). ' +
      'Dandas, numerals and punctuation are skipped, matching the search index.',
    inputSchema: { text: z.string() },
    outputSchema: { firstLetters: z.string(), words: z.array(z.string()) },
    annotations: OFFLINE,
  }, async ({ text }) => ok({ firstLetters: firstLetters(text), words: tokenize(text) }));

  server.registerTool('search_gurbani', {
    title: 'Search Gurbani',
    description:
      `Search Sri Guru Granth Sahib, Dasam Bani and Bhai Gurdas's Vaaran on ${site.base}. Returns up to 20 lines per page ` +
      'with ang, writer, raag and English translation. Modes: contains (a Gurmukhi word or part of one), ' +
      'first_letter (first letters of consecutive words, e.g. ਸਨਕਪ), pattern (_ any letter, * any run, {velar} letter classes, (a|b)). ' +
      'The query must be Gurmukhi; set typed to "phonetic" (e.g. "nAmu") or "anmollipi" (igurbani.com / GurbaniAkhar keys, e.g. "nwmu") to convert roman input first. ' +
      'Use list_search_filters for valid writer and raag names.',
    inputSchema: {
      query: z.string().min(1),
      mode: z.enum(['contains', 'first_letter', 'pattern']).default('contains'),
      typed: z.enum(['gurmukhi', 'phonetic', 'anmollipi']).default('gurmukhi').describe('How the query was typed'),
      writers: z.array(z.string()).optional(),
      raags: z.array(z.string()).optional(),
      page: z.number().int().min(0).default(0),
    },
    outputSchema: {
      query: z.string(),
      lines: z.array(z.object({
        ang: z.number().nullable(), line: z.number().nullable(), shabadId: z.number().nullable(),
        gurmukhi: z.string(), translation: z.string().nullable(), transliteration: z.string().nullable(),
        writer: z.string().nullable(), raag: z.string().nullable(),
      })),
      total: z.number().nullable(),
      page: z.number(),
      hasMore: z.boolean(),
    },
    annotations: ONLINE,
  }, async ({ query, mode, typed, writers, raags, page }) => {
    const q = typed === 'phonetic' ? typeGurmukhi(query, 'phonetic') : typed === 'anmollipi' ? toUnicode(query) : query;
    try {
      const r = await site.search({ query: q, mode, writers, raags, page });
      return ok({ query: q, ...r });
    } catch (e) {
      if (e instanceof SiteError) return fail(e.message);
      throw e;
    }
  });

  server.registerTool('lookup_word', {
    title: 'Look up a Gurbani word',
    description:
      'Dictionary entry for a Gurmukhi word from the Gurbani dictionary (gurmukhi-kosh): frequency, IPA, grammar, ' +
      'definitions (Mahan Kosh and others, often in Punjabi), etymology, spelling variants, common phrases and which writers use it most. ' +
      'Exact spelling matters (ਨਾਮੁ and ਨਾਮ are separate entries); try variants if not found.',
    inputSchema: { word: z.string().min(1).describe('One Gurmukhi word') },
    outputSchema: {
      found: z.boolean(),
      word: z.string(),
      url: z.string().optional(),
      frequency: z.number().nullable().optional(),
      ipa: z.string().nullable().optional(),
      grammar: z.array(z.object({ pos: z.string().nullable(), gender: z.string().nullable(), number: z.string().nullable() })).optional(),
      definitions: z.array(z.object({ text: z.string().nullable(), english: z.string().nullable(), source: z.string().nullable() })).optional(),
      etymology: z.array(z.object({ language: z.string().nullable(), root: z.string().nullable(), note: z.string().nullable() })).optional(),
      variants: z.array(z.string()).optional(),
      phrases: z.array(z.string()).optional(),
      topWriters: z.array(z.object({ writer: z.string(), count: z.number() })).optional(),
    },
    annotations: ONLINE,
  }, async ({ word }) => {
    try {
      const w = await site.word(word.trim());
      if (!w) return ok({ found: false, word: word.trim() });
      return ok({
        found: true,
        word: w.word.gurmukhi,
        url: site.wordUrl(w.word.gurmukhi),
        frequency: w.word.frequency,
        ipa: w.pronunciation?.ipa_display ?? null,
        grammar: (w.grammar ?? []).map(g => ({ pos: g.pos, gender: g.gender, number: g.number })),
        definitions: (w.definitions ?? []).map(d => ({ text: d.definition_text, english: d.definition_en, source: d.source_url })),
        etymology: (w.etymology ?? []).map(e => ({
          language: e.origin_language, root: e.root_form_roman ?? e.root_form, note: e.source_text,
        })),
        variants: (w.morphological_variants ?? []).map(v => v.gurmukhi),
        phrases: (w.usage?.phrases ?? []).slice(0, 10).map(p => `${p.w1} ${p.w2}`),
        topWriters: (w.stats?.writers ?? []).slice(0, 5),
      });
    } catch (e) {
      if (e instanceof SiteError) return fail(e.message);
      throw e;
    }
  });

  server.registerTool('list_search_filters', {
    title: 'List Gurbani search filters',
    description: 'The writers, raags and corpora search_gurbani can filter by, with how many lines each has.',
    inputSchema: {},
    outputSchema: {
      writers: z.array(z.object({ name: z.string(), lines: z.number() })),
      raags: z.array(z.object({ name: z.string(), lines: z.number() })),
      corpora: z.array(z.object({ id: z.number(), name: z.string(), lines: z.number() })),
    },
    annotations: ONLINE,
  }, async () => {
    try {
      const m = await site.meta();
      return ok({
        writers: m.writers.map(w => ({ name: w.name, lines: w.lineCount })),
        raags: m.raags.map(r => ({ name: r.name, lines: r.lineCount })),
        corpora: m.corpora.map(c => ({ id: c.id, name: c.name, lines: c.lineCount })),
      });
    } catch (e) {
      if (e instanceof SiteError) return fail(e.message);
      throw e;
    }
  });

  return server;
}

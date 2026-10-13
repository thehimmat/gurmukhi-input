// Thin client for the public search.atthebunga.com APIs (gurmukhi-search and
// gurmukhi-kosh). No credentials: the same endpoints the site itself uses.

export const DEFAULT_SITE_URL = 'https://search.atthebunga.com';

export type SiteOptions = {
  siteUrl?: string;
  fetch?: typeof globalThis.fetch;
};

export class SiteError extends Error {}

export type SearchMode = 'contains' | 'first_letter' | 'pattern';

export type SearchParams = {
  query: string;
  mode: SearchMode;
  writers?: string[];
  raags?: string[];
  page?: number;
};

type ApiLine = {
  ang: number | null;
  line_no: number | null;
  shabad_id: number | null;
  gurmukhi: string;
  translation_en: string | null;
  transliteration_en: string | null;
  shabads: { raag_english: string | null; writer_english: string | null } | null;
};

export type SearchLine = {
  ang: number | null;
  line: number | null;
  shabadId: number | null;
  gurmukhi: string;
  translation: string | null;
  transliteration: string | null;
  writer: string | null;
  raag: string | null;
};

export type SearchResult = { lines: SearchLine[]; total: number | null; page: number; hasMore: boolean };

export function createSite(opts: SiteOptions = {}) {
  const base = (opts.siteUrl ?? DEFAULT_SITE_URL).replace(/\/$/, '');
  const fetchFn = opts.fetch ?? globalThis.fetch;

  async function get(path: string, params?: URLSearchParams, { allow404 = false } = {}) {
    const url = `${base}${path}${params ? `?${params}` : ''}`;
    let res: Response;
    try {
      res = await fetchFn(url, { headers: { accept: 'application/json' } });
    } catch (e) {
      throw new SiteError(`Could not reach ${base}: ${(e as Error).message}`);
    }
    if (allow404 && res.status === 404) return null;
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      const detail = body && typeof body.error === 'string' ? body.error : `HTTP ${res.status}`;
      throw new SiteError(`${base}${path} failed: ${detail}`);
    }
    return body;
  }

  return {
    base,

    wordUrl(word: string) {
      return `${base}/word/${encodeURIComponent(word)}`;
    },

    async search(p: SearchParams): Promise<SearchResult> {
      const sp = new URLSearchParams({ mode: p.mode, q: p.query, page: String(p.page ?? 0) });
      for (const w of p.writers ?? []) sp.append('writer', w);
      for (const r of p.raags ?? []) sp.append('raag', r);
      const body = (await get('/api/search', sp)) as {
        lines?: ApiLine[]; total?: number | null; page?: number; pageSize?: number; hasMore?: boolean | null;
      };
      const lines = (body.lines ?? []).map(l => ({
        ang: l.ang,
        line: l.line_no,
        shabadId: l.shabad_id,
        gurmukhi: l.gurmukhi,
        translation: l.translation_en,
        transliteration: l.transliteration_en,
        writer: l.shabads?.writer_english ?? null,
        raag: l.shabads?.raag_english ?? null,
      }));
      const page = body.page ?? p.page ?? 0;
      const total = body.total ?? null;
      const hasMore = body.hasMore ?? (total !== null && (page + 1) * (body.pageSize ?? 20) < total);
      return { lines, total, page, hasMore };
    },

    async word(word: string) {
      return (await get(`/api/word/${encodeURIComponent(word)}`, undefined, { allow404: true })) as WordApi | null;
    },

    async meta() {
      return (await get('/api/meta')) as {
        raags: { name: string; lineCount: number }[];
        writers: { name: string; lineCount: number }[];
        corpora: { id: number; name: string; lineCount: number }[];
      };
    },
  };
}

export type Site = ReturnType<typeof createSite>;

export type WordApi = {
  word: { gurmukhi: string; frequency: number | null };
  pronunciation: { ipa_display: string | null } | null;
  grammar: { pos: string | null; gender: string | null; number: string | null }[] | null;
  definitions: { sense_number: number | null; definition_text: string | null; definition_en: string | null; source_url: string | null }[] | null;
  etymology: { origin_language: string | null; root_form: string | null; root_form_roman: string | null; source_text: string | null }[] | null;
  morphological_variants: { gurmukhi: string }[] | null;
  usage: { phrases?: { w1: string; w2: string; count: number }[] } | null;
  stats: { writers?: { writer: string; count: number }[] } | null;
};

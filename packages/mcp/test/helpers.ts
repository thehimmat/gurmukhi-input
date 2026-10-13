import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createGurmukhiServer } from '../src';

// A stand-in for the site's fetch: records requested URLs, answers by path
export function fakeFetch(routes: Record<string, { status?: number; body: unknown } | Error>) {
  const calls: URL[] = [];
  const fetch = async (input: string | URL | Request) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    calls.push(url);
    const key = Object.keys(routes).find(p => url.pathname === p || url.pathname.startsWith(p + '/'));
    const route = key ? routes[key] : { status: 404, body: { error: 'not found' } };
    if (route instanceof Error) throw route;
    return new Response(JSON.stringify(route.body), { status: route.status ?? 200, headers: { 'content-type': 'application/json' } });
  };
  return { fetch: fetch as typeof globalThis.fetch, calls };
}

export async function connect(fetch?: typeof globalThis.fetch) {
  const server = createGurmukhiServer({ fetch, siteUrl: 'https://site.test' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0' });
  await Promise.all([server.connect(a), client.connect(b)]);
  return client;
}

export async function call(client: Client, name: string, args: Record<string, unknown>) {
  const r = await client.callTool({ name, arguments: args });
  return r as { isError?: boolean; structuredContent?: any; content: { type: string; text: string }[] };
}

import { describe, expect, it } from 'vitest';
import { createFetchHandler } from '../src';

// The streamable-HTTP handler, as a deployment (Vercel, Next.js route,
// Cloudflare, Bun) would call it: plain Request in, Response out, stateless.

function rpc(method: string, params: unknown, id = 1) {
  return new Request('https://mcp.test/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
}

describe('createFetchHandler', () => {
  const handle = createFetchHandler();

  it('initializes', async () => {
    const res = await handle(rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.serverInfo.name).toBe('gurmukhi');
  });

  it('answers a tool call without a session', async () => {
    const res = await handle(rpc('tools/call', { name: 'type_gurmukhi', arguments: { text: 'kml' } }, 2));
    const body = await res.json();
    expect(body.result.structuredContent.gurmukhi).toBe('ਕਮਲ');
  });

  it('rejects GET (no server-sent stream in stateless mode)', async () => {
    const res = await handle(new Request('https://mcp.test/mcp', { method: 'GET', headers: { accept: 'text/event-stream' } }));
    expect(res.status).toBe(405);
  });
});

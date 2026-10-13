import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createGurmukhiServer, type ServerOptions } from './server';

// A stateless streamable-HTTP MCP endpoint as a plain fetch handler:
//   Next.js:     export const POST = createFetchHandler(); export const GET = POST;
//   Cloudflare:  export default { fetch: createFetchHandler() };
//   Bun / Deno:  Bun.serve({ fetch: createFetchHandler() })
// Each request gets a fresh server, so it scales out with no session store.
export function createFetchHandler(opts: ServerOptions = {}): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    // Stateless: no standalone SSE stream (GET) or session to end (DELETE).
    // The spec allows 405 here; an open GET stream would hang a serverless function.
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
    }
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    const server = createGurmukhiServer(opts);
    await server.connect(transport);
    try {
      return await transport.handleRequest(req);
    } finally {
      // the JSON response is fully built before handleRequest resolves
      void server.close();
    }
  };
}

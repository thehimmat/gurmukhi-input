# @atthebunga/gurmukhi-mcp

An [MCP](https://modelcontextprotocol.io) server that gives Claude, or any MCP client, tools for Gurmukhi and Gurbani.

| Tool | |
|---|---|
| `type_gurmukhi` | Roman keystrokes → Gurmukhi (`vahigurU` → ਵਾਹਿਗੁਰੂ), with the phonetic (default), igurbani (igurbani.com / GurbaniAkhar) or Gurmukhi QWERTY layout |
| `gurmukhi_to_ipa` | IPA pronunciation, plus the phonetic key used for fuzzy matching |
| `convert_legacy_font` | AnmolLipi/GurbaniAkhar, Asees, Joy, AnandpurSahib, Satluj or SONY text → Unicode, choosing the encoding from a font name if given |
| `unicode_to_anmollipi` | Unicode → AnmolLipi keystrokes |
| `first_letters` | First letters of a line, for first-letter search |
| `search_gurbani` | Search SGGS, Dasam Bani and Vaaran Bhai Gurdas: contains, first-letter or pattern, filtered by writer or raag |
| `lookup_word` | Dictionary entry: IPA, grammar, definitions, etymology, variants, phrases and writers |
| `list_search_filters` | Writers, raags and corpora |

The first five tools run offline. The last three call the public APIs of [search.atthebunga.com](https://search.atthebunga.com) and need no API key. Every tool is read-only and returns structured output.

## Claude Code

```bash
claude mcp add gurmukhi -- npx -y @atthebunga/gurmukhi-mcp
```

## Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gurmukhi": { "command": "npx", "args": ["-y", "@atthebunga/gurmukhi-mcp"] }
  }
}
```

## Hosting it (for claude.ai connectors)

`createFetchHandler()` is a stateless streamable-HTTP endpoint written as a plain `Request → Response` function. It handles POST and answers 405 to any other method. Deploy it anywhere that runs fetch handlers, then add its URL as a custom connector in claude.ai.

```ts
// Next.js / Vercel: app/mcp/route.ts
import { createFetchHandler } from '@atthebunga/gurmukhi-mcp';
const handler = createFetchHandler();
export { handler as POST, handler as GET, handler as DELETE };
```

```ts
// Cloudflare Workers
import { createFetchHandler } from '@atthebunga/gurmukhi-mcp';
export default { fetch: createFetchHandler() };
```

## Options

`createGurmukhiServer({ siteUrl, fetch })` and `createFetchHandler({ siteUrl, fetch })` accept two options:
- `siteUrl` points the online tools at another deployment.
- `fetch` lets you inject your own fetch implementation.

For the stdio server, set the `GURMUKHI_SITE_URL` environment variable instead.

## Skill

[`skills/gurmukhi/SKILL.md`](../../skills/gurmukhi/SKILL.md) is a matching Claude skill. It covers when to use these tools, and how to add Gurmukhi typing to artifacts and pages with the web component.

## License

MIT

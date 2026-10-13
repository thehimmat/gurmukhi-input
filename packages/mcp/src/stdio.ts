#!/usr/bin/env node
// Local MCP server over stdio: npx @atthebunga/gurmukhi-mcp
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createGurmukhiServer } from './server';

const server = createGurmukhiServer({ siteUrl: process.env.GURMUKHI_SITE_URL });
await server.connect(new StdioServerTransport());

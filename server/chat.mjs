// ── Workshop chat proxy ──────────────────────────────────────────
// Keeps the API key server-side. The browser never sees it.
// Reads OPENAI_API_KEY from server/.env  (gitignored — never committed).
//
// Run:  node server/chat.mjs   (defaults to port 8787)
// Falls back to the local Qwen server if no OpenAI key is present, so
// the workshop still runs offline / fully internal.

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

// --- minimal .env loader (no dep) ---
function loadEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* no .env — fine, we fall back to Qwen */ }
}
loadEnv(new URL('./.env', import.meta.url).pathname);

const KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8787;

const UPSTREAM = KEY
  ? { url: 'https://api.openai.com/v1/chat/completions',
      model: process.env.CHAT_MODEL || 'gpt-4o-mini',
      auth: `Bearer ${KEY}` }
  : { url: 'http://127.0.0.1:5052/v1/chat/completions',
      model: 'Qwen/Qwen2.5-7B-Instruct',
      auth: null };

console.log(`chat proxy on :${PORT} → ${KEY ? 'OpenAI ' + UPSTREAM.model : 'local Qwen (no OpenAI key found)'}`);

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  if (req.method !== 'POST' || !req.url.startsWith('/chat')) {
    return res.writeHead(404).end('not found');
  }

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(body);
      const headers = { 'Content-Type': 'application/json' };
      if (UPSTREAM.auth) headers.Authorization = UPSTREAM.auth;

      const r = await fetch(UPSTREAM.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: UPSTREAM.model,
          messages,
          temperature: 0.8,
          max_tokens: 700,
        }),
      });
      const data = await r.json();
      const reply = data?.choices?.[0]?.message?.content
        ?? '(no reply — check the chat proxy console)';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      console.error('chat error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
}).listen(PORT);

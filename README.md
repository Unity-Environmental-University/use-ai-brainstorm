# use-ai-brainstorm

A small library of **prompting protocols** for a one-hour workshop on AI use.

The thesis: prompting is emotional regulation. Anthropic's 2026 interpretability
work (*Emotion Concepts and their Function in a Large Language Model*) found
that a model's operative emotion causally steers its behavior — **calm reduces
misalignment, desperation increases it.** A good protocol shapes the context so
the model stays calm. That's the whole workshop.

## The site

The site is the protocol picker. Two live chatbots, plus a paste-able protocol
sheet for each so you can take the protocol to whatever AI tool you already use
(ChatGPT, Claude, Gemini, etc.).

## The protocols

Defined as data in `src/lib/protocols.js`. Adding one = adding an object there.

- **Brainstorm & Decide** — two-phase: diverge, then converge.
- **Socratic Lead** — help fully, then hand the ball back with one question.

Three more are scaffolded but UI-hidden until their chatbots are tuned (Active
Listening, Room to Be Wrong, Order of Arrival). They keep `status: 'soon'` in
the registry; `ToolsPage.jsx` only shows `status: 'live'`.

## Running it

```sh
npm install
npm run chat   # chat proxy on :8787  (terminal 1)
npm run dev    # vite dev server      (terminal 2)
```

The chat proxy (`server/chat.mjs`) keeps the API key server-side — the browser
never sees it. It reads `OPENAI_API_KEY` from `server/.env` (gitignored, never
committed). If no key is present it falls back to the local Qwen server on
:5052.

`server/.env`:
```
OPENAI_API_KEY=sk-...
CHAT_MODEL=gpt-4o-mini
PORT=8787
```

Built with Vite + React.

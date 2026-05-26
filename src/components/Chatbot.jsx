import { useState, useRef, useEffect } from 'react';

const PROXY = import.meta.env.VITE_CHAT_PROXY || 'http://localhost:8787/chat';

// A generic protocol chatbot. Driven entirely by a protocol definition
// from src/lib/protocols.js — single-phase or two-phase.
export default function Chatbot({ protocol }) {
  const [phase, setPhase] = useState(protocol.start);
  const [log, setLog] = useState(() => freshLog(protocol));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const logEnd = useRef(null);

  // reset when the protocol prop changes (navigating between sub-pages)
  useEffect(() => {
    setPhase(protocol.start);
    setLog(freshLog(protocol));
    setDraft('');
  }, [protocol]);

  useEffect(() => {
    // scroll the page so the latest message sits just above the sticky input
    logEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log, busy]);

  const ph = protocol.phases[phase];
  const isTwoPhase = Object.keys(protocol.phases).length > 1;

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    const nextLog = [...log, { role: 'user', text }];
    setLog(nextLog);
    setBusy(true);

    const messages = [
      { role: 'system', content: ph.system },
      ...nextLog
        .filter((m) => m.role === 'user' || m.role === 'ai')
        .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    ];

    try {
      const r = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await r.json();
      setLog((l) => [...l, { role: 'ai', text: data.reply || data.error || '(no reply)' }]);
    } catch {
      setLog((l) => [
        ...l,
        { role: 'ai', text: '(could not reach the chat proxy — start it with `node server/chat.mjs`)' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function advancePhase() {
    const next = ph.next;
    if (!next) return;
    setPhase(next);
    setLog((l) => [
      ...l,
      { role: 'sys', text: `Switching to ${protocol.phases[next].label}. Nothing is lost — we just change gears.` },
    ]);
  }

  function restart() {
    setPhase(protocol.start);
    setLog(freshLog(protocol));
  }

  return (
    <div className={`chat accent-${protocol.accent}`}>
      <div className="chat-head">
        <span className="hand" style={{ fontSize: '1.4rem' }}>{protocol.name}</span>
        <span className={`phase-pill accent-${protocol.accent}`}>
          {ph.n ? `Phase ${ph.n}: ` : ''}{ph.label}
        </span>
      </div>

      <div className="chat-log">
        {log.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {busy && <div className="msg ai dots-typing">thinking…</div>}
        <div ref={logEnd} />
      </div>

      <div className="chat-actions">
        {isTwoPhase && ph.next ? (
          <button className="go" onClick={advancePhase} disabled={busy}>
            ✓ {protocol.phases[ph.next].label} →
          </button>
        ) : (
          <button onClick={restart} disabled={busy}>↺ Start over</button>
        )}
      </div>

      <div className="chat-input">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Type here, then press Enter to send"
        />
        <button onClick={send} disabled={busy || !draft.trim()}>Send</button>
      </div>
    </div>
  );
}

function freshLog(protocol) {
  const first = protocol.phases[protocol.start];
  return [
    { role: 'sys', text: `${protocol.name} — ${first.n ? `Phase ${first.n}: ` : ''}${first.label}.` },
    { role: 'ai', text: protocol.seed },
  ];
}

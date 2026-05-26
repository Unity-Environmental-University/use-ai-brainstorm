import { useState, useEffect } from 'react';
import Chatbot from './Chatbot.jsx';
import { PROTOCOLS } from '../lib/protocols/index.js';

export default function ProtocolPage({ slug, onBack }) {
  const p = PROTOCOLS[slug];
  const [sheetOpen, setSheetOpen] = useState(false);

  // close the modal on Escape
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  if (!p) return null;
  const isLive = p.status === 'live';

  return (
    <div className="tools-page">
      <div className="protocol-toolbar">
        <button className="crumb" onClick={onBack}>← all tools</button>
        <button
          className={`crumb crumb-action accent-${p.accent}`}
          onClick={() => setSheetOpen(true)}
        >
          ⎘ protocol sheet
        </button>
      </div>

      <header className="tools-head">
        <div className={`kicker accent-text-${p.accent}`}>
          prompting protocol {isLive ? '' : '· running soon'}
        </div>
        <h2>{p.name}</h2>
        <p className="lead">{p.blurb}</p>
      </header>

      {isLive ? (
        <div className="chat-wrap">
          <Chatbot protocol={p} />
        </div>
      ) : (
        <div className="soon-banner">
          The live chatbot for this protocol is still being built. Open the
          protocol sheet — it works in any AI tool today.
        </div>
      )}

      {sheetOpen && (
        <ProtocolSheetModal
          protocol={p}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

// ── modal ────────────────────────────────────────────────────────
function ProtocolSheetModal({ protocol: p, onClose }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(p.paste);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — text is selectable */ }
  }

  function download() {
    const blob = new Blob([`# ${p.name} — protocol sheet\n\n${p.blurb}\n\n${p.paste}\n`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.slug}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal accent-${p.accent}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${p.name} protocol sheet`}
      >
        <header className="modal-head">
          <div>
            <div className={`kicker accent-text-${p.accent}`}>protocol sheet</div>
            <h3>{p.name}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">✕</button>
        </header>

        <div className="modal-actions">
          <button className="paste-btn" onClick={copy}>
            {copied ? '✓ copied' : '⎘ copy'}
          </button>
          <button className="paste-btn" onClick={download}>↓ download .md</button>
        </div>

        <p className="paste-help">
          Open ChatGPT, Claude, Gemini, or whatever you use — paste this in,
          replace the <code>&lt;describe it&gt;</code> bit with your real
          problem, and the protocol is running.
        </p>

        <textarea className="paste-text" readOnly value={p.paste} />

        {p.howto && (
          <details className="modal-howto">
            <summary>How to use this protocol</summary>
            <ol>
              {p.howto.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </details>
        )}
      </div>
    </div>
  );
}

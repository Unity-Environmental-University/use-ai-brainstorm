import { useState } from 'react';
import Chatbot from './Chatbot.jsx';
import { PROTOCOLS } from '../lib/protocols.js';

export default function ProtocolPage({ slug, onBack }) {
  const p = PROTOCOLS[slug];
  if (!p) return null;
  const isLive = p.status === 'live';

  return (
    <div className="tools-page">
      <button className="crumb" onClick={onBack}>← all tools</button>

      <header className="tools-head">
        <div className={`kicker accent-text-${p.accent}`}>
          prompting protocol {isLive ? '' : '· running soon'}
        </div>
        <h2>{p.name}</h2>
        <p className="lead">{p.blurb}</p>
      </header>

      {isLive ? (
        <div className="tools-body">
          <Chatbot protocol={p} />
          <aside className="tools-aside">
            <h3>How to use it</h3>
            <ol>
              {p.howto.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </aside>
        </div>
      ) : (
        <div className="soon-banner">
          The live chatbot for this protocol is still being built. The protocol
          sheet below works in any AI tool today.
        </div>
      )}

      <PasteSheet protocol={p} />
    </div>
  );
}

// The protocol-sheet panel: shown for every protocol, live or soon. Copy or
// download to paste into ChatGPT, Claude, Gemini — whatever the participant uses.
function PasteSheet({ protocol: p }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(p.paste);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked — the textarea is selectable below */
    }
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
    <section className={`paste-sheet accent-${p.accent}`}>
      <header className="paste-head">
        <h3>Protocol sheet — paste into any AI tool</h3>
        <div className="paste-actions">
          <button className="paste-btn" onClick={copy}>
            {copied ? '✓ copied' : '⧉ copy'}
          </button>
          <button className="paste-btn" onClick={download}>↓ download .md</button>
        </div>
      </header>
      <p className="paste-help">
        Open ChatGPT, Claude, Gemini, or whatever you use — paste this in,
        replace the <code>&lt;describe it&gt;</code> bit with your real problem,
        and the protocol is running.
      </p>
      <textarea className="paste-text" readOnly value={p.paste} />
    </section>
  );
}

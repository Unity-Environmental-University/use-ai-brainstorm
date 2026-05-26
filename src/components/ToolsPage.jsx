import { PROTOCOL_LIST } from '../lib/protocols.js';

// Tools index — the landing page. Shows the live protocols only.
export default function ToolsPage({ onOpen }) {
  const live = PROTOCOL_LIST.filter((p) => p.status === 'live');

  return (
    <div className="tools-page">
      <header className="tools-head">
        <div className="kicker">prompting protocols</div>
        <h2>Pick a protocol</h2>
        <p className="lead">
          Each protocol is a small prompting strategy — a way of shaping the
          context so the model stays calm instead of desperate. Open one to run
          it live, or grab the protocol sheet and paste it into any AI tool.
        </p>
      </header>

      <div className="protocol-grid">
        {live.map((p) => (
          <button
            key={p.slug}
            className={`protocol-card accent-${p.accent}`}
            onClick={() => onOpen(p.slug)}
          >
            <h3>{p.name}</h3>
            <p className="card-tagline">{p.tagline}</p>
            <span className="card-go hand">open the tool →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

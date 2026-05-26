import { useState } from 'react';
import ToolsPage from './components/ToolsPage.jsx';
import ProtocolPage from './components/ProtocolPage.jsx';

// Single destination: the protocol picker, with per-protocol sub-pages.
export default function App() {
  // route is 'tools' (landing) or a protocol slug
  const [route, setRoute] = useState('tools');

  return (
    <>
      <header className="topnav">
        <span className="topnav-brand hand">Brainstorm &amp; Decide</span>
        <nav>
          <button
            className={`topnav-link on`}
            onClick={() => setRoute('tools')}
          >
            Protocols
          </button>
        </nav>
      </header>

      <main className="page">
        {route === 'tools'
          ? <ToolsPage onOpen={(slug) => setRoute(slug)} />
          : <ProtocolPage slug={route} onBack={() => setRoute('tools')} />}
      </main>
    </>
  );
}

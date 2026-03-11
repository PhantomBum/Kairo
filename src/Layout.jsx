import React from 'react';

export default function Layout({ children }) {
  React.useEffect(() => {
    const h = (e) => e.preventDefault();
    document.addEventListener('contextmenu', h);
    return () => document.removeEventListener('contextmenu', h);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <style>{`
        :root {
          --bg: #0a0a0a;
          --bg-secondary: #111111;
          --bg-tertiary: #161616;
          --bg-hover: #1a1a1a;
          --bg-active: #1e1e1e;
          --text-primary: #e8e6e1;
          --text-secondary: #8a8880;
          --text-muted: #555550;
          --accent: #e8e6e1;
          --accent-dim: rgba(232,230,225,0.08);
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.1);
        }
        body {
          background-color: var(--bg);
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * { border-color: var(--border); }
        ::selection { background: rgba(232,230,225,0.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
import React from 'react';

export default function Layout({ children }) {
  React.useEffect(() => {
    const h = (e) => e.preventDefault();
    document.addEventListener('contextmenu', h);
    return () => document.removeEventListener('contextmenu', h);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <style>{`
        :root {
          --bg-deep: #050505;
          --bg-base: #0a0a0a;
          --bg-surface: #0f0f0f;
          --bg-elevated: #141414;
          --bg-overlay: #1a1a1a;
          --bg-glass: rgba(255,255,255,0.03);
          --bg-glass-hover: rgba(255,255,255,0.05);
          --bg-glass-active: rgba(255,255,255,0.07);
          --bg-glass-strong: rgba(255,255,255,0.08);
          --text-cream: #e8e4d9;
          --text-primary: #d4d0c5;
          --text-secondary: #8a8778;
          --text-muted: #555248;
          --text-faint: #3a3832;
          --accent: #e8e4d9;
          --accent-glow: rgba(232,228,217,0.06);
          --accent-warm: #c4a882;
          --accent-blue: #7ba4c9;
          --accent-green: #7bc9a4;
          --accent-red: #c97b7b;
          --accent-purple: #a47bc9;
          --accent-amber: #c9b47b;
          --border: rgba(255,255,255,0.04);
          --border-light: rgba(255,255,255,0.07);
          --border-glow: rgba(232,228,217,0.1);
          --glass-blur: 20px;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 20px;
          --radius-full: 9999px;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
          --shadow-md: 0 4px 24px rgba(0,0,0,0.4);
          --shadow-lg: 0 8px 48px rgba(0,0,0,0.5);
          --shadow-glow: 0 0 40px rgba(232,228,217,0.03);
        }
        body {
          background: var(--bg-deep);
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          letter-spacing: -0.01em;
        }
        * { border-color: var(--border); }
        ::selection { background: rgba(232,228,217,0.12); color: var(--text-cream); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .glass { background: var(--bg-glass); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--border); }
        .glass-strong { background: var(--bg-glass-strong); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-light); }
        .glass-hover:hover { background: var(--bg-glass-hover); }
        .glass-active { background: var(--bg-glass-active); }
        .glow-border { box-shadow: inset 0 0 0 1px var(--border-light), var(--shadow-glow); }
        .text-gradient { background: linear-gradient(135deg, var(--text-cream), var(--accent-warm)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
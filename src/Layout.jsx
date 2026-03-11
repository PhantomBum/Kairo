import React from 'react';
import { cssVariables } from '@/components/app/design/tokens';

export default function Layout({ children }) {
  React.useEffect(() => {
    const h = (e) => e.preventDefault();
    document.addEventListener('contextmenu', h);
    return () => document.removeEventListener('contextmenu', h);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--k-bg-base)' }} lang="en">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          ${cssVariables}
        }

        body {
          background: var(--k-bg-base);
          color: var(--k-text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-size: 14px;
          line-height: 1.43;
        }

        * { border-color: var(--k-border); }

        ::selection {
          background: var(--k-accent-muted);
          color: var(--k-text-primary);
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        /* Focus visible for keyboard nav */
        :focus-visible {
          outline: 2px solid var(--k-accent);
          outline-offset: 2px;
        }
        :focus:not(:focus-visible) { outline: none; }

        /* Kairo skeleton shimmer */
        @keyframes k-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .k-shimmer {
          background: linear-gradient(90deg, var(--k-bg-elevated) 25%, var(--k-bg-overlay) 50%, var(--k-bg-elevated) 75%);
          background-size: 200% 100%;
          animation: k-shimmer 1.5s ease-in-out infinite;
        }

        /* Kairo animations */
        @keyframes k-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes k-pulse-ring { 0%, 100% { box-shadow: 0 0 0 0 var(--k-status-online); } 50% { box-shadow: 0 0 0 3px transparent; } }
        @keyframes k-typing-dot { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        @keyframes k-reaction-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        .k-fade-in { animation: k-fade-in 0.25s cubic-bezier(0,0,0.2,1); }
        .k-scale-in { animation: k-scale-in 0.25s cubic-bezier(0,0,0.2,1); }
        .k-pulse-ring { animation: k-pulse-ring 3s ease-in-out infinite; }
        .k-reaction-pop { animation: k-reaction-pop 0.3s cubic-bezier(0,0,0.2,1); }

        /* Word break for long URLs */
        .break-words { word-break: break-word; overflow-wrap: anywhere; }

        /* Legacy utility classes */
        .glass { background: var(--bg-glass); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--border); }
        .glass-strong { background: var(--bg-glass-strong); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-light); }
        .glass-hover:hover { background: var(--bg-glass-hover); }
        .glass-active { background: var(--bg-glass-active); }
        .glow-border { box-shadow: inset 0 0 0 1px var(--border-light), var(--shadow-glow); }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Mobile safe area */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        }
        @media (pointer: coarse) {
          button, a, [role="button"] { min-height: 44px; min-width: 44px; }
        }
        @media (forced-colors: active) {
          * { forced-color-adjust: auto; }
        }
      `}</style>
      {children}
    </div>
  );
}
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

        :root { ${cssVariables} }

        body {
          background: var(--k-bg-base);
          color: var(--k-text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-size: 14px;
          line-height: 1.43;
        }

        * { border-color: var(--k-border); }
        ::selection { background: var(--k-accent-subtle); color: var(--k-text-primary); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        :focus-visible { outline: 2px solid var(--k-accent); outline-offset: 2px; }
        :focus:not(:focus-visible) { outline: none; }

        @keyframes k-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .k-shimmer {
          background: linear-gradient(90deg, var(--k-bg-elevated) 25%, var(--k-bg-overlay) 50%, var(--k-bg-elevated) 75%);
          background-size: 200% 100%; animation: k-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes k-msg-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .k-msg-in { animation: k-msg-in 100ms ease-out both; }
        .k-fade-in { animation: k-fade-in 100ms ease-out; }
        .k-scale-in { animation: k-scale-in 100ms ease-out; }
        .k-channel-fade { animation: k-fade-in 80ms ease-out; }
        .break-words { word-break: break-word; overflow-wrap: anywhere; }

        button, a, [role="button"], [role="tab"], [role="menuitem"] {
          transition: background 100ms ease, color 100ms ease, opacity 100ms ease;
        }
        button:active:not(:disabled), [role="button"]:active:not(:disabled) { transform: scale(0.98); }

        .glass { background: rgba(255,255,255,0.03); border: 1px solid var(--k-border); }
        .glass-hover:hover { background: rgba(255,255,255,0.06); }

        /* Context menus & dropdowns */
        [data-radix-popper-content-wrapper] [role="menu"],
        [data-radix-popper-content-wrapper] [data-radix-menu-content] {
          background: var(--k-bg-float) !important;
          border: none !important;
          border-radius: 4px !important;
          padding: 6px !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.24) !important;
        }
        [data-radix-popper-content-wrapper] [role="menuitem"] {
          border-radius: 2px !important;
          padding: 6px 8px !important;
          font-size: 14px !important;
        }
        [data-radix-popper-content-wrapper] [role="menuitem"]:hover,
        [data-radix-popper-content-wrapper] [role="menuitem"][data-highlighted] {
          background: rgba(88, 101, 242, 0.2) !important;
          color: #fff !important;
        }
        [data-radix-popper-content-wrapper] [role="menuitem"]:active { transform: scale(0.98) !important; }
        [data-radix-popper-content-wrapper] [role="separator"] {
          background: rgba(255,255,255,0.06) !important;
          margin: 4px 6px !important;
        }

        select {
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6d75' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
          padding-right: 30px !important; cursor: pointer;
        }
        select option { background: #1e1f22; color: #f2f3f5; padding: 8px 12px; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;
          }
          button:active:not(:disabled) { transform: none !important; }
          .k-shimmer { animation: none !important; background: var(--k-bg-elevated) !important; }
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) { .safe-bottom { padding-bottom: env(safe-area-inset-bottom); } }
        @media (pointer: coarse) { button, a, [role="button"] { min-height: 44px; min-width: 44px; } }
      `}</style>
      {children}
    </div>
  );
}
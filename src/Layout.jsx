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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root { ${cssVariables} }

        body {
          background: #0a0a0b;
          color: var(--k-text-primary, #ffffff);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        * { border-color: var(--k-border, rgba(255,255,255,0.06)); }
        ::selection { background: var(--accent-dim); color: var(--k-text-primary, #ffffff); }

        /* Scrollbars — minimal Kloak */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        :focus-visible {
          outline: 2px solid var(--k-accent, #2dd4bf);
          outline-offset: 2px;
          border-radius: inherit;
        }
        :focus:not(:focus-visible) { outline: none; }

        @keyframes k-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .k-shimmer {
          background: linear-gradient(90deg, var(--k-bg-elevated) 25%, var(--k-bg-overlay) 50%, var(--k-bg-elevated) 75%);
          background-size: 200% 100%; animation: k-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes k-msg-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .k-msg-in { animation: k-msg-in 150ms ease-out both; }
        @keyframes k-speaking-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,165,93,0.4); } 50% { box-shadow: 0 0 0 4px rgba(59,165,93,0); } }
        .k-speaking-ring { animation: k-speaking-pulse 1.5s ease-in-out infinite; }
        .k-fade-in { animation: k-fade-in 80ms ease-out; }
        @keyframes k-pin-glow { 0% { background: rgba(240,178,50,0.15); } 100% { background: transparent; } }
        .k-pin-highlight { animation: k-pin-glow 2s ease-out forwards; }
        .k-scale-in { animation: k-scale-in 120ms ease-out; }
        @keyframes k-crown-shimmer { 0%, 90% { filter: brightness(1); } 95% { filter: brightness(1.5); } 100% { filter: brightness(1); } }
        .k-crown-shimmer { animation: k-crown-shimmer 30s ease-in-out infinite; }
        .k-channel-fade { animation: k-fade-in 60ms ease-out; }
        .break-words { word-break: break-word; overflow-wrap: anywhere; }
        pre code { white-space: pre; word-break: normal; overflow-wrap: normal; }
        pre { max-width: 100%; overflow-x: auto; }

        button, a, [role="button"], [role="tab"], [role="menuitem"] {
          transition: background 80ms ease, color 80ms ease, opacity 80ms ease;
        }
        button:active:not(:disabled), [role="button"]:active:not(:disabled) { transform: scale(0.98); }

        .glass { background: rgba(255,255,255,0.03); border: 1px solid var(--k-border); }
        .glass-hover:hover { background: rgba(255,255,255,0.06); }

        /* Context menus & dropdowns */
        [data-radix-popper-content-wrapper] [role="menu"],
        [data-radix-popper-content-wrapper] [data-radix-menu-content] {
          background: #111114 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 8px !important;
          padding: 6px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
        }
        [data-radix-popper-content-wrapper] [role="menuitem"] {
          border-radius: 6px !important;
          padding: 7px 10px !important;
          font-size: 13px !important;
        }
        [data-radix-popper-content-wrapper] [role="menuitem"]:hover,
        [data-radix-popper-content-wrapper] [role="menuitem"][data-highlighted] {
          background: rgba(45,212,191,0.12) !important;
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
        select option { background: #18181c; color: #f0eff4; padding: 8px 12px; }

        @media (prefers-reduced-motion: reduce), .reduced-motion {
          *, *::before, *::after {
            animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;
          }
          button:active:not(:disabled) { transform: none !important; }
          .k-shimmer { animation: none !important; background: var(--k-bg-elevated) !important; }
        }
        html.reduced-motion *, html.reduced-motion *::before, html.reduced-motion *::after {
          animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) { .safe-bottom { padding-bottom: env(safe-area-inset-bottom); } }
        @media (pointer: coarse) { button, a, [role="button"] { min-height: 44px; min-width: 44px; } }

        /* Toast positioning — higher to avoid input overlap, 220ms slide */
        [data-sonner-toaster] { bottom: 80px !important; }
        [data-sonner-toast] { font-size: 13px !important; padding: 10px 14px !important; animation-duration: 220ms !important; }

        /* Mobile viewport fix for Android keyboard */
        @supports (height: 100dvh) { .h-screen-safe { height: 100dvh; } }
      `}</style>
      {children}
    </div>
  );
}
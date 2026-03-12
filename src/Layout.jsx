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
          text-rendering: optimizeLegibility;
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
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        :focus-visible {
          outline: 2px solid var(--k-accent);
          outline-offset: 2px;
        }
        :focus:not(:focus-visible) { outline: none; }

        /* Shimmer loading */
        @keyframes k-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .k-shimmer {
          background: linear-gradient(90deg, var(--k-bg-elevated) 25%, var(--k-bg-overlay) 50%, var(--k-bg-elevated) 75%);
          background-size: 200% 100%;
          animation: k-shimmer 1.5s ease-in-out infinite;
        }

        /* Animations */
        @keyframes k-msg-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-msg-delete { to { opacity: 0; max-height: 0; padding: 0; margin: 0; overflow: hidden; } }
        @keyframes k-reaction-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes k-count-tick { 0% { transform: translateY(0); opacity: 1; } 40% { transform: translateY(-3px); opacity: 0; } 60% { transform: translateY(3px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes k-typing-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }
        @keyframes k-fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes k-slide-in-right { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes k-slide-out-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(12px); } }
        @keyframes k-dot-in { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes k-dot-out { from { transform: scale(1); } to { transform: scale(0); } }
        @keyframes k-speaking-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,165,93,0.35); } 50% { box-shadow: 0 0 0 3px rgba(59,165,93,0.12); } }
        @keyframes k-speak-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes k-toast-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes k-toast-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
        @keyframes k-bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.1); } 80% { transform: scale(0.97); } 100% { transform: scale(1); } }

        .k-msg-in { animation: k-msg-in 120ms ease-out both; }
        .k-msg-delete { animation: k-msg-delete 180ms ease forwards; }
        .k-fade-in { animation: k-fade-in 120ms ease-out; }
        .k-scale-in { animation: k-scale-in 120ms ease-out; }
        .k-slide-in-right { animation: k-slide-in-right 250ms ease-out; }
        .k-slide-out-right { animation: k-slide-out-right 180ms ease; }
        .k-reaction-pop { animation: k-reaction-pop 180ms ease-out; }
        .k-count-tick { animation: k-count-tick 80ms ease; }
        .k-dot-in { animation: k-dot-in 180ms ease-out; }
        .k-dot-out { animation: k-dot-out 120ms ease; }
        .k-speaking-ring { animation: k-speaking-ring 1.5s ease-in-out infinite; }
        .k-speak-in { animation: k-speak-in 80ms ease-out; }
        .k-toast-in { animation: k-toast-in 250ms ease-out; }
        .k-toast-out { animation: k-toast-out 180ms ease; }
        .k-bounce-in { animation: k-bounce-in 400ms ease-out; }

        .break-words { word-break: break-word; overflow-wrap: anywhere; }

        /* Interactive element transitions */
        button, a, [role="button"], [role="tab"], [role="menuitem"] {
          transition: background 80ms ease, color 80ms ease, opacity 80ms ease, border-color 80ms ease, box-shadow 80ms ease;
        }
        button:active:not(:disabled), [role="button"]:active:not(:disabled), [role="tab"]:active {
          transform: scale(0.98);
        }

        .k-panel-slide { transition: transform 180ms ease-out, opacity 180ms ease-out; }
        .k-channel-fade { animation: k-fade-in 120ms ease-out; }

        /* Glass utilities */
        .glass { background: var(--bg-glass); border: 1px solid var(--k-border); }
        .glass-strong { background: var(--bg-glass-strong); border: 1px solid var(--k-border-light); }
        .glass-hover:hover { background: var(--bg-glass-hover); }
        .glass-active { background: var(--k-accent-subtle); border-color: rgba(108,122,219,0.25); }

        /* Context menus */
        [data-radix-popper-content-wrapper] [role="menu"],
        [data-radix-popper-content-wrapper] [data-radix-menu-content] {
          background: #111214 !important;
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
        [data-radix-popper-content-wrapper] [role="menuitem"]:active {
          transform: scale(0.98) !important;
        }
        [data-radix-popper-content-wrapper] [role="separator"] {
          background: rgba(255,255,255,0.06) !important;
          margin: 4px 6px !important;
        }

        .k-rotate-hover { transition: transform 180ms ease-out; }
        .k-rotate-hover:hover { transform: rotate(90deg); }
        .k-rotate-hover:active { transform: rotate(90deg) scale(0.92); }

        /* Select dropdowns */
        select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6d75' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px !important;
          cursor: pointer;
        }
        select option {
          background: #1e1f22;
          color: #f2f3f5;
          padding: 8px 12px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          button:active:not(:disabled), [role="button"]:active:not(:disabled), [role="tab"]:active {
            transform: none !important;
          }
          .k-shimmer { animation: none !important; background: var(--k-bg-elevated) !important; }
        }

        /* Mobile */
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
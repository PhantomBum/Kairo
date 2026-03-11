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

        /* KAIRO V2 — Purpose-driven animation system */
        /* Enter: cubic-bezier(0,0,0.2,1) | Exit: cubic-bezier(0.4,0,1,1) | State: cubic-bezier(0.4,0,0.2,1) */

        /* Messages */
        @keyframes k-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-msg-delete { to { opacity: 0; max-height: 0; padding: 0; margin: 0; overflow: hidden; } }

        /* Reactions */
        @keyframes k-reaction-pop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes k-count-tick { 0% { transform: translateY(0); opacity: 1; } 40% { transform: translateY(-4px); opacity: 0; } 60% { transform: translateY(4px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

        /* Typing */
        @keyframes k-typing-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }

        /* UI elements */
        @keyframes k-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes k-scale-in { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
        @keyframes k-slide-in-right { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes k-slide-out-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(16px); } }

        /* Unread dot */
        @keyframes k-dot-in { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes k-dot-out { from { transform: scale(1); } to { transform: scale(0); } }

        /* Voice */
        @keyframes k-speaking-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(35,165,90,0.4); } 50% { box-shadow: 0 0 0 3px rgba(35,165,90,0.15); } }
        @keyframes k-speak-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

        /* Toast */
        @keyframes k-toast-in { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes k-toast-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }

        /* Celebrate */
        @keyframes k-bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 80% { transform: scale(0.95); } 100% { transform: scale(1); } }

        /* Utility classes */
        .k-msg-in { animation: k-msg-in 150ms cubic-bezier(0,0,0.2,1) both; }
        .k-msg-delete { animation: k-msg-delete 200ms cubic-bezier(0.4,0,0.2,1) forwards; }
        .k-fade-in { animation: k-fade-in 150ms cubic-bezier(0,0,0.2,1); }
        .k-scale-in { animation: k-scale-in 150ms cubic-bezier(0,0,0.2,1); }
        .k-slide-in-right { animation: k-slide-in-right 300ms cubic-bezier(0,0,0.2,1); }
        .k-slide-out-right { animation: k-slide-out-right 200ms cubic-bezier(0.4,0,1,1); }
        .k-reaction-pop { animation: k-reaction-pop 200ms cubic-bezier(0,0,0.2,1); }
        .k-count-tick { animation: k-count-tick 100ms cubic-bezier(0.4,0,0.2,1); }
        .k-dot-in { animation: k-dot-in 200ms cubic-bezier(0,0,0.2,1); }
        .k-dot-out { animation: k-dot-out 150ms cubic-bezier(0.4,0,1,1); }
        .k-speaking-ring { animation: k-speaking-ring 1.5s ease-in-out infinite; }
        .k-speak-in { animation: k-speak-in 100ms cubic-bezier(0,0,0.2,1); }
        .k-toast-in { animation: k-toast-in 300ms cubic-bezier(0,0,0.2,1); }
        .k-toast-out { animation: k-toast-out 200ms cubic-bezier(0.4,0,1,1); }
        .k-bounce-in { animation: k-bounce-in 500ms cubic-bezier(0,0,0.2,1); }

        /* Word break for long URLs */
        .break-words { word-break: break-word; overflow-wrap: anywhere; }

        /* Unified interactive element transitions */
        button, a, [role="button"], [role="tab"], [role="menuitem"] {
          transition: background 0.15s ease-out, color 0.15s ease-out, opacity 0.15s ease-out, transform 80ms ease-out, border-color 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        button:active:not(:disabled), [role="button"]:active:not(:disabled), [role="tab"]:active {
          transform: scale(0.98);
        }

        /* Sidebar panel slide */
        .k-panel-slide { transition: transform 0.2s cubic-bezier(0,0,0.2,1), opacity 0.2s cubic-bezier(0,0,0.2,1); }

        /* Channel switch fade */
        .k-channel-fade { animation: k-fade-in 80ms cubic-bezier(0,0,0.2,1); }

        /* Legacy utility classes */
        .glass { background: var(--bg-glass); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--border); }
        .glass-strong { background: var(--bg-glass-strong); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-light); }
        .glass-hover:hover { background: var(--bg-glass-hover); }
        .glass-active { background: var(--bg-glass-active); }
        .glow-border { box-shadow: inset 0 0 0 1px var(--border-light), var(--shadow-glow); }

        /* Reduced motion — comprehensive disable */
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
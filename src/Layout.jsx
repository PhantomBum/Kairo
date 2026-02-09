import React from 'react';

export default function Layout({ children }) {
  // Disable browser right-click menu
  React.useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <style>{`
        :root {
            --background: 0 0% 5%;
            --foreground: 0 0% 95%;
            --card: 0 0% 7%;
            --card-foreground: 0 0% 95%;
            --popover: 0 0% 8%;
            --popover-foreground: 0 0% 95%;
            --primary: 0 0% 95%;
            --primary-foreground: 0 0% 5%;
            --secondary: 0 0% 10%;
            --secondary-foreground: 0 0% 95%;
            --muted: 0 0% 10%;
            --muted-foreground: 0 0% 45%;
            --accent: 0 0% 10%;
            --accent-foreground: 0 0% 95%;
            --destructive: 0 84% 60%;
            --destructive-foreground: 0 0% 98%;
            --border: 0 0% 14%;
            --input: 0 0% 10%;
            --ring: 0 0% 40%;
          }

        * {
          border-color: hsl(var(--border));
        }

        body {
          background-color: #09090b;
          color: hsl(var(--foreground));
          font-feature-settings: "rlig" 1, "calt" 1;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        /* Selection color */
        ::selection {
          background: rgba(139, 92, 246, 0.3);
        }

        /* Focus ring */
        *:focus-visible {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }

        /* Smooth transitions - optimized */
        * {
          transition-property: color, background-color, border-color, opacity, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 120ms;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Remove transitions for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          html {
            scroll-behavior: auto;
          }
        }

        /* Performance optimizations */
        .scroll-smooth {
          scroll-behavior: smooth;
        }

        /* Hardware acceleration for animations */
        .will-change-transform {
          will-change: transform;
        }

        /* Improved text rendering */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Kairo Motion System - Focus-based animations */
        @keyframes kairoFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes kairoFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }

        @keyframes kairoSlideUp {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes kairoSlideDown {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes kairoGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          50% { box-shadow: 0 0 12px 2px rgba(16, 185, 129, 0.15); }
        }

        @keyframes kairoConfirm {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        /* Focus-based dropdown animations */
        [data-radix-popper-content-wrapper] > * {
          animation: kairoSlideUp 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform-origin: var(--radix-popper-transform-origin, top center);
        }
        
        [data-radix-popper-content-wrapper] > *[data-state=closed] {
          animation: kairoFadeOut 120ms ease-in !important;
        }

        [data-side="top"] [data-radix-popper-content-wrapper] > * {
          animation: kairoSlideDown 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        /* Context menu origin animation */
        [data-radix-menu-content] {
          transform-origin: var(--radix-context-menu-content-transform-origin, top left);
        }

        /* Override tailwind animate classes with Kairo motion */
        .animate-in {
          animation: kairoSlideUp 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        
        .animate-out {
          animation: kairoFadeOut 120ms ease-in !important;
        }

        /* Kairo focus states */
        .kairo-focus {
          transition: box-shadow 200ms ease, border-color 200ms ease;
        }
        
        .kairo-focus:focus-within {
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.4);
        }

        /* Soft confirmation animation */
        .kairo-confirm {
          animation: kairoConfirm 200ms ease;
        }

        /* Live sync indicator pulse */
        .kairo-sync {
          animation: kairoGlow 2s ease-in-out infinite;
        }

        /* Hover preview transitions */
        .kairo-preview {
          transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
          transform-origin: center bottom;
        }

        /* Stagger children animations */
        .kairo-stagger > * {
          animation: kairoSlideUp 180ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .kairo-stagger > *:nth-child(1) { animation-delay: 0ms; }
        .kairo-stagger > *:nth-child(2) { animation-delay: 30ms; }
        .kairo-stagger > *:nth-child(3) { animation-delay: 60ms; }
        .kairo-stagger > *:nth-child(4) { animation-delay: 90ms; }
        .kairo-stagger > *:nth-child(5) { animation-delay: 120ms; }

        /* Smooth slide animations */
        .slide-in-from-top-2,
        .slide-in-from-bottom-2,
        .slide-in-from-left-2,
        .slide-in-from-right-2 {
          --tw-enter-translate-x: 0 !important;
          --tw-enter-translate-y: 0 !important;
        }
        
        /* Subtle zoom for modals */
        .zoom-in-95 {
          --tw-enter-scale: 0.97 !important;
        }
        .zoom-out-95 {
          --tw-exit-scale: 0.97 !important;
        }

        /* Performance: reduce motion */
        @media (prefers-reduced-motion: reduce) {
          [data-radix-popper-content-wrapper] > *,
          .animate-in,
          .kairo-stagger > * {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
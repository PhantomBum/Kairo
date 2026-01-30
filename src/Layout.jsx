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
    <div className="min-h-screen bg-[#0a0a0b]">
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --card: 0 0% 7%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 7%;
          --popover-foreground: 0 0% 98%;
          --primary: 239 84% 67%;
          --primary-foreground: 0 0% 98%;
          --secondary: 0 0% 15%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 64%;
          --accent: 0 0% 15%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 15%;
          --input: 0 0% 15%;
          --ring: 239 84% 67%;
        }

        * {
          border-color: hsl(var(--border));
        }

        body {
          background-color: #0a0a0b;
          color: hsl(var(--foreground));
          font-feature-settings: "rlig" 1, "calt" 1;
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
          background: rgba(99, 102, 241, 0.3);
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

        /* Override Radix UI slide animations - use fade only */
        [data-state=open] {
          animation: fadeIn 150ms ease-out !important;
        }
        
        [data-state=closed] {
          animation: fadeOut 100ms ease-in !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        /* Disable all slide-in animations from tailwind */
        .animate-in {
          animation: fadeIn 150ms ease-out !important;
        }
        
        .animate-out {
          animation: fadeOut 100ms ease-in !important;
        }
      `}</style>
      {children}
    </div>
  );
}
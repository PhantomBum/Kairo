import React from 'react';
import { ArrowLeft, Crown, Heart } from 'lucide-react';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb',
  muted: '#68677a', border: '#33333d',
};

const NAV = [
  { label: 'Discover', href: '/Discover' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/Pricing' },
  { label: 'Elite', href: '/Elite' },
  { label: 'FAQ', href: '/FAQ' },
  { label: 'Support', href: '/Support' },
];

export default function PageShell({ title, children, showBack = true }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-30" style={{ background: 'rgba(24,24,28,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <a href="/" className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <ArrowLeft className="w-4 h-4" style={{ color: C.muted }} />
              </a>
            )}
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-[16px] font-bold" style={{ color: C.text }}>Kairo</span>
            </a>
            {title && (
              <>
                <div className="w-px h-4" style={{ background: C.border }} />
                <span className="text-[13px] font-medium" style={{ color: C.muted }}>{title}</span>
              </>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(l => (
              <a key={l.label} href={l.href} className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                style={{ color: C.textSec }}>{l.label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-10 md:py-16 w-full">{children}</main>

      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span className="text-[14px] font-bold">Kairo</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: C.muted }}>A better place to talk.</p>
            </div>
            {[
              { title: 'Product', links: [['App', '/'], ['Elite', '/Elite'], ['Changelog', '/Changelog'], ['Status', '/Status']] },
              { title: 'Developers', links: [['Developer Portal', '/Developers'], ['Bot Marketplace', '/BotMarketplace']] },
              { title: 'Support', links: [['FAQ', '/FAQ'], ['Help Center', '/Support'], ['About', '/About']] },
              { title: 'Legal', links: [['Terms of Service', '/Support?tab=terms'], ['Privacy Policy', '/Support?tab=privacy'], ['Guidelines', '/Support?tab=guidelines']] },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: C.muted }}>{s.title}</p>
                <div className="space-y-2">
                  {s.links.map(([label, href], j) => (
                    <a key={j} href={href} className="block text-[12px] hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.7 }}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[11px]" style={{ color: C.muted }}>© 2026 Kairo. All rights reserved.</p>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
              Made with <Heart className="w-3 h-3 mx-0.5" style={{ color: '#ed4245' }} /> by the Kairo team
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

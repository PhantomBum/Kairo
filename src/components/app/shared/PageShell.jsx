import React from 'react';
import { ArrowLeft, Crown, Heart } from 'lucide-react';
import { colors, typography } from '@/components/app/design/tokens';

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
    <div className="min-h-screen flex flex-col" style={{ background: colors.bg.base, color: colors.text.primary, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-30" style={{ background: colors.bg.base, backdropFilter: 'blur(20px) saturate(180%)', borderBottom: `1px solid ${colors.border.subtle}`, height: 64 }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between" style={{ paddingLeft: 24, paddingRight: 24, height: 64 }}>
          <div className="flex items-center gap-3">
            {showBack && (
              <a href="/" className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]">
                <ArrowLeft className="w-4 h-4" style={{ color: colors.text.muted }} />
              </a>
            )}
            <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.accent.primary }}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontSize: typography.bodyLg.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Kairo</span>
            </a>
            {title && (
              <>
                <div className="w-px h-4" style={{ background: colors.border.subtle }} />
                <span style={{ fontSize: typography.compact.size, fontWeight: typography.weight.medium, color: colors.text.muted }}>{title}</span>
              </>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(l => (
              <a key={l.label} href={l.href} className="px-3 py-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]"
                style={{ fontSize: typography.compact.size, fontWeight: typography.weight.medium, color: colors.text.secondary }}>{l.label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto w-full py-8 md:py-16" style={{ paddingLeft: 24, paddingRight: 24 }}>{children}</main>

      <footer style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        <div className="max-w-[1200px] mx-auto py-10" style={{ paddingLeft: 24, paddingRight: 24 }}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: colors.accent.primary }}>
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span style={{ fontSize: typography.base.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Kairo</span>
              </div>
              <p style={{ fontSize: typography.sm.size, lineHeight: 1.6, color: colors.text.muted }}>A better place to talk.</p>
            </div>
            {[
              { title: 'Product', links: [['App', '/'], ['Elite', '/Elite'], ['Changelog', '/Changelog'], ['Status', '/Status']] },
              { title: 'Developers', links: [['Developer Portal', '/Developers'], ['Bot Marketplace', '/BotMarketplace']] },
              { title: 'Support', links: [['FAQ', '/FAQ'], ['Help Center', '/Support'], ['About', '/About']] },
              { title: 'Legal', links: [['Terms of Service', '/Support?tab=terms'], ['Privacy Policy', '/Support?tab=privacy'], ['Guidelines', '/Support?tab=guidelines']] },
            ].map((s, i) => (
              <div key={i}>
                <p className="mb-3" style={{ fontSize: typography.caption.size, fontWeight: typography.weight.bold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>{s.title}</p>
                <div className="space-y-2">
                  {s.links.map(([label, href], j) => (
                    <a key={j} href={href} className="block transition-opacity hover:opacity-100" style={{ fontSize: typography.sm.size, color: colors.text.secondary, opacity: 0.7 }}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
            <p style={{ fontSize: typography.caption.size, color: colors.text.muted }}>© 2026 Kairo. All rights reserved.</p>
            <div className="flex items-center gap-1" style={{ fontSize: typography.caption.size, color: colors.text.muted }}>
              Made with <Heart className="w-3 h-3 mx-0.5" style={{ color: colors.danger }} /> by the Kairo team
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

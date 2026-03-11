import React from 'react';
import { ArrowLeft, HelpCircle, Crown, MessageSquare, Bot, FileQuestion } from 'lucide-react';
import { createPageUrl } from '@/utils';

const NAV_LINKS = [
  { label: 'FAQ', href: createPageUrl('FAQ'), icon: FileQuestion },
  { label: 'Elite', href: createPageUrl('Elite'), icon: Crown },
  { label: 'Support', href: createPageUrl('Support'), icon: MessageSquare },
  { label: 'Bots', href: createPageUrl('BotMarketplace'), icon: Bot },
  { label: 'Developers', href: createPageUrl('Developers'), icon: HelpCircle },
];

export default function PageShell({ title, children, showBack = true }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep, #050505)', color: 'var(--text-primary, #d4d0c5)' }}>
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border, rgba(255,255,255,0.04))' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <a href={createPageUrl('Kairo')} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-muted, #555248)' }} />
              </a>
            )}
            <a href={createPageUrl('Kairo')} className="text-lg font-bold" style={{ color: 'var(--text-cream, #e8e4d9)', fontFamily: 'monospace' }}>Kairo</a>
            {title && <><div className="w-px h-4" style={{ background: 'var(--border-light, rgba(255,255,255,0.07))' }} /><span className="text-sm font-medium" style={{ color: 'var(--text-secondary, #8a8778)' }}>{title}</span></>}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: 'var(--text-secondary, #8a8778)' }}>{l.label}</a>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</main>
      <footer style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.04))' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--text-muted, #555248)', fontFamily: 'monospace' }}>Product</h4>
              <div className="space-y-2">
                <a href={createPageUrl('Kairo')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>App</a>
                <a href={createPageUrl('Elite')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Elite</a>
                <a href={createPageUrl('BotMarketplace')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Bot Marketplace</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--text-muted, #555248)', fontFamily: 'monospace' }}>Developers</h4>
              <div className="space-y-2">
                <a href={createPageUrl('Developers')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Developer Portal</a>
                <a href={createPageUrl('BotMarketplace')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Bot Marketplace</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--text-muted, #555248)', fontFamily: 'monospace' }}>Support</h4>
              <div className="space-y-2">
                <a href={createPageUrl('FAQ')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>FAQ</a>
                <a href={createPageUrl('Support')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Help Center</a>
                <a href={createPageUrl('Status')} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>System Status</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--text-muted, #555248)', fontFamily: 'monospace' }}>Legal</h4>
              <div className="space-y-2">
                <a href={createPageUrl('Support') + '?tab=terms'} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Terms of Service</a>
                <a href={createPageUrl('Support') + '?tab=privacy'} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Privacy Policy</a>
                <a href={createPageUrl('Support') + '?tab=guidelines'} className="block text-[12px] hover:underline" style={{ color: 'var(--text-secondary, #8a8778)' }}>Community Guidelines</a>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px]" style={{ color: 'var(--text-faint, #3a3832)' }}>© {new Date().getFullYear()} Kairo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
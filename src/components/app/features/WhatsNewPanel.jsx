import React from 'react';
import { X, Sparkles, Zap, Shield, Palette, MessageSquare } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf',
};

const UPDATES = [
  {
    icon: Sparkles, color: '#faa61a', date: 'Mar 2026',
    title: 'Kairo Wrapped',
    desc: 'View your yearly stats and share with friends.',
  },
  {
    icon: Zap, color: P.accent, date: 'Feb 2026',
    title: 'Server Folders & Drag Reorder',
    desc: 'Organize your servers into folders. Drag to reorder.',
  },
  {
    icon: Shield, color: '#3ba55c', date: 'Feb 2026',
    title: 'Advanced Moderation',
    desc: 'New mod panel with auto-mod rules, audit log, and warnings.',
  },
  {
    icon: Palette, color: '#eb459e', date: 'Jan 2026',
    title: 'Theme Marketplace',
    desc: 'Browse and apply community-made themes.',
  },
  {
    icon: MessageSquare, color: '#00AFF4', date: 'Jan 2026',
    title: 'Scheduled Messages',
    desc: 'Write now, send later. Schedule messages for any channel.',
  },
];

export default function WhatsNewPanel({ onClose, placement = 'default' }) {
  const isRailPlacement = placement === 'rail';

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`${isRailPlacement ? 'fixed left-[80px] bottom-4' : 'absolute left-[62px] bottom-0'} w-[320px] rounded-xl z-50 k-fade-in overflow-hidden`}
        style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>

        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div>
            <h3 className="text-[14px] font-bold" style={{ color: P.textPrimary }}>What's New</h3>
            <p className="text-[11px] mt-0.5" style={{ color: P.muted }}>Latest Kairo updates</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
            <X className="w-4 h-4" style={{ color: P.muted }} />
          </button>
        </div>

        <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto scrollbar-none">
          {UPDATES.map((u, i) => (
            <div key={i} className="flex gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${u.color}18` }}>
                <u.icon className="w-4 h-4" style={{ color: u.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{u.title}</span>
                  <span className="text-[11px] font-medium flex-shrink-0" style={{ color: P.muted }}>{u.date}</span>
                </div>
                <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: P.textSecondary }}>{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

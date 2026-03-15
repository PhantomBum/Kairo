import React, { useEffect } from 'react';
import { Crown, Sparkles, Shield, Zap, Bug, Star } from 'lucide-react';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d', danger: '#ed4245', warning: '#faa81a',
};

const ENTRIES = [
  {
    version: '1.8.0', date: 'March 14, 2025', tag: 'new', icon: Sparkles,
    changes: [
      'Complete landing page redesign with hero, features, pricing, and community stats',
      'New registration flow with three sign-up methods: Email, Secret Key, and Google OAuth',
      'Secret Key accounts — sign up with zero personal information',
      'Five-step onboarding: username, avatar, interests, first server, PWA install',
      'New login page with three methods and forgot password flow',
      'Confetti celebration animation on successful signup',
    ],
  },
  {
    version: '1.7.0', date: 'March 12, 2025', tag: 'security', icon: Shield,
    changes: [
      'Client-side and server-side rate limiting for login, messages, uploads, and friend requests',
      'Input sanitization across the entire app — XSS prevention everywhere',
      'File upload validation with magic byte checking',
      'Two-Factor Authentication with TOTP (Google Authenticator, Authy)',
      'Session management — view and revoke active sessions',
      'Emergency account lock feature',
      'Comprehensive Supabase RLS policy overhaul',
    ],
  },
  {
    version: '1.6.0', date: 'March 10, 2025', tag: 'performance', icon: Zap,
    changes: [
      'Virtualized message list — only visible messages rendered in DOM',
      'Channel switching under 200ms with intelligent caching',
      'Code splitting by route — lazy loading for 20+ heavy components',
      'Image lazy loading with IntersectionObserver and shimmer placeholders',
      'Memory leak fixes in VideoPlayer, ServerRailIcon, and ConnectionBanner',
      'Branded skeleton screen for app startup',
      'React.memo and useMemo optimizations across member list and profile provider',
    ],
  },
  {
    version: '1.5.0', date: 'March 8, 2025', tag: 'feature', icon: Star,
    changes: [
      'Mobile responsiveness overhaul — full touch support, gesture navigation',
      'Profile effects system with 16 unique animated effects',
      'Server boosting with tier rewards',
      'Server shop for custom decorations and credits',
      'Notification center with real-time alerts',
      'Global search across messages, users, and servers',
    ],
  },
  {
    version: '1.4.0', date: 'March 5, 2025', tag: 'feature', icon: Star,
    changes: [
      'Direct messages and friends system',
      'Voice and video calls with screen sharing',
      'Bot system with developer portal and marketplace',
      'Kairo Spaces — public communities and blogs',
      'Forum, announcement, and stage channel types',
    ],
  },
  {
    version: '1.3.0', date: 'March 1, 2025', tag: 'feature', icon: Star,
    changes: [
      'Kairo Elite subscription with Stripe integration',
      'Badge system with 12+ collectible badges',
      'Profile themes and custom backgrounds',
      'Message pinning, starring, and forwarding',
      'Emoji picker with custom server emoji support',
    ],
  },
  {
    version: '1.2.0', date: 'February 25, 2025', tag: 'improvement', icon: Zap,
    changes: [
      'Complete UI/UX rework with new Kloak-inspired design system',
      'Server roles and permissions system',
      'Channel categories with drag-and-drop reordering',
      'Rich message formatting with markdown support',
      'File uploads in chat with preview',
    ],
  },
  {
    version: '1.1.0', date: 'February 20, 2025', tag: 'bugfix', icon: Bug,
    changes: [
      'Fixed real-time message delivery issues',
      'Improved auth flow reliability',
      'Server icon upload and display fixes',
      'Mobile layout improvements',
    ],
  },
  {
    version: '1.0.0', date: 'February 15, 2025', tag: 'new', icon: Crown,
    changes: [
      'Initial release of Kairo',
      'Server creation and management',
      'Text channels with real-time messaging',
      'User profiles with avatars and bios',
      'Basic role system',
    ],
  },
];

const TAG_COLORS = {
  new: C.accent,
  feature: C.success,
  improvement: C.warning,
  bugfix: C.danger,
  security: '#a78bfa',
  performance: '#38bdf8',
};

const TAG_LABELS = {
  new: 'New',
  feature: 'Feature',
  improvement: 'Improvement',
  bugfix: 'Bug Fix',
  security: 'Security',
  performance: 'Performance',
};

export default function Changelog() {
  useEffect(() => {
    try { localStorage.setItem('kairo-changelog-seen', ENTRIES[0].version); } catch {}
  }, []);

  return (
    <PageShell title="Changelog">
      <div className="max-w-[680px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-3" style={{ color: C.text }}>Changelog</h1>
          <p className="text-[16px]" style={{ color: C.muted }}>What's new in Kairo — in plain language</p>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: C.border }} />

          {ENTRIES.map((entry, i) => {
            const tagColor = TAG_COLORS[entry.tag] || C.accent;
            return (
              <div key={entry.version} className="relative pl-12 pb-10">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center z-10"
                  style={{ background: `${tagColor}15`, border: `1px solid ${tagColor}30` }}>
                  <entry.icon className="w-5 h-5" style={{ color: tagColor }} />
                </div>

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-[18px] font-extrabold" style={{ color: C.text }}>v{entry.version}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    style={{ background: `${tagColor}15`, color: tagColor }}>
                    {TAG_LABELS[entry.tag]}
                  </span>
                  <span className="text-[13px]" style={{ color: C.muted }}>{entry.date}</span>
                  {i === 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: `${C.success}15`, color: C.success }}>Latest</span>}
                </div>

                <ul className="space-y-2">
                  {entry.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ color: C.textSec }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: tagColor }} />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

export function ChangelogModal({ onClose }) {
  const latest = ENTRIES.slice(0, 3);

  useEffect(() => {
    try { localStorage.setItem('kairo-changelog-seen', ENTRIES[0].version); } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-[520px] max-h-[80vh] rounded-2xl overflow-y-auto flex flex-col"
        style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h2 className="text-[18px] font-bold" style={{ color: C.text }}>What's New</h2>
            <p className="text-[13px]" style={{ color: C.muted }}>Recent updates to Kairo</p>
          </div>
          <button onClick={onClose} className="text-[13px] font-semibold hover:underline" style={{ color: C.accent }}>Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {latest.map(entry => {
            const tagColor = TAG_COLORS[entry.tag] || C.accent;
            return (
              <div key={entry.version}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-[16px] font-bold" style={{ color: C.text }}>v{entry.version}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: `${tagColor}15`, color: tagColor }}>
                    {TAG_LABELS[entry.tag]}
                  </span>
                  <span className="text-[12px]" style={{ color: C.muted }}>{entry.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {entry.changes.map((c, j) => (
                    <li key={j} className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: C.textSec }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: tagColor }} /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="p-4 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
          <a href="/Changelog" className="text-[13px] font-semibold hover:underline" style={{ color: C.accent }}>View full changelog</a>
        </div>
      </div>
    </div>
  );
}

export function useChangelogUnread() {
  try {
    const seen = localStorage.getItem('kairo-changelog-seen');
    return seen !== ENTRIES[0].version;
  } catch { return false; }
}

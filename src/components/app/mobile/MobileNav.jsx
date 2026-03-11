import React from 'react';
import { Home, MessageSquare, Compass, Bell, User } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const tabs = [
  { id: 'servers', icon: Home, label: 'Servers' },
  { id: 'dms', icon: MessageSquare, label: 'DMs' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function MobileNav({ active, onChange, badge }) {
  return (
    <nav className="flex items-center justify-around h-14 flex-shrink-0 md:hidden safe-bottom relative z-50"
      style={{ background: colors.bg.base, borderTop: `1px solid ${colors.border.default}` }}
      role="tablist" aria-label="Main navigation">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 relative"
            role="tab" aria-selected={isActive} aria-label={t.label}
            style={{ minWidth: 48, minHeight: 44 }}>
            <div className="relative">
              <Icon className="w-5 h-5" style={{ color: isActive ? colors.text.primary : colors.text.muted }} />
              {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: colors.accent.primary }} />}
            </div>
            <span className="text-[10px] font-medium" style={{ color: isActive ? colors.text.primary : colors.text.disabled }}>{t.label}</span>
            {t.id === 'notifications' && badge > 0 && (
              <div className="absolute top-0.5 right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: colors.danger, color: '#fff' }}>{badge > 9 ? '9+' : badge}</div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
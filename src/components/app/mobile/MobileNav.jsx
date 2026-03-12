import React from 'react';
import { Home, MessageSquare, Compass, User } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const tabs = [
  { id: 'servers', icon: Home, label: 'Servers' },
  { id: 'dms', icon: MessageSquare, label: 'DMs' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'profile', icon: User, label: 'You' },
];

export default function MobileNav({ active, onChange, badge }) {
  return (
    <nav className="flex items-center justify-around h-[52px] flex-shrink-0 md:hidden safe-bottom relative z-50"
      style={{ background: colors.bg.base, borderTop: `1px solid rgba(255,255,255,0.04)` }}
      role="tablist" aria-label="Main navigation">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 relative"
            role="tab" aria-selected={isActive} aria-label={t.label}
            style={{ minHeight: 44 }}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? colors.text.primary : colors.text.disabled }} />
            <span className="text-[9px] font-medium" style={{ color: isActive ? colors.text.secondary : colors.text.disabled }}>{t.label}</span>
            {t.id === 'dms' && badge > 0 && (
              <div className="absolute top-0.5 right-[calc(50%-16px)] min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: colors.danger, color: '#fff' }}>{badge > 9 ? '9+' : badge}</div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
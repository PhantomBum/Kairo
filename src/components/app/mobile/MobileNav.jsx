import React from 'react';
import { Home, LayoutGrid, MessageSquare, User } from 'lucide-react';

const P = {
  bg: '#161f2c', accent: '#2dd4bf',
  active: '#f0eff4', inactive: '#68677a',
};

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'servers', icon: LayoutGrid, label: 'Servers' },
  { id: 'dms', icon: MessageSquare, label: 'DMs' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function MobileNav({ active, onChange, badge = 0, avatar }) {
  return (
    <nav className="flex items-center justify-around flex-shrink-0 md:hidden relative z-50"
      style={{
        height: 56,
        background: P.bg,
        borderTop: '1px solid #33333d',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
      }}
      role="tablist" aria-label="Main navigation">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        const showBadge = t.id === 'dms' && badge > 0;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 relative"
            role="tab" aria-selected={isActive} aria-label={t.label}
            style={{ minHeight: 48, minWidth: 48, WebkitTapHighlightColor: 'transparent' }}>
            <div className="relative">
              {t.id === 'profile' && avatar ? (
                <div className="w-[22px] h-[22px] rounded-full overflow-hidden" style={{
                  border: isActive ? `2px solid ${P.accent}` : '2px solid transparent',
                }}>
                  <img src={avatar} className="w-full h-full object-cover" alt="" />
                </div>
              ) : (
                <Icon className="w-[22px] h-[22px]"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? P.accent : P.inactive }} />
              )}
              {showBadge && (
                <div className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: '#ed4245', color: '#fff' }}>
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium"
              style={{ color: isActive ? P.accent : P.inactive }}>
              {t.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: P.accent }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

import React from 'react';
import { Home, MessageSquare, Compass, Bell, User } from 'lucide-react';

const tabs = [
  { id: 'servers', icon: Home, label: 'Servers' },
  { id: 'dms', icon: MessageSquare, label: 'DMs' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function MobileNav({ active, onChange, badge }) {
  return (
    <nav className="flex items-center justify-around h-14 flex-shrink-0 md:hidden"
      style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)' }}
      role="tablist" aria-label="Main navigation">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 relative"
            role="tab" aria-selected={isActive} aria-label={t.label}
            style={{ minWidth: 48, minHeight: 44 }}>
            <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--text-cream)' : 'var(--text-muted)' }} />
            <span className="text-[9px]" style={{ color: isActive ? 'var(--text-cream)' : 'var(--text-faint)' }}>{t.label}</span>
            {t.id === 'notifications' && badge > 0 && (
              <div className="absolute top-0.5 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{ background: 'var(--accent-red)', color: '#fff' }}>{badge > 9 ? '9+' : badge}</div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import SupportDropdown from '@/components/app/features/SupportDropdown';
import { NotificationBell } from '@/components/app/features/NotificationCenter';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  border: '#33333d', muted: '#68677a', success: '#3ba55c',
};

export default function GlobalTopBar({ onSearch, notificationCount = 0, onNotifications }) {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="h-12 px-4 flex items-center justify-end flex-shrink-0 gap-1"
      style={{ borderBottom: `1px solid ${P.border}`, background: P.elevated }}>
      <button onClick={onSearch}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        style={{ color: P.muted }} title="Search (Ctrl+K)">
        <Search className="w-4 h-4" />
      </button>
      {onNotifications && (
        <NotificationBell count={notificationCount} onClick={onNotifications} />
      )}
      <div className="relative">
        <button onClick={() => setShowSupport(!showSupport)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          style={{ color: P.success }} title="Support">
          <Heart className="w-4 h-4" />
        </button>
        {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
      </div>
    </div>
  );
}

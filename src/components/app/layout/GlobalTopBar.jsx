import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import SupportDropdown from '@/components/app/features/SupportDropdown';

export default function GlobalTopBar({ onSearch }) {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="h-11 px-3 flex items-center justify-end flex-shrink-0 gap-0.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: colors.bg.elevated }}>
      <button onClick={onSearch}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        style={{ color: colors.text.muted }} title="Search (Ctrl+K)">
        <Search className="w-4 h-4" />
      </button>
      <div className="relative">
        <button onClick={() => setShowSupport(!showSupport)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          style={{ color: colors.success }} title="Support">
          <Heart className="w-4 h-4" />
        </button>
        {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
      </div>
    </div>
  );
}
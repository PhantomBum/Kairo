import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import SupportDropdown from '@/components/app/features/SupportDropdown';

export default function GlobalTopBar({ onSearch }) {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="h-12 px-4 flex items-center justify-end flex-shrink-0 gap-1"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.4)', background: colors.bg.elevated }}>
      <button onClick={onSearch}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        style={{ color: colors.text.muted }} title="Search">
        <Search className="w-5 h-5" />
      </button>
      <div className="relative">
        <button onClick={() => setShowSupport(!showSupport)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          style={{ color: '#3ba55c' }} title="Support">
          <Heart className="w-[18px] h-[18px]" />
        </button>
        {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { colors, shadows } from '@/components/app/design/tokens';

export default function ReactionTooltip({ reaction, children, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { getProfile } = useProfiles();
  const users = reaction.users || [];
  const names = users.slice(0, 10).map(uid => {
    const p = getProfile(uid);
    return p?.display_name || p?.username || 'User';
  });
  const extra = users.length - 10;
  const label = extra > 0 ? `${names.join(', ')} and ${extra} other${extra > 1 ? 's' : ''}` : names.join(', ');

  return (
    <div className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {hovered && names.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none z-50 k-scale-in"
          style={{ background: colors.bg.modal, color: colors.text.primary, boxShadow: shadows.medium, border: `1px solid ${colors.border.light}`, maxWidth: 260 }}>
          <span className="line-clamp-2">{label}</span>
        </div>
      )}
    </div>
  );
}
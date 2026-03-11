import React, { useState } from 'react';
import { colors } from '@/components/app/design/tokens';
import SquircleIcon from './SquircleIcon';
import SidebarTooltip from './SidebarTooltip';
import SidebarIndicator from './SidebarIndicator';

export default function SidebarItem({ active, unread, badge, tooltip, imageUrl, name, accentColor, glow, onClick, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SidebarIndicator active={active} hovered={hovered} unread={unread} />
      <SquircleIcon
        active={active}
        hovered={hovered}
        imageUrl={imageUrl}
        name={name}
        accentColor={accentColor}
        glow={glow}
        onClick={onClick}
      >
        {children}
      </SquircleIcon>
      {badge > 0 && (
        <div
          className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center z-10"
          style={{ background: colors.danger, color: '#fff', border: `3px solid ${colors.bg.base}` }}
        >
          {badge > 99 ? '99+' : badge}
        </div>
      )}
      <SidebarTooltip text={tooltip} visible={hovered && !active} />
    </div>
  );
}
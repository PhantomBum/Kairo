import React, { useState } from 'react';
import { colors, shadows } from '@/components/app/design/tokens';

// Squircle shape via border-radius (cross-browser, no clip-path)
const SQUIRCLE_RADIUS = '28%';
const SQUIRCLE_ACTIVE_RADIUS = '24%';
const SIZE = 48;

// Generate a gradient from a color string or server name
function letterGradient(name, accentColor) {
  if (accentColor && accentColor !== '#99AAB5') {
    return `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`;
  }
  // Generate a hue from name
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${(hue + 40) % 360}, 50%, 35%))`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function SquircleIcon({ active, hovered, imageUrl, name, accentColor, size = SIZE, glow, children, onClick, style: extraStyle }) {
  const isRound = !active && !hovered;
  const r = isRound ? SQUIRCLE_RADIUS : SQUIRCLE_ACTIVE_RADIUS;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: imageUrl ? colors.bg.elevated : (active ? colors.accent.primary : letterGradient(name, accentColor)),
        transition: 'border-radius 200ms cubic-bezier(0.4,0,0.2,1), background 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1)',
        boxShadow: active && glow !== false ? `0 0 16px ${colors.accent.primary}40, 0 0 4px ${colors.accent.primary}30` : 'none',
        ...extraStyle,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} className="w-full h-full object-cover" style={{ borderRadius: 'inherit' }} alt={name || ''} loading="eager" />
      ) : children ? (
        children
      ) : (
        <span className="text-[15px] font-bold select-none" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {getInitials(name)}
        </span>
      )}
    </button>
  );
}

export { letterGradient, getInitials, SQUIRCLE_RADIUS, SQUIRCLE_ACTIVE_RADIUS, SIZE };
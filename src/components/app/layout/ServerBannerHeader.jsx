import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, X, UserPlus, Settings, BarChart3, Shield, History, Plus,
  FolderPlus, Bell, BellOff, Eye, EyeOff, CheckCheck, Copy, LogOut, Trash2,
  Zap, ShoppingBag, Trophy,
} from 'lucide-react';

import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary,
};

function MenuItem({ icon: Icon, label, color, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
      style={{ color: danger ? '#ed4245' : (color || P.textSecondary) }}>
      <Icon className="w-4 h-4 opacity-60 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="h-px mx-2 my-1" style={{ background: P.border }} />;
}

export default function ServerBannerHeader({
  server, isOwner, onInvite, onSettings, onAnalytics, onModPanel, onBackups,
  onAddChannel, onAddCategory, onLeaveServer, onDeleteServer, scrollY = 0,
  boostCount = 0, boostLevel = 0, isBoosted = false, onBoost, onShop, shopEnabled = false,
  memberCount = 0, onlineCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const prevId = useRef(server?.id);
  useEffect(() => {
    if (server?.id !== prevId.current) { setOpen(false); prevId.current = server?.id; }
  }, [server?.id]);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(server?.id || '');
    setOpen(false);
  }, [server?.id]);

  const bannerUrl = server?.banner_url;
  const accentColor = server?.banner_color || P.accent;
  const parallaxOffset = Math.min(scrollY * 0.3, 30);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* Banner area */}
      <button onClick={() => setOpen(!open)}
        className="w-full relative overflow-hidden group transition-colors"
        style={{ height: 110 }}>

        {/* Banner image or gradient fallback */}
        {bannerUrl ? (
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: `center ${-parallaxOffset}px`,
            transition: 'background-position 50ms linear',
          }} />
        ) : (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}44 60%, ${P.surface})`,
          }} />
        )}

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
        }} />

        {/* Server name + arrow at bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-[17px] font-semibold truncate min-w-0" style={{ color: '#fff' }}>
                {server?.name}
              </h2>
              <motion.div className="flex-shrink-0" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </motion.div>
            </div>
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {memberCount} members · {onlineCount} online
            </p>
          </div>
          {/* Boost level indicator */}
          {boostCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,115,250,0.2)' }}>
              <Zap className="w-3 h-3" style={{ color: '#ff73fa' }} />
              <span className="text-[11px] font-bold" style={{ color: '#ff73fa' }}>{boostCount}</span>
              {boostLevel > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color: '#ff73fa' }}>
                  · <Trophy className="w-2.5 h-2.5" /> {boostLevel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover tint */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.1)' }} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute left-2 right-2 z-50 py-1.5 px-1.5 rounded-[14px] k-fade-in"
          style={{
            top: 114,
            background: 'var(--bg-float)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
          }}>
          <MenuItem icon={UserPlus} label="Invite People" color={P.accent} onClick={() => { onInvite(); setOpen(false); }} />
          <MenuItem icon={Zap} label={isBoosted ? 'Remove Boost' : 'Boost Server'} color="#ff73fa" onClick={() => { onBoost?.(); setOpen(false); }} />
          {shopEnabled && (
            <MenuItem icon={ShoppingBag} label="Server Shop" onClick={() => { onShop?.(); setOpen(false); }} />
          )}

          {isOwner && (
            <>
              <MenuItem icon={Settings} label="Server Settings" onClick={() => { onSettings(); setOpen(false); }} />
              <MenuItem icon={Plus} label="Create Channel" onClick={() => { onAddChannel?.(); setOpen(false); }} />
              <MenuItem icon={FolderPlus} label="Create Category" onClick={() => { onAddCategory?.(); setOpen(false); }} />
            </>
          )}

          <Divider />

          <MenuItem icon={Bell} label="Notification Settings" onClick={() => setOpen(false)} />
          <MenuItem icon={Eye} label="Privacy Settings" onClick={() => setOpen(false)} />
          <MenuItem icon={CheckCheck} label="Mark as Read" onClick={() => setOpen(false)} />
          <MenuItem icon={Copy} label="Copy Server ID" onClick={handleCopyId} />
          <MenuItem icon={EyeOff} label="Hide Muted Channels" onClick={() => setOpen(false)} />

          <Divider />

          <MenuItem icon={LogOut} label="Leave Server" danger onClick={() => { onLeaveServer?.(); setOpen(false); }} />
          {isOwner && (
            <MenuItem icon={Trash2} label="Delete Server" danger onClick={() => { onDeleteServer?.(); setOpen(false); }} />
          )}
        </div>
      )}
    </div>
  );
}

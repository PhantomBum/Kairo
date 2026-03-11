import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, UserPlus, Settings, BarChart3, Shield, History, Plus } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

function DropdownItem({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
      style={{ color: color || colors.text.secondary }}>
      <Icon className="w-4 h-4 opacity-60" /> {label}
    </button>
  );
}

export default function ServerBannerHeader({ server, isOwner, onInvite, onSettings, onAnalytics, onModPanel, onBackups, onAddChannel, scrollY = 0 }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    const handleKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [dropdownOpen]);

  // Close on server change
  const prevId = useRef(server?.id);
  useEffect(() => {
    if (server?.id !== prevId.current) { setDropdownOpen(false); prevId.current = server?.id; }
  }, [server?.id]);

  const bannerHeight = isMobile ? 80 : 110;
  const hasBanner = !!server?.banner_url;
  const accentColor = server?.banner_color || colors.accent.primary;
  const parallaxOffset = isMobile ? 0 : scrollY * 0.3;

  const bannerStyle = hasBanner
    ? { backgroundImage: `url(${server.banner_url})`, backgroundSize: 'cover', backgroundPosition: `center ${-parallaxOffset}px` }
    : { background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}55 50%, ${colors.bg.surface} 100%)` };

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Banner area */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full relative overflow-hidden group cursor-pointer"
        style={{ height: bannerHeight, ...bannerStyle, transition: 'filter 200ms ease' }}
        onMouseEnter={e => { if (!isMobile) e.currentTarget.style.filter = 'brightness(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        {/* Vignette gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Invite button floating top-right */}
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={onInvite}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[rgba(255,255,255,0.2)]"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
            <UserPlus className="w-4 h-4" style={{ color: '#fff' }} />
          </button>
        </div>

        {/* Server name + dropdown arrow at bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6 flex items-end justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold truncate" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {server?.name}
            </span>
            {dropdownOpen
              ? <X className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.8)' }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.8)' }} />}
          </div>
        </div>
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div className="absolute left-0 right-0 z-50 p-1.5 k-fade-in"
          style={{
            top: bannerHeight,
            background: 'rgba(30,30,42,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${colors.border.light}`,
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            boxShadow: shadows.strong,
          }}>
          <DropdownItem icon={UserPlus} label="Invite People" color={colors.accent.primary} onClick={() => { onInvite(); setDropdownOpen(false); }} />
          {isOwner && (
            <>
              <div className="my-1 h-px" style={{ background: colors.border.light }} />
              <DropdownItem icon={Settings} label="Server Settings" onClick={() => { onSettings(); setDropdownOpen(false); }} />
              <DropdownItem icon={BarChart3} label="Analytics" onClick={() => { onAnalytics(); setDropdownOpen(false); }} />
              <DropdownItem icon={Shield} label="Mod Panel" onClick={() => { onModPanel(); setDropdownOpen(false); }} />
              <DropdownItem icon={History} label="Backups" onClick={() => { onBackups?.(); setDropdownOpen(false); }} />
              <div className="my-1 h-px" style={{ background: colors.border.light }} />
              <DropdownItem icon={Plus} label="Create Channel" onClick={() => { onAddChannel(); setDropdownOpen(false); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
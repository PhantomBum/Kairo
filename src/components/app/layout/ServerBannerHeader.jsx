import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, UserPlus, Settings, BarChart3, Shield, History, Plus } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

function DropdownItem({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded text-sm transition-colors hover:bg-[rgba(88,101,242,0.15)]"
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

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    const handleKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [dropdownOpen]);

  const prevId = useRef(server?.id);
  useEffect(() => {
    if (server?.id !== prevId.current) { setDropdownOpen(false); prevId.current = server?.id; }
  }, [server?.id]);

  const hasBanner = !!server?.banner_url;
  const accentColor = server?.banner_color || colors.accent.primary;

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Server name header */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full h-12 px-4 flex items-center justify-between group cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]"
        style={{ 
          background: hasBanner ? `linear-gradient(90deg, ${accentColor}22, transparent)` : 'transparent',
          boxShadow: '0 1px 0 rgba(0,0,0,0.2), 0 1.5px 0 rgba(0,0,0,0.06)',
        }}>
        <span className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }}>
          {server?.name}
        </span>
        {dropdownOpen
          ? <X className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text.muted }} />
          : <ChevronDown className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text.muted }} />}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute left-2 right-2 z-50 p-1.5 rounded-lg k-fade-in"
          style={{ top: 48, background: '#111214', boxShadow: '0 8px 16px rgba(0,0,0,0.24)' }}>
          <DropdownItem icon={UserPlus} label="Invite People" color={colors.accent.primary} onClick={() => { onInvite(); setDropdownOpen(false); }} />
          {isOwner && (
            <>
              <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownItem icon={Settings} label="Server Settings" onClick={() => { onSettings(); setDropdownOpen(false); }} />
              <DropdownItem icon={BarChart3} label="Analytics" onClick={() => { onAnalytics(); setDropdownOpen(false); }} />
              <DropdownItem icon={Shield} label="Mod Panel" onClick={() => { onModPanel(); setDropdownOpen(false); }} />
              <DropdownItem icon={History} label="Backups" onClick={() => { onBackups?.(); setDropdownOpen(false); }} />
              <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownItem icon={Plus} label="Create Channel" onClick={() => { onAddChannel(); setDropdownOpen(false); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
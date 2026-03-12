import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, UserPlus, Settings, BarChart3, Shield, History, Plus } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

function DropdownItem({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[rgba(212,201,168,0.08)]"
      style={{ color: color || colors.text.secondary }}>
      <Icon className="w-4 h-4 opacity-60" /> {label}
    </button>
  );
}

export default function ServerBannerHeader({ server, isOwner, onInvite, onSettings, onAnalytics, onModPanel, onBackups, onAddChannel }) {
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

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-12 px-4 flex items-center justify-between transition-colors hover:bg-[rgba(255,255,255,0.04)]"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.2), 0 1.5px 0 rgba(0,0,0,0.06)' }}>
        <span className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }}>{server?.name}</span>
        {open ? <X className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text.muted }} />
          : <ChevronDown className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.text.muted }} />}
      </button>

      {open && (
        <div className="absolute left-2 right-2 z-50 p-1.5 rounded k-fade-in"
          style={{ top: 48, background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <DropdownItem icon={UserPlus} label="Invite People" color={colors.text.primary} onClick={() => { onInvite(); setOpen(false); }} />
          {isOwner && (
            <>
              <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownItem icon={Settings} label="Server Settings" onClick={() => { onSettings(); setOpen(false); }} />
              <DropdownItem icon={BarChart3} label="Analytics" onClick={() => { onAnalytics(); setOpen(false); }} />
              <DropdownItem icon={Shield} label="Mod Panel" onClick={() => { onModPanel(); setOpen(false); }} />
              <DropdownItem icon={History} label="Backups" onClick={() => { onBackups?.(); setOpen(false); }} />
              <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <DropdownItem icon={Plus} label="Create Channel" onClick={() => { onAddChannel(); setOpen(false); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
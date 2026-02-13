import React, { useState } from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StatusSelector from '@/components/kairo/unified/layout/StatusSelector';

function Btn({ label, active, onClick, children }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: active ? '#f87171' : '#666' }}>{children}</button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black text-white text-xs border-0 px-2 py-1">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

export default function UserPanel({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSettings, onStatusChange }) {
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const name = profile?.display_name || 'User';
  const status = profile?.status || 'online';

  return (
    <div className="relative h-[52px] px-2 flex items-center gap-1 flex-shrink-0" style={{ background: '#111' }}>
      {showStatusPicker && (
        <StatusSelector
          currentStatus={status}
          customStatus={profile?.custom_status}
          onStatusChange={(s) => onStatusChange?.(s)}
          onCustomStatusChange={(cs) => onStatusChange?.({ custom_status: cs })}
          onClose={() => setShowStatusPicker(false)}
        />
      )}
      <div className="flex items-center gap-2 flex-1 min-w-0 px-1 cursor-pointer hover:bg-white/[0.04] rounded-md py-1 transition-colors"
        onClick={() => setShowStatusPicker(!showStatusPicker)}>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: '#222' }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" style={{ background: statusColors[status], border: '2px solid #111' }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate leading-tight">{name}</div>
          <div className="text-[10px] text-zinc-500 leading-tight truncate">
            {profile?.custom_status?.text ? `${profile.custom_status.emoji || ''} ${profile.custom_status.text}` : status}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Btn label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={onToggleMute}>
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Btn>
        <Btn label={isDeafened ? 'Undeafen' : 'Deafen'} active={isDeafened} onClick={onToggleDeafen}>
          {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Btn>
        <Btn label="Settings" onClick={onSettings}><Settings className="w-4 h-4" /></Btn>
      </div>
    </div>
  );
}
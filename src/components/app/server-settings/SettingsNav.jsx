import React from 'react';
import { Settings, Palette, Link, Hash, FolderOpen, Shield, Users, Bot, ShieldAlert, FileText, Ban, Smile, Stamp, Volume2, BarChart3, TrendingUp, CreditCard, Zap, DollarSign, Webhook, History, AlertTriangle } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const NAV = [
  { section: 'GENERAL', items: [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'invites', label: 'Invites', icon: Link },
  ]},
  { section: 'COMMUNITY', items: [
    { id: 'channels', label: 'Channels', icon: Hash },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'bots', label: 'Bots', icon: Bot },
  ]},
  { section: 'MODERATION', items: [
    { id: 'automod', label: 'AutoMod', icon: ShieldAlert },
    { id: 'audit-log', label: 'Audit Log', icon: FileText },
    { id: 'bans', label: 'Bans', icon: Ban },
  ]},
  { section: 'CONTENT', items: [
    { id: 'emoji', label: 'Emoji', icon: Smile },
    { id: 'stickers', label: 'Stickers', icon: Stamp },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
  ]},
  { section: 'ANALYTICS', items: [
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'growth', label: 'Member Growth', icon: TrendingUp },
  ]},
  { section: 'ADVANCED', items: [
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ]},
];

export default function SettingsNav({ active, onSelect, serverName }) {
  return (
    <div className="w-[200px] flex-shrink-0 flex flex-col h-full overflow-y-auto scrollbar-none py-4 pl-4 pr-2">
      <h2 className="text-[14px] font-bold mb-4 px-2 truncate" style={{ color: colors.text.primary }}>{serverName}</h2>
      {NAV.map(group => (
        <div key={group.section} className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 mb-1" style={{ color: colors.text.disabled }}>{group.section}</p>
          {group.items.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors mb-px"
              style={{
                background: active === item.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: active === item.id ? colors.text.primary : colors.text.muted,
              }}>
              <item.icon className="w-4 h-4 flex-shrink-0" style={{ opacity: active === item.id ? 1 : 0.6 }} />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
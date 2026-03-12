import React from 'react';
import { Settings, Palette, Link, Hash, FolderOpen, Shield, Users, Bot, ShieldAlert, FileText, Ban, Smile, Stamp, Volume2, BarChart3, TrendingUp, Webhook, AlertTriangle, ChevronRight } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const NAV = [
  { section: 'GENERAL', items: [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'channels', label: 'Channels', icon: Hash },
  ]},
  { section: 'CUSTOMIZATION', items: [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'emoji', label: 'Emoji', icon: Smile },
    { id: 'stickers', label: 'Stickers', icon: Stamp },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
  ]},
  { section: 'MODERATION', items: [
    { id: 'automod', label: 'AutoMod', icon: ShieldAlert },
    { id: 'audit-log', label: 'Audit Log', icon: FileText },
    { id: 'bans', label: 'Bans', icon: Ban },
  ]},
  { section: 'COMMUNITY', items: [
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'invites', label: 'Invites', icon: Link },
    { id: 'bots', label: 'Bots', icon: Bot },
  ]},
  { section: 'ANALYTICS', items: [
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'growth', label: 'Member Growth', icon: TrendingUp },
  ]},
  { section: 'ADVANCED', items: [
    { id: 'integrations', label: 'Integrations', icon: Webhook },
  ]},
  { section: '', items: [
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ]},
];

// Breadcrumb label map
const LABEL_MAP = {};
NAV.forEach(g => g.items.forEach(i => { LABEL_MAP[i.id] = i.label; }));

export default function SettingsNav({ active, onSelect, serverName }) {
  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full overflow-y-auto scrollbar-none py-4 pl-4 pr-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-2 mb-1">
        <span className="text-[11px] font-medium truncate" style={{ color: colors.text.disabled }}>Server Settings</span>
        {active && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <span className="text-[11px] font-semibold truncate" style={{ color: colors.text.secondary }}>{LABEL_MAP[active] || active}</span>
          </>
        )}
      </div>
      <h2 className="text-[14px] font-bold mb-4 px-2 truncate" style={{ color: colors.text.primary }}>{serverName}</h2>
      {NAV.map((group, gi) => (
        <div key={gi} className={group.section === '' ? 'mt-auto' : 'mb-3'}>
          {group.section && <p className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 mb-1" style={{ color: colors.text.disabled }}>{group.section}</p>}
          {group.items.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors mb-px"
              style={{
                background: active === item.id ? (item.danger ? 'rgba(237,66,69,0.1)' : 'rgba(88,101,242,0.12)') : 'transparent',
                color: active === item.id ? (item.danger ? colors.danger : colors.text.primary) : item.danger ? colors.danger : colors.text.muted,
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
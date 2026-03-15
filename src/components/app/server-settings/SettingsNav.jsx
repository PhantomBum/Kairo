import React from 'react';
import { Settings, Palette, Link, Hash, FolderOpen, Shield, Users, Bot, ShieldAlert, FileText, Ban, Smile, Stamp, Volume2, BarChart3, TrendingUp, Webhook, AlertTriangle, Crown, ChevronRight, Zap, ShoppingBag, Compass, Database, Plug } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  border: '#33333d', textPrimary: '#f0eff4', textSecondary: '#a09fad',
  muted: '#5d7a8a', accent: '#2dd4bf', danger: '#f87171',
};

const NAV = [
  { section: 'GENERAL', items: [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]},
  { section: 'MEMBERS', items: [
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'bans', label: 'Bans', icon: Ban },
  ]},
  { section: 'CHANNELS', items: [
    { id: 'channels', label: 'Channels', icon: Hash },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
  ]},
  { section: 'CONTENT', items: [
    { id: 'emoji', label: 'Emoji', icon: Smile },
    { id: 'stickers', label: 'Stickers', icon: Stamp },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
  ]},
  { section: 'MODERATION', items: [
    { id: 'automod', label: 'AutoMod', icon: ShieldAlert },
    { id: 'audit-log', label: 'Audit Log', icon: FileText },
  ]},
  { section: 'COMMUNITY', items: [
    { id: 'invites', label: 'Invites', icon: Link },
    { id: 'bots', label: 'Bots', icon: Bot },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ]},
  { section: 'GROWTH', items: [
    { id: 'insights', label: 'Analytics', icon: BarChart3 },
    { id: 'growth', label: 'Member Growth', icon: TrendingUp },
    { id: 'discovery', label: 'Discovery', icon: Compass },
  ]},
  { section: 'MONETIZATION', items: [
    { id: 'shop', label: 'Server Shop', icon: ShoppingBag },
    { id: 'boosts', label: 'Server Boosts', icon: Zap },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
  ]},
  { section: 'ADVANCED', items: [
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'ownership', label: 'Ownership', icon: Crown },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ]},
];

const LABEL_MAP = {};
NAV.forEach(g => g.items.forEach(i => { LABEL_MAP[i.id] = i.label; }));

export default function SettingsNav({ active, onSelect, serverName }) {
  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full overflow-y-auto scrollbar-none py-4 pl-4 pr-2" style={{ background: P.surface, borderRight: `1px solid ${P.border}` }}>
      <div className="flex items-center gap-1 px-2 mb-1">
        <span className="text-[11px] font-medium truncate" style={{ color: P.muted }}>Server Settings</span>
        {active && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: P.muted }} />
            <span className="text-[11px] font-semibold truncate" style={{ color: P.textSecondary }}>{LABEL_MAP[active] || active}</span>
          </>
        )}
      </div>
      <h2 className="text-[14px] font-bold mb-4 px-2 truncate" style={{ color: P.textPrimary }}>{serverName}</h2>
      {NAV.map((group, gi) => (
        <div key={gi} className="mb-3">
          {group.section && <p className="text-[11px] font-bold uppercase tracking-[0.1em] px-2 mb-1" style={{ color: P.muted }}>{group.section}</p>}
          {group.items.map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors mb-px"
              style={{
                background: active === item.id ? (item.danger ? `${P.danger}10` : `${P.accent}12`) : 'transparent',
                color: active === item.id ? (item.danger ? P.danger : P.textPrimary) : item.danger ? P.danger : P.muted,
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

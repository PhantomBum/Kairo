import React, { useState, useMemo } from 'react';
import { Search, Crown, Shield, MoreVertical, UserMinus, Ban } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

export default function MembersTab({ members, roles, serverId, ownerId, onKick, onBan }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [sortBy, setSortBy] = useState('joined');
  const { getProfile } = useProfiles();

  const filtered = useMemo(() => {
    let list = [...members];
    if (search) list = list.filter(m => {
      const p = getProfile(m.user_id);
      const name = p?.display_name || m.user_email || '';
      return name.toLowerCase().includes(search.toLowerCase()) || m.user_email?.toLowerCase().includes(search.toLowerCase());
    });
    if (filterRole) list = list.filter(m => m.role_ids?.includes(filterRole));
    if (sortBy === 'joined') list.sort((a, b) => new Date(b.joined_at || 0) - new Date(a.joined_at || 0));
    else if (sortBy === 'name') list.sort((a, b) => (getProfile(a.user_id)?.display_name || '').localeCompare(getProfile(b.user_id)?.display_name || ''));
    return list;
  }, [members, search, filterRole, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
          <option value="joined">Join Date</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-1">
        <button onClick={() => setFilterRole(null)}
          className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
          style={{ background: !filterRole ? colors.accent.muted : colors.bg.elevated, color: !filterRole ? colors.accent.primary : colors.text.muted }}>
          All ({members.length})
        </button>
        {roles.filter(r => !r.is_default).map(r => (
          <button key={r.id} onClick={() => setFilterRole(filterRole === r.id ? null : r.id)}
            className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
            style={{ background: filterRole === r.id ? `${r.color}20` : colors.bg.elevated, color: filterRole === r.id ? r.color : colors.text.muted, border: `1px solid ${filterRole === r.id ? `${r.color}30` : 'transparent'}` }}>
            {r.name} ({members.filter(m => m.role_ids?.includes(r.id)).length})
          </button>
        ))}
      </div>

      {/* Member table */}
      <div className="space-y-1">
        {filtered.map(m => {
          const p = getProfile(m.user_id);
          const displayName = p?.display_name || m.user_email?.split('@')[0] || 'User';
          const isOwner = m.user_id === ownerId;
          const memberRoles = (m.role_ids || []).map(id => roles.find(r => r.id === id)).filter(Boolean);
          return (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden flex-shrink-0"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium truncate" style={{ color: colors.text.primary }}>{displayName}</span>
                  {isOwner && <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.warning }} />}
                </div>
                <span className="text-[11px] truncate block" style={{ color: colors.text.disabled }}>{m.user_email}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {memberRoles.slice(0, 3).map(r => (
                  <span key={r.id} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${r.color}15`, color: r.color }}>{r.name}</span>
                ))}
              </div>
              <span className="text-[11px] flex-shrink-0 w-20 text-right" style={{ color: colors.text.disabled }}>
                {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </span>
              {!isOwner && (
                <button onClick={() => onKick(m)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-[rgba(239,68,68,0.1)]"
                  title="Kick">
                  <UserMinus className="w-4 h-4" style={{ color: colors.danger }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React, { useState, useMemo, useCallback } from 'react';
import { Search, Crown, UserMinus, Ban, Clock, Shield, CheckSquare, Square, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24',
};

export default function MembersTab({ members, roles, serverId, ownerId, onKick, onBan }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [sortBy, setSortBy] = useState('joined');
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null);
  const { getProfile } = useProfiles();

  const filtered = useMemo(() => {
    let list = [...members].filter(m => !m.is_banned);
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

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.filter(m => m.user_id !== ownerId).map(m => m.id)));
  };

  const handleKick = async (m) => {
    if (!confirm(`Kick ${getProfile(m.user_id)?.display_name || m.user_email}? They can rejoin with a new invite.`)) return;
    onKick?.(m);
    try {
      await base44.entities.AuditLog.create({
        server_id: serverId, action_type: 'member_kick',
        actor_name: 'Admin', target_name: m.user_email,
      });
    } catch {}
  };

  const handleBan = async (m) => {
    const reason = prompt(`Ban reason for ${getProfile(m.user_id)?.display_name || m.user_email}:`);
    if (reason === null) return;
    await base44.entities.ServerMember.update(m.id, { is_banned: true, ban_reason: reason || 'No reason given' });
    onBan?.(m);
    try {
      await base44.entities.AuditLog.create({
        server_id: serverId, action_type: 'member_ban',
        actor_name: 'Admin', target_name: m.user_email,
        changes: [{ key: 'reason', new_value: reason }],
      });
    } catch {}
  };

  const handleTimeout = async (m) => {
    const minutes = prompt('Timeout duration in minutes:', '5');
    if (!minutes) return;
    const until = new Date();
    until.setMinutes(until.getMinutes() + parseInt(minutes));
    await base44.entities.ServerMember.update(m.id, { timeout_until: until.toISOString() });
    try {
      await base44.entities.AuditLog.create({
        server_id: serverId, action_type: 'member_timeout',
        actor_name: 'Admin', target_name: m.user_email,
        changes: [{ key: 'duration', new_value: `${minutes} minutes` }],
      });
    } catch {}
  };

  const handleBulk = async (action) => {
    const selectedMembers = filtered.filter(m => selected.has(m.id));
    if (selectedMembers.length === 0) return;
    if (!confirm(`${action} ${selectedMembers.length} members?`)) return;

    for (const m of selectedMembers) {
      if (m.user_id === ownerId) continue;
      try {
        if (action === 'kick') await base44.entities.ServerMember.delete(m.id);
        else if (action === 'ban') await base44.entities.ServerMember.update(m.id, { is_banned: true, ban_reason: 'Bulk action' });
        else if (action.startsWith('add_role:')) {
          const roleId = action.split(':')[1];
          const ids = [...new Set([...(m.role_ids || []), roleId])];
          await base44.entities.ServerMember.update(m.id, { role_ids: ids });
        } else if (action.startsWith('remove_role:')) {
          const roleId = action.split(':')[1];
          const ids = (m.role_ids || []).filter(id => id !== roleId);
          await base44.entities.ServerMember.update(m.id, { role_ids: ids });
        }
      } catch {}
    }
    setSelected(new Set());
    setBulkAction(null);
  };

  const isTimedOut = (m) => m.timeout_until && new Date(m.timeout_until) > new Date();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
          <Search className="w-4 h-4" style={{ color: P.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: P.textPrimary }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg text-[12px] outline-none appearance-none"
          style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
          <option value="joined">Join Date</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-1">
        <button onClick={() => setFilterRole(null)}
          className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
          style={{ background: !filterRole ? `${P.accent}20` : P.elevated, color: !filterRole ? P.accent : P.muted }}>
          All ({members.filter(m => !m.is_banned).length})
        </button>
        {roles.filter(r => !r.is_default).map(r => (
          <button key={r.id} onClick={() => setFilterRole(filterRole === r.id ? null : r.id)}
            className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
            style={{ background: filterRole === r.id ? `${r.color}20` : P.elevated, color: filterRole === r.id ? r.color : P.muted, border: `1px solid ${filterRole === r.id ? `${r.color}30` : 'transparent'}` }}>
            {r.name} ({members.filter(m => m.role_ids?.includes(r.id) && !m.is_banned).length})
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${P.accent}10`, border: `1px solid ${P.accent}30` }}>
          <span className="text-[12px] font-medium" style={{ color: P.accent }}>{selected.size} selected</span>
          <div className="flex-1" />
          <select value="" onChange={e => {
            if (e.target.value) handleBulk(e.target.value);
          }}
            className="px-2 py-1 rounded text-[11px] outline-none appearance-none"
            style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
            <option value="">Assign Role...</option>
            {roles.filter(r => !r.is_default).map(r => <option key={r.id} value={`add_role:${r.id}`}>{r.name}</option>)}
          </select>
          <select value="" onChange={e => {
            if (e.target.value) handleBulk(e.target.value);
          }}
            className="px-2 py-1 rounded text-[11px] outline-none appearance-none"
            style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
            <option value="">Remove Role...</option>
            {roles.filter(r => !r.is_default).map(r => <option key={r.id} value={`remove_role:${r.id}`}>{r.name}</option>)}
          </select>
          <button onClick={() => handleBulk('kick')}
            className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: `${P.danger}15`, color: P.danger }}>
            Kick
          </button>
          <button onClick={() => handleBulk('ban')}
            className="px-2 py-1 rounded text-[11px] font-medium" style={{ background: `${P.danger}15`, color: P.danger }}>
            Ban
          </button>
          <button onClick={() => setSelected(new Set())} className="p-1 rounded hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-3.5 h-3.5" style={{ color: P.muted }} />
          </button>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-1">
        {/* Select all header */}
        <div className="flex items-center gap-2 px-3 py-1">
          <button onClick={selectAll} className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: P.muted }}>
            {selected.size === filtered.filter(m => m.user_id !== ownerId).length && filtered.length > 0
              ? <CheckSquare className="w-3.5 h-3.5" style={{ color: P.accent }} />
              : <Square className="w-3.5 h-3.5" />}
            Select All
          </button>
          <span className="flex-1" />
          <span className="text-[11px]" style={{ color: P.muted }}>{filtered.length} members</span>
        </div>

        {filtered.map(m => {
          const p = getProfile(m.user_id);
          const displayName = p?.display_name || m.user_email?.split('@')[0] || 'User';
          const isOwner = m.user_id === ownerId;
          const memberRoles = (m.role_ids || []).map(id => roles.find(r => r.id === id)).filter(Boolean);
          const timedOut = isTimedOut(m);
          const isSelected = selected.has(m.id);

          return (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              style={{ background: isSelected ? `${P.accent}08` : P.elevated, border: `1px solid ${isSelected ? `${P.accent}20` : P.border}` }}>
              {!isOwner && (
                <button onClick={() => toggleSelect(m.id)} className="flex-shrink-0">
                  {isSelected ? <CheckSquare className="w-4 h-4" style={{ color: P.accent }} /> : <Square className="w-4 h-4" style={{ color: P.muted }} />}
                </button>
              )}
              {isOwner && <div className="w-4" />}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden flex-shrink-0"
                style={{ background: `${P.muted}20`, color: P.muted }}>
                {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium truncate" style={{ color: memberRoles[0]?.color || P.textPrimary }}>{displayName}</span>
                  {isOwner && <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.warning }} />}
                  {timedOut && <Clock className="w-3 h-3 flex-shrink-0" style={{ color: P.warning }} title="Timed out" />}
                </div>
                <span className="text-[11px] truncate block" style={{ color: P.muted }}>{m.user_email}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {memberRoles.slice(0, 3).map(r => (
                  <span key={r.id} className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${r.color}15`, color: r.color }}>{r.name}</span>
                ))}
              </div>
              <span className="text-[11px] flex-shrink-0 w-20 text-right" style={{ color: P.muted }}>
                {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </span>
              {!isOwner && (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleTimeout(m)} className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(250,166,26,0.1)]" title="Timeout">
                    <Clock className="w-3.5 h-3.5" style={{ color: P.warning }} />
                  </button>
                  <button onClick={() => handleKick(m)} className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(237,66,69,0.1)]" title="Kick">
                    <UserMinus className="w-3.5 h-3.5" style={{ color: P.danger }} />
                  </button>
                  <button onClick={() => handleBan(m)} className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(237,66,69,0.1)]" title="Ban">
                    <Ban className="w-3.5 h-3.5" style={{ color: P.danger }} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

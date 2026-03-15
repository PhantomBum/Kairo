import React, { useState } from 'react';
import { Users, Server, Crown, Shield, Code, FlaskConical, Ban, CheckCircle, UserPlus, RefreshCw, Eye, Edit3, Mail, Trash2, Award, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

const ALL_BADGE_OPTIONS = [
  { id: 'premium', label: 'Elite', icon: Crown, color: '#f0b232' },
  { id: 'developer', label: 'Developer', icon: Code, color: '#a78bfa' },
  { id: 'tester', label: 'Tester', icon: FlaskConical, color: '#3ba55c' },
  { id: 'kairo_staff', label: 'Staff', icon: Star, color: '#2dd4bf' },
  { id: 'moderator', label: 'Moderator', icon: Eye, color: '#2ecc71' },
  { id: 'partner', label: 'Partner', icon: Shield, color: '#2dd4bf' },
  { id: 'early_supporter', label: 'Early Supporter', icon: Award, color: '#e91e63' },
  { id: 'bug_hunter', label: 'Bug Hunter', icon: FlaskConical, color: '#faa61a' },
  { id: 'verified', label: 'Verified', icon: CheckCircle, color: '#3ba55c' },
];

function StatusDot({ status }) {
  const c = { online: colors.status.online, idle: colors.status.idle, dnd: colors.status.dnd }[status] || colors.status.offline;
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-[rgba(0,0,0,0.3)]" style={{ background: c }} />;
}

export default function AdminUsers({ enrichedUsers, allServers, allMembers, profileMap, search, onRefresh, showFeedback, onEditUser }) {
  const [expandedId, setExpandedId] = useState(null);
  const [badgeDropdown, setBadgeDropdown] = useState(null);

  const filteredUsers = enrichedUsers.filter(u =>
    (u.displayName || u.email || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async (u) => {
    if (!confirm(`Suspend ${u.displayName || u.email}? They'll be locked out until you unsuspend them.`)) return;
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: true, status: 'offline', is_online: false });
    showFeedback(`Suspended ${u.displayName || u.email}`);
    onRefresh();
  };

  const handleUnban = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: false });
    showFeedback(`Unsuspended ${u.displayName || u.email}`);
    onRefresh();
  };

  const handleDeleteAccount = async (u) => {
    if (!confirm(`Permanently delete ${u.displayName || u.email}? All their data will be removed and this can't be undone.`)) return;
    if (!confirm(`Are you absolutely sure? Type "delete" in the next prompt to confirm.`)) return;
    const memberships = allMembers.filter(m => m.user_id === u.id || m.user_email === u.email);
    for (const m of memberships) await base44.entities.ServerMember.delete(m.id);
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.delete(profile.id);
    showFeedback(`Deleted account ${u.displayName || u.email}`);
    onRefresh();
  };

  const handleToggleBadge = async (u, badge) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const current = profile.badges || [];
    const has = current.includes(badge);
    const badges = has ? current.filter(b => b !== badge) : [...new Set([...current, badge])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    showFeedback(`${has ? 'Revoked' : 'Granted'} ${badge} badge`);
    onRefresh();
  };

  const handleGrantElite = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const badges = [...new Set([...(profile.badges || []), 'premium', 'kairo_elite'])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    const credits = await base44.entities.UserCredits.filter({ user_id: u.id });
    if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: true });
    else await base44.entities.UserCredits.create({ user_id: u.id, user_email: u.email, balance: 500, has_nitro: true });
    showFeedback(`Granted Elite to ${u.displayName} (permanent)`);
    onRefresh();
  };

  const handleRevokeElite = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const badges = (profile.badges || []).filter(b => b !== 'premium' && b !== 'kairo_elite');
    await base44.entities.UserProfile.update(profile.id, { badges });
    const credits = await base44.entities.UserCredits.filter({ user_id: u.id });
    if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: false });
    showFeedback(`Revoked Elite from ${u.displayName}`);
    onRefresh();
  };

  const handleForceAddToServer = async (user, serverId) => {
    const existing = allMembers.filter(m => m.server_id === serverId && (m.user_id === user.id || m.user_email === user.email));
    if (existing.length > 0) { showFeedback('User already in server'); return; }
    await base44.entities.ServerMember.create({ server_id: serverId, user_id: user.id, user_email: user.email, joined_at: new Date().toISOString(), role_ids: [] });
    const server = allServers.find(s => s.id === serverId);
    if (server) await base44.entities.Server.update(serverId, { member_count: (server.member_count || 1) + 1 });
    showFeedback(`Added ${user.displayName} to ${server?.name}`);
    onRefresh();
  };

  if (filteredUsers.length === 0) return <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No users found</p>;

  return (
    <div className="space-y-1">
      {filteredUsers.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)).map(u => {
        const isExpanded = expandedId === u.id;
        const hasElite = u.badges?.includes('premium') || u.badges?.includes('kairo_elite');
        return (
          <div key={u.id} style={{ opacity: u.isBanned ? 0.5 : 1 }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] cursor-pointer group"
              onClick={() => setExpandedId(isExpanded ? null : u.id)}>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-semibold"
                  style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : (u.displayName || '?')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5"><StatusDot status={u.isOnline ? (u.status || 'online') : 'offline'} /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{u.displayName}</span>
                  {hasElite && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#f0b232' }} />}
                  {u.badges?.includes('kairo_staff') && <Star className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />}
                  {u.isBanned && <Ban className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger }} />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{u.email}</span>
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>· {moment(u.created_date).format('MMM D, YYYY')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" title={`In ${u.serverCount} server(s)`}>
                <Server className="w-3 h-3" style={{ color: colors.text.disabled }} />
                <span className="text-[11px]" style={{ color: colors.text.disabled }}>{u.serverCount}</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: u.isBanned ? 'rgba(237,66,69,0.12)' : u.isOnline ? 'rgba(59,165,93,0.12)' : 'rgba(255,255,255,0.04)',
                  color: u.isBanned ? colors.danger : u.isOnline ? colors.status.online : colors.text.disabled
                }}>
                {u.isBanned ? 'Suspended' : u.isOnline ? 'Online' : 'Offline'}
              </span>
              {isExpanded
                ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.disabled }} />
                : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.disabled }} />
              }
            </div>

            {/* Expanded details and actions */}
            {isExpanded && (
              <div className="ml-12 mr-3 mb-2 p-3 rounded-xl space-y-3 k-fade-in" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: colors.text.disabled }}>Email</p>
                    <p className="text-[12px]" style={{ color: colors.text.secondary }}>{u.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: colors.text.disabled }}>Joined</p>
                    <p className="text-[12px]" style={{ color: colors.text.secondary }}>{moment(u.created_date).format('MMM D, YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: colors.text.disabled }}>Servers</p>
                    <p className="text-[12px]" style={{ color: colors.text.secondary }}>{u.serverCount} server{u.serverCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {u.badges?.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: colors.text.disabled }}>Badges</p>
                    <div className="flex flex-wrap gap-1">
                      {u.badges.map(b => (
                        <span key={b} className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent-primary)' }}>
                          {b.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1" style={{ borderTop: `1px solid ${colors.border.default}` }}>
                  <button onClick={(e) => { e.stopPropagation(); onEditUser(u); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(123,108,246,0.12)]"
                    style={{ color: colors.accent.primary, border: `1px solid rgba(123,108,246,0.2)` }}>
                    <Edit3 className="w-3 h-3" /> Edit Profile
                  </button>

                  {hasElite ? (
                    <button onClick={(e) => { e.stopPropagation(); handleRevokeElite(u); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.12)]"
                      style={{ color: colors.danger, border: `1px solid rgba(237,66,69,0.2)` }}>
                      <Crown className="w-3 h-3" /> Revoke Elite
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleGrantElite(u); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(240,178,50,0.12)]"
                      style={{ color: '#f0b232', border: `1px solid rgba(240,178,50,0.2)` }}>
                      <Crown className="w-3 h-3" /> Grant Elite
                    </button>
                  )}

                  {/* Badge dropdown */}
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setBadgeDropdown(badgeDropdown === u.id ? null : u.id); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                      style={{ color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                      <Award className="w-3 h-3" /> Badges <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    {badgeDropdown === u.id && (
                      <div className="absolute left-0 top-full z-50 mt-1 py-1 rounded-lg w-48" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                        {ALL_BADGE_OPTIONS.map(badge => {
                          const has = u.badges?.includes(badge.id);
                          return (
                            <button key={badge.id} onClick={(e) => { e.stopPropagation(); handleToggleBadge(u, badge.id); setBadgeDropdown(null); }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                              style={{ color: has ? badge.color : colors.text.secondary }}>
                              <badge.icon className="w-3.5 h-3.5" style={{ color: badge.color }} />
                              <span className="flex-1 text-left">{has ? 'Revoke' : 'Grant'} {badge.label}</span>
                              {has && <CheckCircle className="w-3 h-3" style={{ color: colors.status.online }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add to server */}
                  {allServers.length > 0 && (
                    <div className="relative group/add">
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                        style={{ color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                        <UserPlus className="w-3 h-3" /> Add to Server
                      </button>
                      <div className="hidden group-hover/add:block absolute left-0 top-full z-50 mt-1 py-1 rounded-lg w-48" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                        {allServers.slice(0, 10).map(s => (
                          <button key={s.id} onClick={(e) => { e.stopPropagation(); handleForceAddToServer(u, s.id); }}
                            className="w-full text-left px-3 py-1.5 text-[12px] transition-colors hover:bg-[rgba(123,108,246,0.15)]"
                            style={{ color: colors.text.secondary }}>{s.name}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1" />

                  {u.isBanned ? (
                    <button onClick={(e) => { e.stopPropagation(); handleUnban(u); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(59,165,93,0.12)]"
                      style={{ color: colors.success, border: `1px solid rgba(59,165,93,0.2)` }}>
                      <CheckCircle className="w-3 h-3" /> Unsuspend
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleBan(u); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.08)]"
                      style={{ color: colors.text.muted, border: `1px solid ${colors.border.default}` }}>
                      <Ban className="w-3 h-3" /> Suspend
                    </button>
                  )}

                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAccount(u); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.12)]"
                    style={{ color: colors.danger, border: `1px solid rgba(237,66,69,0.2)` }}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

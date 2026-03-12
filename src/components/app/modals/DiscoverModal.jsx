import React, { useState, useEffect } from 'react';
import { Search, Users, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function DiscoverModal({ onClose, currentUserId, currentUserEmail, onJoinSuccess }) {
  const [servers, setServers] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [tab, setTab] = useState('discover');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const [realCounts, setRealCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      const [allServers, memberships] = await Promise.all([
        base44.entities.Server.list(),
        base44.entities.ServerMember.filter({ user_id: currentUserId }),
      ]);
      setServers(allServers);
      setMyMemberships(memberships);
      // Fetch real member counts for public servers
      const publicOnes = allServers.filter(s => s.is_public);
      const counts = {};
      await Promise.all(publicOnes.map(async (s) => {
        const mems = await base44.entities.ServerMember.filter({ server_id: s.id });
        counts[s.id] = mems.filter(m => !m.is_banned).length;
      }));
      setRealCounts(counts);
      setLoading(false);
    };
    load();
  }, [currentUserId]);

  const myServerIds = new Set(myMemberships.map(m => m.server_id));
  const publicServers = servers.filter(s => s.is_public && !myServerIds.has(s.id));
  const filtered = publicServers.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinServer = async (server) => {
    setJoining(server.id);
    const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: currentUserId });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: currentUserId, user_email: currentUserEmail, joined_at: new Date().toISOString(), role_ids: [] });
      // Update with real count
      const allMems = await base44.entities.ServerMember.filter({ server_id: server.id });
      await base44.entities.Server.update(server.id, { member_count: allMems.filter(m => !m.is_banned).length });
    }
    setJoining(null);
    onJoinSuccess(server);
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoinError('');
    let clean = joinCode.trim().toUpperCase();
    if (clean.includes('/INVITE/')) clean = clean.split('/INVITE/')[1]?.split(/[?#]/)[0] || '';
    const server = servers.find(s => (s.invite_code || '').toUpperCase() === clean);
    if (!server) { setJoinError('Invalid invite code'); return; }
    await handleJoinServer(server);
  };

  return (
    <ModalWrapper title="Discover" onClose={onClose} width={600}>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: colors.bg.elevated }}>
          {[
            { id: 'discover', label: 'Public Servers' },
            { id: 'invite', label: 'Join by Invite' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors"
              style={{ background: tab === t.id ? colors.accent.subtle : 'transparent', color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'discover' ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text.disabled }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search public servers..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg text-[14px] outline-none"
                style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} autoFocus />
            </div>

            <div className="max-h-[380px] overflow-y-auto scrollbar-none space-y-2">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Globe className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled }} />
                  <p className="text-[14px] font-medium" style={{ color: colors.text.muted }}>
                    {search ? 'No servers match your search' : 'No public servers yet'}
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: colors.text.disabled }}>
                    Servers can be made public in their settings
                  </p>
                </div>
              ) : filtered.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                  style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background: s.banner_color || colors.bg.overlay }}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" /> : (
                      <span className="text-[16px] font-bold" style={{ color: colors.text.muted }}>{(s.name || '?').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{s.name}</p>
                    {s.description && <p className="text-[12px] truncate mt-0.5" style={{ color: colors.text.muted }}>{s.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: colors.text.disabled }}>
                        <Users className="w-3 h-3" /> {realCounts[s.id] ?? s.member_count ?? 1} members
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleJoinServer(s)} disabled={joining === s.id}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: colors.accent.primary, color: '#fff' }}>
                    {joining === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><ArrowRight className="w-3.5 h-3.5" /> Join</>}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value)}
                placeholder="Paste invite code or link"
                onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
                className="w-full px-3 py-3 rounded-lg text-[14px] outline-none font-mono tracking-wide"
                style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${joinError ? colors.danger : colors.border.default}` }} autoFocus />
              {joinError && <p className="text-[12px] mt-1.5" style={{ color: colors.danger }}>{joinError}</p>}
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: colors.text.disabled }}>
              Invites look like <span className="font-mono" style={{ color: colors.text.muted }}>ABC123</span> or a full URL.
            </p>
            <div className="flex justify-end">
              <button onClick={handleJoinByCode} disabled={!joinCode.trim() || joining}
                className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
                style={{ background: colors.accent.primary, color: '#fff' }}>
                {joining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
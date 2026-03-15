import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Globe, ArrowRight, Loader2, Star, TrendingUp, Clock, Gamepad2, Music, Palette, BookOpen, Code, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { colors } from '@/components/app/design/tokens';
import PageShell from '@/components/app/shared/PageShell';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'art', label: 'Art & Design', icon: Palette },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'tech', label: 'Technology', icon: Code },
  { id: 'community', label: 'Community', icon: Users },
];

function ServerCard({ server, memberCount, onlineCount, isMember, joining, onJoin, onOpen }) {
  const tags = server.tags || [];
  return (
    <div className="rounded-xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg group"
      style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="h-24 relative overflow-hidden" style={{ background: server.banner_url ? 'transparent' : (server.banner_color || 'linear-gradient(135deg, #2dd4bf 0%, #2dd4bf 100%)') }}>
        {server.banner_url && <img src={server.banner_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border-2 border-white/20"
            style={{ background: colors.bg.overlay }}>
            {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" /> :
              <span className="text-[13px] font-bold text-white">{(server.name || '?').slice(0, 2).toUpperCase()}</span>}
          </div>
        </div>
        {server.is_featured && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: 'rgba(240,178,50,0.9)', color: '#000' }}>
            <Star className="w-2.5 h-2.5" /> Staff Pick
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{server.name}</h3>
        {server.description && <p className="text-[12px] mt-0.5 line-clamp-2" style={{ color: colors.text.muted }}>{server.description}</p>}

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: colors.text.disabled }}>
            <Users className="w-3 h-3" /> {memberCount || server.member_count || 0}
          </span>
          {onlineCount > 0 && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: colors.status.online }}>
              <div className="w-2 h-2 rounded-full" style={{ background: colors.status.online }} /> {onlineCount} online
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(123,108,246,0.1)', color: colors.accent.primary }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <button onClick={() => isMember ? onOpen?.(server) : onJoin(server)} disabled={joining === server.id}
          className="w-full mt-3 py-2 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          style={{ background: isMember ? colors.bg.overlay : colors.accent.primary, color: isMember ? colors.text.secondary : '#fff', border: isMember ? `1px solid ${colors.border.default}` : 'none' }}>
          {joining === server.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
            isMember ? 'Open' : <><ArrowRight className="w-3.5 h-3.5" /> Join</>}
        </button>
      </div>
    </div>
  );
}

function HeroBanner({ servers, onJoin, myServerIds, joining }) {
  const [idx, setIdx] = useState(0);
  const featured = servers.filter(s => s.is_featured || s.is_public).slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const s = featured[idx];
  if (!s) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 200 }}>
      <div className="absolute inset-0" style={{ background: s.banner_url ? 'transparent' : 'linear-gradient(135deg, #2dd4bf, #2dd4bf)' }}>
        {s.banner_url && <img src={s.banner_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.8)] via-[rgba(0,0,0,0.4)] to-transparent" />
      <div className="absolute inset-0 flex items-center px-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white/20" style={{ background: colors.bg.overlay }}>
              {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> :
                <span className="text-[18px] font-bold text-white">{(s.name || '?').slice(0, 2).toUpperCase()}</span>}
            </div>
            <div>
              <h2 className="text-[24px] font-black text-white">{s.name}</h2>
              {s.description && <p className="text-[14px] text-white/60 line-clamp-1">{s.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[13px] text-white/50"><Users className="w-4 h-4 inline mr-1" />{s.member_count || 0} members</span>
          </div>
          <button onClick={() => onJoin(s)} disabled={joining === s.id || myServerIds.has(s.id)}
            className="px-8 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: myServerIds.has(s.id) ? 'rgba(255,255,255,0.15)' : colors.accent.primary }}>
            {myServerIds.has(s.id) ? 'Joined' : 'Join Server'}
          </button>
        </div>
      </div>
      {featured.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2">
          {featured.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className="w-2.5 h-2.5 rounded-full transition-colors"
              style={{ background: i === idx ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [servers, setServers] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [category, setCategory] = useState('all');
  const [tab, setTab] = useState('discover');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [realCounts, setRealCounts] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [allServers, memberships] = await Promise.all([
        base44.entities.Server.list(),
        base44.entities.ServerMember.filter({ user_id: user.id }),
      ]);
      setServers(allServers);
      setMyMemberships(memberships);
      const publicOnes = allServers.filter(s => s.is_public);
      const counts = {};
      await Promise.all(publicOnes.map(async (s) => {
        try { const mems = await base44.entities.ServerMember.filter({ server_id: s.id }); counts[s.id] = mems.filter(m => !m.is_banned).length; }
        catch { counts[s.id] = s.member_count || 0; }
      }));
      setRealCounts(counts);
      setLoading(false);
    })();
  }, [user?.id]);

  const myServerIds = useMemo(() => new Set(myMemberships.map(m => m.server_id)), [myMemberships]);
  const publicServers = useMemo(() => servers.filter(s => s.is_public), [servers]);
  const featured = useMemo(() => publicServers.filter(s => s.is_featured), [publicServers]);
  const trending = useMemo(() => [...publicServers].sort((a, b) => (realCounts[b.id] || 0) - (realCounts[a.id] || 0)).slice(0, 6), [publicServers, realCounts]);
  const newest = useMemo(() => [...publicServers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6), [publicServers]);

  const filtered = useMemo(() => {
    let list = publicServers;
    if (category !== 'all') list = list.filter(s => s.template === category || s.tags?.includes(category));
    if (search) list = list.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.description || '').toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [publicServers, category, search]);

  const handleJoin = async (server) => {
    if (!user?.id) { navigate('/login'); return; }
    if (myServerIds.has(server.id)) { handleOpen(server); return; }
    setJoining(server.id);
    const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: user.id });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: user.id, user_email: user.email, joined_at: new Date().toISOString(), role_ids: [] });
      const allMems = await base44.entities.ServerMember.filter({ server_id: server.id });
      await base44.entities.Server.update(server.id, { member_count: allMems.filter(m => !m.is_banned).length });
    }
    setJoining(null);
    handleOpen(server);
  };

  const handleOpen = (server) => {
    try { sessionStorage.setItem('kairo-join-server', server.id); } catch {}
    navigate('/');
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoinError('');
    let clean = joinCode.trim().toUpperCase();
    if (clean.includes('/INVITE/')) clean = clean.split('/INVITE/')[1]?.split(/[?#]/)[0] || '';
    const server = servers.find(s => (s.invite_code || '').toUpperCase() === clean);
    if (!server) { setJoinError('That invite code doesn\'t look right. Double check and try again.'); return; }
    await handleJoin(server);
  };

  if (!user) {
    return (
      <PageShell title="Discover Servers" showBack={true}>
        <div className="text-center py-20">
          <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: colors.text.muted }} />
          <h2 className="text-[22px] font-bold mb-2" style={{ color: colors.text.primary }}>Discover amazing communities</h2>
          <p className="text-[14px] mb-6 max-w-md mx-auto" style={{ color: colors.text.muted }}>Sign in to browse and join servers on Kairo.</p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>
            Sign in to discover
          </a>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Discover Servers" showBack={true}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-[200px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5" style={{ color: colors.accent.primary }} />
              <h2 className="text-[18px] font-bold" style={{ color: colors.text.primary }}>Discover</h2>
            </div>

            <div className="space-y-0.5 mb-6">
              {[{ id: 'discover', label: 'Browse', icon: Globe }, { id: 'invite', label: 'Join by Invite', icon: ArrowRight }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ background: tab === t.id ? colors.accent.subtle : 'transparent', color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {tab === 'discover' && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Categories</p>
                <div className="space-y-0.5">
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
                      style={{ background: category === c.id ? colors.accent.subtle : 'transparent', color: category === c.id ? colors.accent.primary : colors.text.muted }}>
                      <c.icon className="w-3 h-3" /> {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text.disabled }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search servers..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none"
                style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
            </div>

            {loading ? (
              <div className="text-center py-24">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: colors.accent.primary }} />
              </div>
            ) : tab === 'invite' ? (
              <div className="max-w-md p-8 rounded-2xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <h3 className="text-[18px] font-bold mb-4" style={{ color: colors.text.primary }}>Join by Invite</h3>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Paste invite code or link"
                  onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none font-mono mb-3"
                  style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${joinError ? colors.danger : colors.border.default}` }} autoFocus />
                {joinError && <p className="text-[12px] mb-3" style={{ color: colors.danger }}>{joinError}</p>}
                <button onClick={handleJoinByCode} disabled={!joinCode.trim()} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-30" style={{ background: colors.accent.primary, color: '#fff' }}>Join</button>
              </div>
            ) : (
              <>
                <HeroBanner servers={servers} onJoin={handleJoin} myServerIds={myServerIds} joining={joining} />

                {!search && featured.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4" style={{ color: '#f0b232' }} />
                      <h3 className="text-[16px] font-bold" style={{ color: colors.text.primary }}>Staff Picks</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featured.slice(0, 6).map(s => (
                        <ServerCard key={s.id} server={s} memberCount={realCounts[s.id]} onlineCount={0}
                          isMember={myServerIds.has(s.id)} joining={joining} onJoin={handleJoin} onOpen={handleOpen} />
                      ))}
                    </div>
                  </section>
                )}

                {!search && trending.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4" style={{ color: colors.accent.primary }} />
                      <h3 className="text-[16px] font-bold" style={{ color: colors.text.primary }}>Trending</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trending.map(s => (
                        <ServerCard key={s.id} server={s} memberCount={realCounts[s.id]} onlineCount={0}
                          isMember={myServerIds.has(s.id)} joining={joining} onJoin={handleJoin} onOpen={handleOpen} />
                      ))}
                    </div>
                  </section>
                )}

                {!search && newest.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" style={{ color: colors.status.online }} />
                      <h3 className="text-[16px] font-bold" style={{ color: colors.text.primary }}>New Servers</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newest.map(s => (
                        <ServerCard key={s.id} server={s} memberCount={realCounts[s.id]} onlineCount={0}
                          isMember={myServerIds.has(s.id)} joining={joining} onJoin={handleJoin} onOpen={handleOpen} />
                      ))}
                    </div>
                  </section>
                )}

                {(search || category !== 'all') && (
                  <section>
                    <h3 className="text-[16px] font-bold mb-4" style={{ color: colors.text.primary }}>
                      {search ? `Results for "${search}"` : CATEGORIES.find(c => c.id === category)?.label} ({filtered.length})
                    </h3>
                    {filtered.length === 0 ? (
                      <div className="text-center py-16">
                        <Globe className="w-12 h-12 mx-auto mb-3" style={{ color: colors.text.disabled }} />
                        <p className="text-[14px]" style={{ color: colors.text.muted }}>No servers found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(s => (
                          <ServerCard key={s.id} server={s} memberCount={realCounts[s.id]} onlineCount={0}
                            isMember={myServerIds.has(s.id)} joining={joining} onJoin={handleJoin} onOpen={handleOpen} />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}

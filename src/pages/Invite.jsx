import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, Calendar, Zap, AlertTriangle, Hash, Volume2, Shield, Check } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399',
};

function StatPill({ icon: Icon, label, value, color, dot }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
      {dot
        ? <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color || P.success }} />
        : <Icon className="w-4 h-4 flex-shrink-0" style={{ color: color || P.muted }} />}
      <div>
        <div className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{value}</div>
        <div className="text-[11px]" style={{ color: P.muted }}>{label}</div>
      </div>
    </div>
  );
}

export default function Invite() {
  const { code: pathCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code');
  const code = pathCode || queryCode || '';

  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (!code) { setError('invalid'); setLoading(false); return; }

      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuth(authenticated);
        if (authenticated) {
          const me = await base44.auth.me();
          setUser(me);
        }

        const allServers = await base44.entities.Server.list();
        const found = allServers.find(s => (s.invite_code || '').toUpperCase() === code.toUpperCase());
        if (!found) { setError('invalid'); setLoading(false); return; }

        if (found.invite_expiry && Date.now() > new Date(found.invite_expiry).getTime()) {
          setError('expired'); setLoading(false); return;
        }
        if (found.invite_max_uses && found.invite_uses >= found.invite_max_uses) {
          setError('maxed'); setLoading(false); return;
        }

        setServer(found);

        if (authenticated) {
          const me = await base44.auth.me();
          const members = await base44.entities.ServerMember.filter({ server_id: found.id, user_id: me.id });
          if (members.length > 0) setIsMember(true);
        }

        const chs = await base44.entities.Channel.filter({ server_id: found.id });
        setChannels(chs.filter(c => c.type === 'text' || c.type === 'voice').slice(0, 6));
      } catch (err) {
        console.error('Invite init error:', err);
        setError('invalid');
      }
      setLoading(false);
    };
    init();
  }, [code]);

  const handleJoin = async () => {
    if (!isAuth) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setJoining(true);
    try {
      const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: user.id });
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({
          server_id: server.id, user_id: user.id, user_email: user.email,
          joined_at: new Date().toISOString(), role_ids: [],
        });
        await base44.entities.Server.update(server.id, {
          member_count: (server.member_count || 1) + 1,
          invite_uses: (server.invite_uses || 0) + 1,
        });
      }
      setJoined(true);
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (err) {
      console.error('Join error:', err);
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.base }}>
        <div className="text-center k-fade-in">
          <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: P.border, borderTopColor: P.accent }} />
          <p className="text-[13px] mt-4" style={{ color: P.muted }}>Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessages = {
      expired: { title: 'This Invite Has Expired', desc: 'The person who shared this invite may need to send a new one.' },
      maxed: { title: 'This Invite Has Reached Its Limit', desc: 'This invite has been used the maximum number of times.' },
      invalid: { title: "This Invite Isn't Valid Anymore", desc: 'This invite may be invalid, expired, or you may not have permission to join.' },
    };
    const msg = errorMessages[error] || errorMessages.invalid;
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: P.base }}>
        <div className="text-center max-w-sm k-fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `${P.danger}15` }}>
            <AlertTriangle className="w-8 h-8" style={{ color: P.danger }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: P.textPrimary }}>{msg.title}</h1>
          <p className="text-[14px] mb-8" style={{ color: P.muted }}>{msg.desc}</p>
          <a href="/" className="inline-flex px-6 py-3 rounded-xl text-[14px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            Open Kairo
          </a>
        </div>
      </div>
    );
  }

  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || P.accent}, ${server.banner_color || P.accent}88)`;
  const initials = server.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const createdDate = server.created_date ? new Date(server.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: P.base }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden k-fade-in" style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {/* Banner */}
        <div className="h-[140px] relative" style={{ background: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }} />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.5)', color: P.textPrimary, backdropFilter: 'blur(8px)' }}>
            <Shield className="w-3 h-3" /> Server Invite
          </div>
        </div>

        {/* Server Icon */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold"
            style={{ background: server.icon_url ? 'transparent' : P.elevated, color: P.textPrimary, border: `4px solid ${P.surface}` }}>
            {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : initials}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6">
          <h1 className="text-[22px] font-bold" style={{ color: P.textPrimary }}>{server.name}</h1>
          {server.description && (
            <p className="text-[14px] mt-1 leading-relaxed" style={{ color: P.muted }}>{server.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <StatPill icon={Users} label="Members" value={server.member_count || 1} />
            <StatPill icon={Users} label="Online" value="—" color={P.success} dot />
            <StatPill icon={Calendar} label="Created" value={createdDate} />
            <StatPill icon={Zap} label="Boost Level" value={server.boost_level || '0'} color="#f472b6" />
          </div>

          {channels.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Channels</h3>
              <div className="space-y-1">
                {channels.map(ch => (
                  <div key={ch.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: P.elevated }}>
                    {ch.type === 'voice'
                      ? <Volume2 className="w-3.5 h-3.5" style={{ color: P.muted }} />
                      : <Hash className="w-3.5 h-3.5" style={{ color: P.muted }} />}
                    <span className="text-[13px]" style={{ color: P.textSecondary }}>{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {joined ? (
              <div className="flex-1 h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2" style={{ background: P.success, color: '#fff' }}>
                <Check className="w-5 h-5" /> Joined! Redirecting...
              </div>
            ) : isMember ? (
              <a href="/" className="flex-1 h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center"
                style={{ background: P.accent, color: '#0d1117' }}>
                Open Server
              </a>
            ) : (
              <>
                <button onClick={handleJoin} disabled={joining}
                  className="flex-1 h-12 rounded-xl text-[15px] font-semibold disabled:opacity-50 transition-colors"
                  style={{ background: P.success, color: '#fff' }}>
                  {joining ? 'Joining...' : isAuth ? 'Join Server' : 'Sign In & Join'}
                </button>
                <a href="/"
                  className="h-12 px-6 rounded-xl text-[15px] font-semibold flex items-center justify-center"
                  style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
                  No Thanks
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

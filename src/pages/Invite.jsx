import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, Calendar, Zap, AlertTriangle, Hash, Volume2, Shield, Check } from 'lucide-react';
import { colors, typography, radius, shadows } from '@/components/app/design/tokens';
import EmptyState from '@/components/kairo/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function StatPill({ icon: Icon, label, value, color, dot }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: colors.bg.raised, border: `1px solid ${colors.border.subtle}` }}>
      {dot
        ? <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color || colors.success }} />
        : <Icon className="w-4 h-4 flex-shrink-0" style={{ color: color || colors.text.muted }} />}
      <div>
        <div style={{ fontSize: typography.compact.size, fontWeight: typography.weight.semibold, color: colors.text.primary }}>{value}</div>
        <div style={{ fontSize: typography.caption.size, color: colors.text.muted }}>{label}</div>
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.void }}>
        <div className="w-full max-w-[440px] rounded-2xl overflow-hidden" style={{ background: colors.bg.float, border: `1px solid ${colors.border.medium}` }}>
          <Skeleton className="h-[180px] w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-full" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorConfig = {
      expired: { title: 'This Invite Has Expired', description: 'The person who shared this invite may need to send a new one.' },
      maxed: { title: 'This Invite Has Reached Its Limit', description: 'This invite has been used the maximum number of times.' },
      invalid: { title: "This Invite Isn't Valid Anymore", description: 'This invite may be invalid, expired, or you may not have permission to join.' },
    };
    const cfg = errorConfig[error] || errorConfig.invalid;
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.void }}>
        <EmptyState
          type="inviteError"
          title={cfg.title}
          description={cfg.description}
          action={() => window.location.href = '/'}
          actionLabel="Open Kairo"
        />
      </div>
    );
  }

  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || colors.accent.primary}, ${server.banner_color || colors.accent.primary}88)`;
  const initials = server.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const createdDate = server.created_date ? new Date(server.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.void }}>
      <div className="w-full max-w-[440px] overflow-hidden" style={{ borderRadius: radius['2xl'], background: colors.bg.float, border: `1px solid ${colors.border.medium}`, boxShadow: shadows.xl }}>
        {/* Banner */}
        <div className="h-[180px] relative" style={{ background: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: `${radius['2xl']} ${radius['2xl']} 0 0` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }} />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.5)', color: colors.text.primary, backdropFilter: 'blur(8px)', fontSize: typography.caption.size, fontWeight: typography.weight.semibold }}>
            <Shield className="w-3 h-3" /> Server Invite
          </div>
        </div>

        {/* Server Icon */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold"
            style={{ background: server.icon_url ? 'transparent' : colors.bg.elevated, color: colors.text.primary, border: `4px solid ${colors.bg.float}` }}>
            {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : initials}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6">
          <h1 style={{ fontSize: typography.xl.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>{server.name}</h1>
          {server.description && (
            <p className="mt-1 leading-relaxed" style={{ fontSize: typography.base.size, color: colors.text.muted }}>{server.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <StatPill icon={Users} label="Members" value={server.member_count || 1} />
            <StatPill icon={Users} label="Online" value="—" color={colors.success} dot />
            <StatPill icon={Calendar} label="Created" value={createdDate} />
            <StatPill icon={Zap} label="Boost Level" value={server.boost_level || '0'} color="#f472b6" />
          </div>

          {channels.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2" style={{ fontSize: typography.label.size, fontWeight: typography.weight.semibold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>Channels</h3>
              <div className="space-y-1">
                {channels.map(ch => (
                  <div key={ch.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: colors.bg.elevated }}>
                    {ch.type === 'voice'
                      ? <Volume2 className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />
                      : <Hash className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />}
                    <span style={{ fontSize: typography.compact.size, color: colors.text.secondary }}>{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {joined ? (
              <div className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2" style={{ background: colors.success, color: '#fff', fontSize: typography.body.size, fontWeight: typography.weight.semibold }}>
                <Check className="w-5 h-5" /> Joined! Redirecting...
              </div>
            ) : isMember ? (
              <Button asChild className="flex-1 h-11 rounded-xl">
                <a href="/">Open Server</a>
              </Button>
            ) : (
              <>
                <Button onClick={handleJoin} disabled={joining} loading={joining} className="flex-1 h-11 rounded-xl">
                  {joining ? 'Joining...' : isAuth ? 'Join Server' : 'Sign In & Join'}
                </Button>
                <Button variant="outline" asChild className="h-11 px-6 rounded-xl">
                  <a href="/">No Thanks</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

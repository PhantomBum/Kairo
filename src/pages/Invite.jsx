import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';
import { Users, Calendar, Zap, AlertTriangle, Hash, Volume2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

function StatPill({ icon: Icon, label, value, color, dot }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {dot
        ? <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color || colors.status.online }} />
        : <Icon className="w-4 h-4 flex-shrink-0" style={{ color: color || colors.text.disabled }} />
      }
      <div>
        <div className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{value}</div>
        <div className="text-[11px]" style={{ color: colors.text.muted }}>{label}</div>
      </div>
    </div>
  );
}

export default function Invite() {
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code') || '';

  useEffect(() => {
    const init = async () => {
      if (!code) {
        setError('invalid');
        setLoading(false);
        return;
      }

      // Check auth
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);
      if (authenticated) {
        const me = await base44.auth.me();
        setUser(me);
      }

      // Find server by invite code
      const allServers = await base44.entities.Server.list();
      const found = allServers.find(s => (s.invite_code || '').toUpperCase() === code.toUpperCase());
      if (!found) {
        setError('invalid');
        setLoading(false);
        return;
      }

      setServer(found);

      // Check if already a member
      if (authenticated) {
        const me = await base44.auth.me();
        const members = await base44.entities.ServerMember.filter({ server_id: found.id, user_id: me.id });
        if (members.length > 0) setIsMember(true);
      }

      // Get featured channels
      const chs = await base44.entities.Channel.filter({ server_id: found.id });
      setChannels(chs.filter(c => c.type === 'text' || c.type === 'voice').slice(0, 6));

      setLoading(false);
    };
    init();
  }, [code]);

  const handleJoin = async () => {
    if (!isAuth) {
      // Redirect to login, then back to this page
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setJoining(true);
    const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: user.id });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({
        server_id: server.id, user_id: user.id, user_email: user.email,
        joined_at: new Date().toISOString(), role_ids: [],
      });
      await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
    }
    setJoined(true);
    setJoining(false);

    // Redirect to app after brief delay
    setTimeout(() => {
      window.location.href = createPageUrl('Kairo');
    }, 1200);
  };

  const handleDecline = () => {
    window.location.href = createPageUrl('Kairo');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg.base }}>
        <div className="text-center k-fade-in">
          <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
          <p className="text-[13px] mt-4" style={{ color: colors.text.disabled }}>Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.base }}>
        <div className="text-center max-w-sm k-fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle className="w-8 h-8" style={{ color: colors.danger }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>
            {error === 'expired' ? 'This Invite Has Expired' : error === 'maxed' ? 'This Invite Has Reached Its Limit' : 'Invalid Invite Link'}
          </h1>
          <p className="text-[14px] mb-8" style={{ color: colors.text.muted }}>
            {error === 'expired' ? 'The person who shared this invite may need to send a new one.' : error === 'maxed' ? 'This invite has been used the maximum number of times.' : 'This invite may be invalid or you may not have permission to join.'}
          </p>
          <a href={createPageUrl('Kairo')} className="inline-flex px-6 py-3 rounded-xl text-[14px] font-semibold"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            Open Kairo
          </a>
        </div>
      </div>
    );
  }

  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || colors.accent.primary}, ${server.banner_color || colors.accent.active}88)`;
  const initials = server.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const createdDate = server.created_date ? new Date(server.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.base }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden k-fade-in" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: shadows.strong }}>
        {/* Banner */}
        <div className="h-[140px] relative" style={{ background: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }} />
        </div>

        {/* Server Info */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold"
            style={{ background: server.icon_url ? 'transparent' : colors.bg.overlay, color: colors.text.primary, border: `4px solid ${colors.bg.surface}` }}>
            {server.icon_url
              ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" />
              : initials}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6">
          <h1 className="text-[22px] font-bold" style={{ color: colors.text.primary }}>{server.name}</h1>
          {server.description && (
            <p className="text-[14px] mt-1 leading-relaxed" style={{ color: colors.text.muted }}>{server.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <StatPill icon={Users} label="Total Members" value={server.member_count || 1} />
            <StatPill icon={Users} label="Active Now" value="—" color={colors.status.online} dot />
            <StatPill icon={Calendar} label="Created" value={createdDate} />
            <StatPill icon={Zap} label="Boost Level" value={server.features?.includes('boost_progress') ? '1' : '0'} color="#f472b6" />
          </div>

          {/* Featured channels */}
          {channels.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Channels</h3>
              <div className="space-y-1">
                {channels.map(ch => (
                  <div key={ch.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: colors.bg.elevated }}>
                    {ch.type === 'voice'
                      ? <Volume2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                      : <Hash className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                    }
                    <span className="text-[13px]" style={{ color: colors.text.secondary }}>{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {joined ? (
              <div className="flex-1 px-5 py-3 rounded-xl text-[15px] font-semibold text-center" style={{ background: colors.success, color: '#fff' }}>
                Joined! Redirecting...
              </div>
            ) : isMember ? (
              <a href={createPageUrl('Kairo')} className="flex-1 px-5 py-3 rounded-xl text-[15px] font-semibold text-center"
                style={{ background: colors.accent.primary, color: '#fff' }}>
                Open Server
              </a>
            ) : (
              <>
                <button onClick={handleJoin} disabled={joining}
                  className="flex-1 px-5 py-3 rounded-xl text-[15px] font-semibold disabled:opacity-50"
                  style={{ background: colors.success, color: '#fff' }}>
                  {joining ? 'Joining...' : isAuth ? 'Join Server' : 'Sign In & Join'}
                </button>
                <button onClick={handleDecline}
                  className="px-5 py-3 rounded-xl text-[15px] font-semibold"
                  style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
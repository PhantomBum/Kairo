import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Invite() {
  const { code: pathCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = pathCode || searchParams.get('code') || '';

  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (!code) { setLoading(false); return; }
      try {
        const me = await base44.auth.me();
        setUser(me);
        const all = await base44.entities.Server.list();
        const found = all.find(s => (s.invite_code || '').toUpperCase() === code.toUpperCase());
        if (!found) { setLoading(false); return; }
        setServer(found);
        if (me) {
          const mems = await base44.entities.ServerMember.filter({ server_id: found.id, user_id: me.id });
          setIsMember(mems.length > 0);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, [code]);

  const handleJoin = async () => {
    if (!user) { navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`); return; }
    if (isMember) { navigate('/'); return; }
    setJoining(true);
    try {
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: user.id, user_email: user.email, joined_at: new Date().toISOString(), role_ids: [] });
      const mems = await base44.entities.ServerMember.filter({ server_id: server.id });
      await base44.entities.Server.update(server.id, { member_count: mems.filter(m => !m.is_banned).length });
      toast.success(`Joined ${server.name}`);
      navigate('/');
    } catch (e) {
      toast.error(e?.message || 'Failed');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="k-page"><div className="k-spinner" /></div>;
  if (!server) return <div className="k-page k-text">Invalid invite</div>;

  return (
    <div className="k-page">
      <div className="k-box">
        <div className="k-center">
          {server.icon_url ? <div className="k-logo-img"><img src={server.icon_url} alt="" /></div> : <div className="k-logo">{(server.name || 'S').charAt(0)}</div>}
          <h1 className="k-title">You've been invited to join</h1>
          <p className="k-subtitle k-accent k-mb">{server.name}</p>
        </div>
        <button onClick={handleJoin} disabled={joining || isMember} className={isMember ? 'k-btn k-btn-secondary k-btn-full' : 'k-btn k-btn-primary k-btn-full'}>{joining ? '…' : isMember ? 'Already a member' : 'Join Server'}</button>
        {!user && <p className="k-center k-text k-mt"><a href={`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`} className="k-link">Sign in</a> to join</p>}
      </div>
    </div>
  );
}

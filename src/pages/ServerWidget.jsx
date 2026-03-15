import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

/**
 * Embeddable server widget — use in iframe: /embed/:serverId
 * Or link directly: /embed/:serverId
 * Discord-style: shows icon, name, member count, Join button
 */
export default function ServerWidget() {
  const { serverId } = useParams();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serverId) { setError('No server specified'); setLoading(false); return; }
    (async () => {
      try {
        const s = await base44.entities.Server.get(serverId);
        if (!s) { setError('Server not found'); return; }
        setServer(s);
      } catch (e) {
        setError('Could not load server');
      } finally {
        setLoading(false);
      }
    })();
  }, [serverId]);

  const memberCount = server?.member_count ?? 0;

  const inviteUrl = server?.invite_code
    ? `${window.location.origin}/invite/${server.invite_code}`
    : window.location.origin;

  if (loading) {
    return (
      <div className="min-h-[120px] flex items-center justify-center p-4" style={{ background: colors.bg.base }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.accent.primary }} />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-[120px] flex items-center justify-center p-4" style={{ background: colors.bg.base, color: colors.text.muted }}>
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl max-w-[320px]" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: colors.bg.overlay }}>
          {server.icon_url ? (
            <img src={server.icon_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <span className="text-[14px] font-bold" style={{ color: colors.text.secondary }}>
              {(server.name || '?').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }}>{server.name}</h3>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: colors.text.muted }}>
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount} members</span>
          </div>
        </div>
      </div>
      {server.description && (
        <p className="text-[12px] line-clamp-2 mb-3" style={{ color: colors.text.muted }}>{server.description}</p>
      )}
      <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
        className="block w-full py-2.5 rounded-lg text-[13px] font-semibold text-center transition-all hover:opacity-90"
        style={{ background: colors.accent.primary, color: '#fff' }}>
        Join Server
      </a>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Search, UserPlus, Check, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function AddFriendModal({ onClose, currentUserId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sent, setSent] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const qc = useQueryClient();

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    const profiles = await base44.entities.UserProfile.list();
    const q = query.toLowerCase();
    setResults(profiles.filter(p => p.user_id !== currentUserId && (
      p.display_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q) || p.user_email?.toLowerCase().includes(q)
    )).slice(0, 10));
    setSearching(false);
  }, [query, currentUserId]);

  const sendRequest = async (profile) => {
    await base44.entities.Friendship.create({ user_id: currentUserId, friend_id: profile.user_id, friend_email: profile.user_email, friend_name: profile.display_name, friend_avatar: profile.avatar_url, status: 'pending', initiated_by: currentUserId });
    setSent(s => new Set(s).add(profile.user_id));
    qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
  };

  return (
    <ModalWrapper title="Add Friend" subtitle="Search for people by name or email" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search by name or email..."
              className="flex-1 bg-transparent text-[14px] outline-none" style={{ color: colors.text.primary }} autoFocus
              aria-label="Search users" />
          </div>
          <button onClick={search} disabled={!query.trim() || searching}
            className="px-4 rounded-lg text-[14px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {searching ? '...' : 'Search'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-none space-y-1">
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: colors.bg.elevated }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate" style={{ color: colors.text.primary }}>{p.display_name || p.username}</div>
                <div className="text-[12px] truncate" style={{ color: colors.text.muted }}>{p.username || p.user_email}</div>
              </div>
              <button onClick={() => sendRequest(p)} disabled={sent.has(p.user_id)}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
                aria-label={sent.has(p.user_id) ? 'Request sent' : `Send friend request to ${p.display_name}`}>
                {sent.has(p.user_id) ? <Check className="w-4 h-4" style={{ color: colors.success }} /> : <UserPlus className="w-4 h-4" style={{ color: colors.text.muted }} />}
              </button>
            </div>
          ))}
          {results.length === 0 && searched && !searching && (
            <div className="text-center py-8 k-fade-in">
              <Users className="w-8 h-8 mx-auto mb-2" style={{ color: colors.text.disabled, opacity: 0.3 }} />
              <p className="text-[13px] mb-0.5" style={{ color: colors.text.secondary }}>No users found</p>
              <p className="text-[12px]" style={{ color: colors.text.muted }}>Try searching with a different name or email</p>
            </div>
          )}
          {!searched && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 mx-auto mb-2" style={{ color: colors.text.disabled, opacity: 0.2 }} />
              <p className="text-[13px]" style={{ color: colors.text.muted }}>Search for someone to add as a friend</p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
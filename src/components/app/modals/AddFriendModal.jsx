import React, { useState, useCallback } from 'react';
import { Search, UserPlus, Check, Users, AtSign } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { checkRateLimit } from '@/lib/security/rateLimiter';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
};

export default function AddFriendModal({ onClose, currentUserId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sent, setSent] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    setError('');
    try {
      const profiles = await base44.entities.UserProfile.list();
      const q = query.toLowerCase().trim();
      const found = profiles.filter(p => p.user_id !== currentUserId && (
        p.display_name?.toLowerCase().includes(q) ||
        p.username?.toLowerCase() === q ||
        p.username?.toLowerCase().includes(q) ||
        p.user_email?.toLowerCase().includes(q)
      )).slice(0, 12);
      setResults(found);
    } catch (err) {
      setError('That search didn\'t work. Give it another try.');
    }
    setSearching(false);
  }, [query, currentUserId]);

  const sendRequest = async (profile) => {
    const rateCheck = checkRateLimit('friend_request', currentUserId);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }
    try {
      await base44.entities.Friendship.create({
        user_id: currentUserId, friend_id: profile.user_id,
        friend_email: profile.user_email, friend_name: profile.display_name || profile.username,
        friend_avatar: profile.avatar_url, status: 'pending', initiated_by: currentUserId,
      });
      setSent(s => new Set(s).add(profile.user_id));
      qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
    } catch {
      setError("Couldn't send that request. They might already have one from you.");
    }
  };

  return (
    <ModalWrapper title="Add Friend" subtitle="You can add friends by their username or display name" onClose={onClose} width={440}>
      <div className="space-y-4">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all focus-within:ring-1"
            style={{ background: P.base, border: `1px solid ${P.border}`, '--tw-ring-color': P.accent }}>
            <AtSign className="w-4 h-4 flex-shrink-0" style={{ color: P.muted }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Enter a username or display name"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#68677a]"
              style={{ color: P.textPrimary }} autoFocus />
          </div>
          <button onClick={search} disabled={!query.trim() || searching}
            className="px-5 rounded-xl text-[14px] font-semibold disabled:opacity-30 transition-all hover:brightness-110"
            style={{ background: P.accent, color: '#fff' }}>
            {searching ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
            ) : 'Search'}
          </button>
        </div>

        {error && (
          <p className="text-[12px] px-1" style={{ color: P.danger }}>{error}</p>
        )}

        {/* Results */}
        <div className="max-h-72 overflow-y-auto scrollbar-none space-y-1">
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              style={{ background: P.elevated }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold overflow-hidden"
                style={{ background: P.base, color: P.muted }}>
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>
                  {p.display_name || p.username}
                </div>
                {p.username && (
                  <div className="text-[12px] truncate" style={{ color: P.muted }}>@{p.username}</div>
                )}
              </div>
              {sent.has(p.user_id) ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                  style={{ background: `${P.success}15`, color: P.success }}>
                  <Check className="w-3.5 h-3.5" /> Sent
                </span>
              ) : (
                <button onClick={() => sendRequest(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-110"
                  style={{ background: P.accent, color: '#fff' }}>
                  <UserPlus className="w-3.5 h-3.5" /> Send Request
                </button>
              )}
            </div>
          ))}
          {results.length === 0 && searched && !searching && (
            <div className="text-center py-10 k-fade-in">
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.2 }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>No users found</p>
              <p className="text-[12px]" style={{ color: P.muted }}>Try searching with a different name</p>
            </div>
          )}
          {!searched && (
            <div className="text-center py-10">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.15 }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>Search for someone</p>
              <p className="text-[12px]" style={{ color: P.muted }}>Find friends by username or display name</p>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

import React, { useState, useCallback } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

export default function AddFriendModal({ onClose, currentUserId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sent, setSent] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const qc = useQueryClient();

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
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
    <ModalWrapper title="Add Friend" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search by name or email" className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]" style={{ color: 'var(--text-primary)' }} autoFocus />
          </div>
          <button onClick={search} disabled={!query.trim() || searching} className="px-4 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Search</button>
        </div>
        <div className="max-h-64 overflow-y-auto scrollbar-none space-y-1">
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{p.display_name || p.username}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{p.username || p.user_email}</div>
              </div>
              <button onClick={() => sendRequest(p)} disabled={sent.has(p.user_id)}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-glass-hover)]">
                {sent.has(p.user_id) ? <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} /> : <UserPlus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          ))}
          {results.length === 0 && query && !searching && <p className="text-center text-[11px] py-4" style={{ color: 'var(--text-muted)' }}>No users found</p>}
        </div>
      </div>
    </ModalWrapper>
  );
}
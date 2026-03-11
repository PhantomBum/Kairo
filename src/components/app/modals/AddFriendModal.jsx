import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

export default function AddFriendModal({ onClose, currentUserId }) {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sent, setSent] = useState('');
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const profiles = await base44.entities.UserProfile.list();
    const found = profiles.filter(p =>
      p.user_id !== currentUserId &&
      ((p.display_name || '').toLowerCase().includes(query.toLowerCase()) ||
       (p.username || '').toLowerCase().includes(query.toLowerCase()) ||
       (p.user_email || '').toLowerCase().includes(query.toLowerCase()))
    );
    setResults(found.slice(0, 10));
    setSearching(false);
  };

  const sendRequest = async (profile) => {
    await base44.entities.Friendship.create({
      user_id: currentUserId,
      friend_id: profile.user_id,
      friend_email: profile.user_email,
      friend_name: profile.display_name || profile.username,
      friend_avatar: profile.avatar_url,
      status: 'pending',
      initiated_by: currentUserId,
    });
    qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
    setSent(profile.user_id);
  };

  return (
    <ModalWrapper title="Add Friend" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email..."
            onKeyDown={e => e.key === 'Enter' && search()}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
          <button onClick={search} disabled={searching}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>Search</button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs overflow-hidden"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p.display_name || 'U').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.display_name || p.username}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.user_email}</div>
              </div>
              {sent === p.user_id ? (
                <span className="text-xs text-green-400">Sent!</span>
              ) : (
                <button onClick={() => sendRequest(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--accent-dim)', color: 'var(--text-primary)' }}>Add</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
}
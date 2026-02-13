import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Users, Compass, ArrowRight } from 'lucide-react';

export default function DiscoverView({ currentUserId, onJoin, isJoining, onBack }) {
  const [search, setSearch] = useState('');

  const { data: publicServers = [], isLoading } = useQuery({
    queryKey: ['publicServers'],
    queryFn: () => base44.entities.Server.filter({ is_public: true }),
  });

  const filtered = publicServers.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0e0e0e' }}>
      {/* Hero */}
      <div className="px-8 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)' }}>
        <Compass className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-1">Discover Servers</h1>
        <p className="text-sm text-zinc-500 mb-5">Find communities you'll love</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search public servers..."
            className="w-full h-11 pl-11 pr-4 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        {isLoading && <div className="text-center py-8"><div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mx-auto" /></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(server => (
            <div key={server.id} className="rounded-xl overflow-hidden group transition-transform hover:scale-[1.02]"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
              {/* Banner */}
              <div className="h-24 relative" style={{ background: server.banner_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                {server.banner_url && <img src={server.banner_url} className="w-full h-full object-cover" />}
                <div className="absolute -bottom-6 left-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold overflow-hidden"
                    style={{ background: '#1a1a1a', border: '3px solid #1a1a1a' }}>
                    {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" /> :
                      <span className="text-white">{server.name?.charAt(0)}</span>}
                  </div>
                </div>
              </div>
              <div className="p-4 pt-8">
                <h3 className="text-sm font-semibold text-white mb-1">{server.name}</h3>
                {server.description && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{server.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Users className="w-3 h-3" /> {server.member_count || 1} members
                  </div>
                  <button onClick={() => onJoin(server.invite_code)} disabled={isJoining}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-black transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#fff' }}>
                    Join <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            {search ? 'No servers match your search' : 'No public servers yet. Be the first!'}
          </div>
        )}
      </div>
    </div>
  );
}
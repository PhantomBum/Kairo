import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Users, Heart, Search, Plus, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { colors } from '@/components/app/design/tokens';

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Space.list('-created_date', 100).then(s => { setSpaces(s); setLoading(false); });
  }, []);

  const filtered = spaces.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen p-8" style={{ background: colors.bg.base, color: colors.text.primary }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <a href={createPageUrl('Kairo')} className="text-[13px] hover:underline" style={{ color: colors.text.link }}>
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Back to Kairo
          </a>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[32px] font-bold" style={{ color: colors.text.primary }}>Kairo Spaces</h1>
            <p className="text-[15px]" style={{ color: colors.text.muted }}>Discover public communities, blogs, and announcements.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-6" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <Search className="w-5 h-5" style={{ color: colors.text.disabled }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Spaces..."
            className="flex-1 bg-transparent text-[14px] outline-none" style={{ color: colors.text.primary }} />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="p-5 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: colors.accent.subtle }}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full rounded-xl object-cover" alt="" /> : <Globe className="w-6 h-6" style={{ color: colors.accent.primary }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold truncate">{s.name}</p>
                    <p className="text-[12px] flex items-center gap-1" style={{ color: colors.text.muted }}>
                      <Users className="w-3 h-3" /> {s.follower_count || 0} followers
                    </p>
                  </div>
                </div>
                {s.description && <p className="text-[13px] line-clamp-3 mb-3" style={{ color: colors.text.secondary }}>{s.description}</p>}
                <p className="text-[11px]" style={{ color: colors.text.disabled }}>by {s.owner_name}</p>
              </div>
            ))}
            {filtered.length === 0 && <p className="col-span-3 text-center py-16 text-[15px]" style={{ color: colors.text.muted }}>No Spaces found. Be the first to create one!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
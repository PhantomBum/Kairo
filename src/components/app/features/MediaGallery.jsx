import React, { useState, useMemo } from 'react';
import { Image, FileText, Link2, Film, X, Download, Search } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

const TABS = [
  { id: 'images', label: 'Images', icon: Image },
  { id: 'videos', label: 'Videos', icon: Film },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'links', label: 'Links', icon: Link2 },
];

export default function MediaGallery({ onClose, messages = [], channelName }) {
  const [tab, setTab] = useState('images');
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const media = useMemo(() => {
    const images = [], videos = [], files = [], links = [];
    messages.filter(m => !m.is_deleted).forEach(m => {
      m.attachments?.forEach(a => {
        const item = { ...a, author: m.author_name, date: m.created_date, msgId: m.id };
        if (a.content_type?.startsWith('image/')) images.push(item);
        else if (a.content_type?.startsWith('video/')) videos.push(item);
        else files.push(item);
      });
      // Extract links
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = m.content?.match(urlRegex) || [];
      urls.forEach(url => links.push({ url, author: m.author_name, date: m.created_date, msgId: m.id }));
    });
    return { images, videos, files, links };
  }, [messages]);

  const current = media[tab] || [];
  const filtered = current.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.filename?.toLowerCase().includes(s) || item.url?.toLowerCase().includes(s) || item.author?.toLowerCase().includes(s));
  });

  return (
    <ModalWrapper title={`Media — ${channelName || 'Channel'}`} onClose={onClose} width={640}>
      {/* Tabs */}
      <div className="flex gap-1 mb-3 pb-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ background: tab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === t.id ? colors.text.primary : colors.text.muted }}>
            <t.icon className="w-4 h-4" /> {t.label} <span className="text-[11px] opacity-60">({media[t.id]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
        <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-none">
        {tab === 'images' && (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((item, i) => (
              <button key={i} onClick={() => setLightbox(item.url)} className="relative group aspect-square rounded-lg overflow-hidden" style={{ background: colors.bg.elevated }}>
                <img src={item.url} className="w-full h-full object-cover" alt={item.filename || 'Image'} loading="lazy" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] truncate text-white/80">{item.author}</p>
                    <p className="text-[11px] text-white/50">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'videos' && (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((item, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ background: colors.bg.elevated }}>
                <video src={item.url} controls className="w-full aspect-video" />
                <div className="p-2">
                  <p className="text-[12px] truncate" style={{ color: colors.text.secondary }}>{item.filename || 'Video'}</p>
                  <p className="text-[11px]" style={{ color: colors.text.muted }}>{item.author} · {new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'files' && (
          <div className="space-y-1.5">
            {filtered.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" style={{ background: colors.bg.elevated }}>
                <FileText className="w-8 h-8 flex-shrink-0" style={{ color: colors.accent.primary }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate font-medium" style={{ color: colors.text.primary }}>{item.filename || 'File'}</p>
                  <p className="text-[11px]" style={{ color: colors.text.muted }}>{item.author} · {new Date(item.date).toLocaleDateString()}{item.size ? ` · ${(item.size / 1024).toFixed(0)}KB` : ''}</p>
                </div>
                <Download className="w-4 h-4" style={{ color: colors.text.muted }} />
              </a>
            ))}
          </div>
        )}

        {tab === 'links' && (
          <div className="space-y-1.5">
            {filtered.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" style={{ background: colors.bg.elevated }}>
                <Link2 className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.link }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: colors.text.link }}>{item.url}</p>
                  <p className="text-[11px]" style={{ color: colors.text.muted }}>{item.author} · {new Date(item.date).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {filtered.length === 0 && <p className="text-center py-12 text-[14px]" style={{ color: colors.text.muted }}>No {tab} found</p>}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => setLightbox(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={lightbox} className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain" alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </ModalWrapper>
  );
}
import React, { useMemo, useState } from 'react';
import { Image, Film, FileText, X } from 'lucide-react';

const TABS = [
  { id: 'images', label: 'Images', icon: Image },
  { id: 'videos', label: 'Videos', icon: Film },
  { id: 'files', label: 'Files', icon: FileText },
];

export default function DMMediaGallery({ messages, onClose }) {
  const [tab, setTab] = useState('images');

  const media = useMemo(() => {
    const items = { images: [], videos: [], files: [] };
    (messages || []).forEach(m => {
      (m.attachments || []).forEach(a => {
        if (a.content_type?.startsWith('image/')) items.images.push({ ...a, date: m.created_date, author: m.author_name });
        else if (a.content_type?.startsWith('video/')) items.videos.push({ ...a, date: m.created_date, author: m.author_name });
        else items.files.push({ ...a, date: m.created_date, author: m.author_name });
      });
    });
    return items;
  }, [messages]);

  const current = media[tab] || [];

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col" style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <div className="h-12 px-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Media Gallery</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--bg-glass-hover)]"><X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
      </div>
      <div className="flex gap-0.5 px-2 pt-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] transition-colors"
            style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
            <t.icon className="w-3 h-3" /> {t.label}
            <span className="text-[8px]">({media[t.id].length})</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-none p-2">
        {tab === 'images' && (
          <div className="grid grid-cols-3 gap-1">
            {current.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden" style={{ background: 'var(--bg-glass)' }}>
                <img src={a.url} className="w-full h-full object-cover hover:brightness-110 transition-all" />
              </a>
            ))}
          </div>
        )}
        {tab === 'videos' && (
          <div className="space-y-2">
            {current.map((a, i) => (
              <video key={i} src={a.url} controls className="w-full rounded-lg" style={{ border: '1px solid var(--border)' }} />
            ))}
          </div>
        )}
        {tab === 'files' && (
          <div className="space-y-1">
            {current.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] hover:bg-[var(--bg-glass-hover)]"
                style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{a.filename}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{a.author} · {new Date(a.date).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}
        {current.length === 0 && <p className="text-center py-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>No {tab} shared yet</p>}
      </div>
    </div>
  );
}
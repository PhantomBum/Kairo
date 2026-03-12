import React, { useState, useMemo } from 'react';
import { Pin, PinOff, Search, ExternalLink, Download, FileText, Image, Film, Music, X, Tag } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import ImageWithFallback from '@/components/app/shared/ImageWithFallback';

const CATEGORIES = ['All', 'Important', 'Resources', 'Rules', 'Media'];

function isMediaUrl(url) {
  if (!url) return null;
  const l = url.toLowerCase();
  if (l.match(/\.(gif|png|jpg|jpeg|webp|avif|bmp)(\?|$)/)) return 'image';
  if (l.match(/\.(mp4|webm|mov)(\?|$)/)) return 'video';
  if (l.match(/\.(mp3|wav|ogg|flac|aac)(\?|$)/)) return 'audio';
  return null;
}

function extractLinks(text) {
  if (!text) return [];
  return [...text.matchAll(/https?:\/\/[^\s]+/g)].map(m => m[0]);
}

function PinCard({ message, onUnpin, onJump }) {
  const links = extractLinks(message.content);
  const hasImage = message.attachments?.some(a => a.content_type?.startsWith('image/')) || links.some(l => isMediaUrl(l) === 'image');
  const hasFile = message.attachments?.some(a => !a.content_type?.startsWith('image/') && !a.content_type?.startsWith('video/'));
  const hasVideo = message.attachments?.some(a => a.content_type?.startsWith('video/'));

  return (
    <div className="rounded-xl overflow-hidden group k-fade-in break-inside-avoid mb-3"
      style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {/* Image attachments as thumbnails */}
      {message.attachments?.filter(a => a.content_type?.startsWith('image/')).map((a, i) => (
        <ImageWithFallback key={i} src={a.url} alt={a.filename} className="w-full max-h-[200px] object-cover" loading="lazy" />
      ))}
      {/* Inline image links */}
      {!hasImage && links.filter(l => isMediaUrl(l) === 'image').map((url, i) => (
        <img key={i} src={url} alt="" className="w-full max-h-[200px] object-cover" loading="lazy" />
      ))}
      {/* Video attachment thumbnail */}
      {hasVideo && message.attachments?.filter(a => a.content_type?.startsWith('video/')).map((a, i) => (
        <div key={i} className="relative">
          <video src={a.url} className="w-full max-h-[160px] object-cover" muted preload="metadata" />
          <div className="absolute inset-0 flex items-center justify-center"><Film className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.7)' }} /></div>
        </div>
      ))}

      <div className="p-3">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden flex-shrink-0"
            style={{ background: colors.bg.overlay, color: colors.text.muted }}>
            {message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" /> : (message.author_name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[12px] font-semibold block truncate" style={{ color: colors.text.primary }}>{message.author_name}</span>
            <span className="text-[10px]" style={{ color: colors.text.disabled }}>{new Date(message.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Message content */}
        {message.content && (
          <p className="text-[13px] leading-relaxed break-words mb-2" style={{ color: colors.text.secondary }}>
            {message.content.length > 300 ? message.content.slice(0, 300) + '...' : message.content}
          </p>
        )}

        {/* File attachments as styled cards */}
        {message.attachments?.filter(a => !a.content_type?.startsWith('image/') && !a.content_type?.startsWith('video/')).map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" download
            className="flex items-center gap-2.5 p-2.5 rounded-lg mb-1.5 hover:brightness-110 transition-colors"
            style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>
            {a.content_type?.startsWith('audio/') ? <Music className="w-4 h-4 flex-shrink-0" style={{ color: '#f0b232' }} /> : <FileText className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent.primary }} />}
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium block truncate" style={{ color: colors.text.primary }}>{a.filename || 'File'}</span>
              {a.size && <span className="text-[10px]" style={{ color: colors.text.disabled }}>{(a.size / 1024).toFixed(1)} KB</span>}
            </div>
            <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.muted }} />
          </a>
        ))}

        {/* Link previews */}
        {links.filter(l => !isMediaUrl(l)).slice(0, 2).map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg mb-1.5 hover:bg-[rgba(255,255,255,0.04)]"
            style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.link }} />
            <span className="text-[11px] truncate" style={{ color: colors.text.link }}>{url}</span>
          </a>
        ))}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onJump && (
            <button onClick={() => onJump(message)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: colors.text.link }}>
              <ExternalLink className="w-3 h-3" /> Jump
            </button>
          )}
          <button onClick={() => onUnpin(message)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium hover:bg-[rgba(237,66,69,0.08)]"
            style={{ color: colors.danger }}>
            <PinOff className="w-3 h-3" /> Unpin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PinnedMessagesModal({ onClose, messages, onUnpin, onJumpToMessage }) {
  const pinned = (messages || []).filter(m => m.is_pinned);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = pinned;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.content?.toLowerCase().includes(q) || m.author_name?.toLowerCase().includes(q));
    }
    if (category === 'Media') list = list.filter(m => m.attachments?.some(a => a.content_type?.startsWith('image/') || a.content_type?.startsWith('video/')));
    if (category === 'Resources') list = list.filter(m => m.attachments?.length > 0 || m.content?.match(/https?:\/\//));
    return list;
  }, [pinned, search, category]);

  return (
    <ModalWrapper title="Pin Board" subtitle={pinned.length > 0 ? `${pinned.length} pinned` : undefined} onClose={onClose} width={560}>
      {pinned.length === 0 ? (
        <div className="text-center py-16 k-fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(240,178,50,0.08)' }}>
            <Pin className="w-8 h-8" style={{ color: colors.warning, opacity: 0.5 }} />
          </div>
          <p className="text-[15px] font-semibold mb-1" style={{ color: colors.text.secondary }}>No pinned messages</p>
          <p className="text-[13px]" style={{ color: colors.text.muted }}>Pin important messages so they're easy to find later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pins..." autoFocus
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
                style={{ background: category === c ? colors.accent.subtle : colors.bg.elevated, color: category === c ? colors.accent.primary : colors.text.muted, border: `1px solid ${category === c ? colors.accent.muted : colors.border.default}` }}>
                {c}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="max-h-[460px] overflow-y-auto scrollbar-none" style={{ columnCount: filtered.length > 2 ? 2 : 1, columnGap: '12px' }}>
            {filtered.map(m => (
              <PinCard key={m.id} message={m} onUnpin={onUnpin} onJump={onJumpToMessage} />
            ))}
          </div>

          {filtered.length === 0 && search && (
            <p className="text-center py-6 text-[13px]" style={{ color: colors.text.muted }}>No pins match "{search}"</p>
          )}
        </div>
      )}
    </ModalWrapper>
  );
}
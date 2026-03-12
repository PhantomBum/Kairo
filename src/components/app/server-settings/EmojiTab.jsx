import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

export default function EmojiTab({ serverId, type = 'emoji' }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const isSticker = type === 'sticker';
  const entity = isSticker ? base44.entities.ServerSticker : base44.entities.ServerEmoji;
  const maxSlots = isSticker ? 30 : 50;

  useEffect(() => {
    if (serverId) entity.filter({ server_id: serverId }).then(data => { setItems(data); setLoading(false); });
  }, [serverId, type]);

  const upload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = isSticker ? 'image/png,image/gif,image/webp,image/apng' : 'image/png,image/gif,image/webp';
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
      await entity.create({ server_id: serverId, name, image_url: file_url, uploaded_by: 'admin', uploaded_at: new Date().toISOString() });
      const updated = await entity.filter({ server_id: serverId });
      setItems(updated);
    };
    input.click();
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete :${item.name}:?`)) return;
    await entity.delete(item.id);
    setItems(p => p.filter(i => i.id !== item.id));
  };

  const saveRename = async (item) => {
    if (editName.trim()) {
      await entity.update(item.id, { name: editName.trim() });
      setItems(p => p.map(i => i.id === item.id ? { ...i, name: editName.trim() } : i));
    }
    setEditId(null);
  };

  const filtered = items.filter(i => !search || i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: colors.text.muted }}>{items.length}/{maxSlots} slots used</span>
        <button onClick={upload} disabled={items.length >= maxSlots}
          className="text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-30"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" /> Upload {isSticker ? 'Sticker' : 'Emoji'}
        </button>
      </div>

      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: colors.bg.overlay }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(items.length / maxSlots) * 100}%`, background: items.length > maxSlots * 0.8 ? colors.warning : colors.accent.primary }} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${isSticker ? 'stickers' : 'emoji'}...`}
          className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px] mb-1" style={{ color: colors.text.secondary }}>No {isSticker ? 'stickers' : 'emoji'} yet</p>
          <p className="text-[12px]" style={{ color: colors.text.muted }}>Upload some to get started</p>
        </div>
      ) : (
        <div className={`grid gap-2 ${isSticker ? 'grid-cols-3' : 'grid-cols-5'}`}>
          {filtered.map(item => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden"
              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className={`flex items-center justify-center ${isSticker ? 'h-28' : 'h-16'} p-2`}>
                <img src={item.image_url} alt={item.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="px-2 pb-2">
                {editId === item.id ? (
                  <div className="flex items-center gap-1">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-transparent text-[11px] outline-none" style={{ color: colors.text.primary }} autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveRename(item)} />
                    <button onClick={() => saveRename(item)}><Check className="w-3 h-3" style={{ color: colors.success }} /></button>
                    <button onClick={() => setEditId(null)}><X className="w-3 h-3" style={{ color: colors.danger }} /></button>
                  </div>
                ) : (
                  <p className="text-[11px] truncate" style={{ color: colors.text.muted }}>:{item.name}:</p>
                )}
              </div>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditId(item.id); setEditName(item.name); }} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Pencil className="w-3 h-3 text-white" />
                </button>
                <button onClick={() => deleteItem(item)} className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Trash2 className="w-3 h-3" style={{ color: colors.danger }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
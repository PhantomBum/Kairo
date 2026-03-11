import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Image, Link } from 'lucide-react';

const COLOR_PRESETS = ['#5865f2', '#eb459e', '#57f287', '#fee75c', '#ed4245', '#ffffff', '#7c5cbf', '#00a8fc'];

function EmbedPreview({ embed }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ borderLeft: `4px solid ${embed.color || '#5865f2'}`, background: 'var(--bg-elevated)' }}>
      <div className="p-3 space-y-2">
        {embed.author_name && (
          <div className="flex items-center gap-2">
            {embed.author_icon && <img src={embed.author_icon} className="w-5 h-5 rounded-full" alt="" />}
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{embed.author_name}</span>
          </div>
        )}
        {embed.title && <p className="text-[14px] font-semibold" style={{ color: 'var(--accent-blue)' }}>{embed.title}</p>}
        {embed.description && <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{embed.description}</p>}
        {embed.fields?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {embed.fields.map((f, i) => (
              <div key={i} className={f.inline === false ? 'col-span-2' : ''}>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{f.name || 'Field'}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{f.value || '—'}</p>
              </div>
            ))}
          </div>
        )}
        {embed.image && <img src={embed.image} className="w-full rounded-md mt-1" alt="" />}
        {embed.footer && (
          <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
            {embed.footer_icon && <img src={embed.footer_icon} className="w-4 h-4 rounded-full" alt="" />}
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{embed.footer}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BotEmbedBuilder({ bot, onSave }) {
  const [embeds, setEmbeds] = useState(bot.embed_templates || []);
  const [selected, setSelected] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);

  const addEmbed = () => {
    const embed = { id: Date.now().toString(), name: 'New Embed', title: '', description: '', color: '#5865f2', fields: [], author_name: '', footer: '' };
    setEmbeds(p => [...p, embed]);
    setSelected(embed.id);
  };

  const updateEmbed = (id, data) => setEmbeds(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const removeEmbed = (id) => { setEmbeds(p => p.filter(e => e.id !== id)); if (selected === id) setSelected(null); };

  const addField = (embedId) => {
    setEmbeds(p => p.map(e => e.id === embedId ? { ...e, fields: [...(e.fields || []), { name: '', value: '', inline: true }] } : e));
  };
  const updateField = (embedId, idx, data) => {
    setEmbeds(p => p.map(e => e.id === embedId ? { ...e, fields: e.fields.map((f, i) => i === idx ? { ...f, ...data } : f) } : e));
  };
  const removeField = (embedId, idx) => {
    setEmbeds(p => p.map(e => e.id === embedId ? { ...e, fields: e.fields.filter((_, i) => i !== idx) } : e));
  };

  const save = async () => { setSaving(true); await onSave(bot.id, { embed_templates: embeds }); setSaving(false); };

  const current = embeds.find(e => e.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Embed Templates ({embeds.length})</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Design rich embed messages for your bot to send</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="p-1.5 rounded-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            {showPreview ? <EyeOff className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
          </button>
          <button onClick={addEmbed} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
            <Plus className="w-3.5 h-3.5" /> New Embed
          </button>
        </div>
      </div>

      {/* Embed tabs */}
      {embeds.length > 0 && (
        <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
          {embeds.map(e => (
            <button key={e.id} onClick={() => setSelected(e.id)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap flex items-center gap-2 transition-colors"
              style={{ background: selected === e.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', color: selected === e.id ? 'var(--text-cream)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: e.color || '#5865f2' }} />
              {e.name || 'Unnamed'}
              <button onClick={(ev) => { ev.stopPropagation(); removeEmbed(e.id); }} className="ml-1 hover:opacity-100 opacity-40">
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </button>
          ))}
        </div>
      )}

      {!current && embeds.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <Image className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No embed templates</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Create rich embeds your bot can send in channels</p>
        </div>
      )}

      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div className="space-y-3 rounded-2xl p-4" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Template Name</label>
              <input value={current.name || ''} onChange={e => updateEmbed(current.id, { name: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Color</label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map(c => (
                  <button key={c} onClick={() => updateEmbed(current.id, { color: c })}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, border: current.color === c ? '2px solid var(--text-cream)' : '2px solid transparent' }} />
                ))}
                <input type="color" value={current.color || '#5865f2'} onChange={e => updateEmbed(current.id, { color: e.target.value })}
                  className="w-6 h-6 rounded-full cursor-pointer border-0" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Author Name</label>
              <input value={current.author_name || ''} onChange={e => updateEmbed(current.id, { author_name: e.target.value })} placeholder="Bot Name"
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Title</label>
              <input value={current.title || ''} onChange={e => updateEmbed(current.id, { title: e.target.value })} placeholder="Embed title"
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Description</label>
              <textarea value={current.description || ''} onChange={e => updateEmbed(current.id, { description: e.target.value })} rows={3}
                placeholder="Embed description..." className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none resize-none"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Fields</label>
                <button onClick={() => addField(current.id)} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent-blue)' }}><Plus className="w-3 h-3" />Add</button>
              </div>
              {(current.fields || []).map((f, idx) => (
                <div key={idx} className="flex items-start gap-2 mb-2">
                  <div className="flex-1 grid grid-cols-2 gap-1.5">
                    <input value={f.name || ''} onChange={e => updateField(current.id, idx, { name: e.target.value })} placeholder="Name"
                      className="px-2 py-1 rounded-lg text-[11px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                    <input value={f.value || ''} onChange={e => updateField(current.id, idx, { value: e.target.value })} placeholder="Value"
                      className="px-2 py-1 rounded-lg text-[11px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                  </div>
                  <button onClick={() => updateField(current.id, idx, { inline: !f.inline })}
                    className="text-[9px] px-2 py-1 rounded-lg whitespace-nowrap" style={{ background: f.inline ? 'rgba(123,164,201,0.1)' : 'var(--bg-glass-strong)', color: f.inline ? 'var(--accent-blue)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {f.inline ? 'Inline' : 'Full'}
                  </button>
                  <button onClick={() => removeField(current.id, idx)} className="p-0.5 mt-1"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
                </div>
              ))}
            </div>

            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Image URL</label>
              <input value={current.image || ''} onChange={e => updateEmbed(current.id, { image: e.target.value })} placeholder="https://..."
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Footer</label>
              <input value={current.footer || ''} onChange={e => updateEmbed(current.id, { footer: e.target.value })} placeholder="Footer text"
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Preview</p>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <EmbedPreview embed={current} />
              </div>
            </div>
          )}
        </div>
      )}

      {embeds.length > 0 && (
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          {saving ? 'Saving...' : 'Save Embeds'}
        </button>
      )}
    </div>
  );
}
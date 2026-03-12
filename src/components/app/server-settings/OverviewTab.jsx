import React, { useState } from 'react';
import { Check, Camera } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function OverviewTab({ server, name, setName, desc, setDesc, isPublic, setIsPublic, serverSettings, setServerSettings, onSave, onUploadImg, saving }) {
  const [saveText, setSaveText] = useState('Save Changes');
  
  const handleSave = async () => {
    await onSave();
    setSaveText('Saved!');
    setTimeout(() => setSaveText('Save Changes'), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-4 items-start">
        <button onClick={() => onUploadImg('icon_url')} className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group relative transition-transform hover:scale-105"
          style={{ background: server?.icon_url ? 'transparent' : colors.bg.elevated, border: server?.icon_url ? 'none' : `1px dashed ${colors.border.light}` }}>
          {server?.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover rounded-2xl" alt="Server icon" />
            : <div className="flex flex-col items-center gap-1"><Camera className="w-5 h-5" style={{ color: colors.text.muted }} /><span className="text-[10px]" style={{ color: colors.text.disabled }}>Icon</span></div>}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </button>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Server Name</label>
            <div className="relative">
              <input value={name} onChange={e => setName(e.target.value)} maxLength={100}
                className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none pr-12"
                style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: colors.text.disabled }}>{name.length}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Description</label>
        <div className="relative">
          <textarea value={desc} onChange={e => e.target.value.length <= 500 && setDesc(e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none resize-none pr-12"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
            placeholder="Tell people about your server..." />
          <span className="absolute right-3 bottom-3 text-[11px]" style={{ color: colors.text.disabled }}>{desc.length}/500</span>
        </div>
      </div>

      <button onClick={() => onUploadImg('banner_url')} className="w-full h-32 rounded-xl overflow-hidden relative group transition-all hover:brightness-110"
        style={{ background: server?.banner_url ? 'transparent' : colors.bg.elevated, border: server?.banner_url ? 'none' : `1px dashed ${colors.border.light}` }}>
        {server?.banner_url ? (
          <img src={server.banner_url} className="w-full h-full object-cover rounded-xl" alt="Server banner" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Camera className="w-6 h-6" style={{ color: colors.text.disabled }} />
            <span className="text-[13px]" style={{ color: colors.text.muted }}>Upload Banner</span>
            <span className="text-[11px]" style={{ color: colors.text.disabled }}>1500×500 recommended</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
          <div className="flex items-center gap-2 text-white"><Camera className="w-5 h-5" /><span className="text-[13px] font-medium">Change Banner</span></div>
        </div>
      </button>

      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <div>
          <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>Public Server</p>
          <p className="text-[11px]" style={{ color: colors.text.muted }}>Allow anyone to find and join via Discovery</p>
        </div>
        <button onClick={() => setIsPublic(!isPublic)} className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
          style={{ background: isPublic ? colors.success : colors.bg.overlay }}>
          <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: isPublic ? 24 : 4 }} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Default Notifications</label>
          <select value={serverSettings.default_notifications || 'all'} onChange={e => setServerSettings(s => ({ ...s, default_notifications: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
            <option value="all">All Messages</option><option value="mentions">Mentions Only</option><option value="none">Nothing</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Verification Level</label>
          <select value={serverSettings.verification_level || 'none'} onChange={e => setServerSettings(s => ({ ...s, verification_level: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
            <option value="none">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-30 flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
        style={{ background: saveText === 'Saved!' ? colors.success : colors.accent.primary, color: '#fff' }}>
        {saving ? 'Saving...' : <><Check className="w-4 h-4" /> {saveText}</>}
      </button>
    </div>
  );
}
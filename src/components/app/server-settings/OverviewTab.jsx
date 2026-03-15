import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Camera } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#ed4245', success: '#3ba55c',
};

export default function OverviewTab({ server, name, setName, desc, setDesc, isPublic, setIsPublic, serverSettings, setServerSettings, onSave, onUploadImg, saving }) {
  const [saveStatus, setSaveStatus] = useState(null);
  const [accentColor, setAccentColor] = useState(server?.banner_color || '#2dd4bf');
  const saveTimer = useRef(null);

  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      await onSave();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  }, [onSave]);

  useEffect(() => { return () => { if (saveTimer.current) clearTimeout(saveTimer.current); }; }, []);

  const handleNameChange = (e) => { setName(e.target.value); autoSave(); };
  const handleDescChange = (e) => { if (e.target.value.length <= 500) { setDesc(e.target.value); autoSave(); } };

  return (
    <div className="space-y-5">
      {/* Auto-save indicator */}
      {saveStatus && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium"
          style={{ color: saveStatus === 'saved' ? P.success : P.muted }}>
          {saveStatus === 'saving' && (
            <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
          )}
          {saveStatus === 'saved' && <Check className="w-3 h-3" />}
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </div>
      )}

      <div className="flex gap-4 items-start">
        <button onClick={() => onUploadImg('icon_url')} className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group relative transition-transform hover:scale-105"
          style={{ background: server?.icon_url ? 'transparent' : P.elevated, border: server?.icon_url ? 'none' : `1px dashed ${P.border}` }}>
          {server?.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover rounded-2xl" alt="Server icon" />
            : <div className="flex flex-col items-center gap-1"><Camera className="w-5 h-5" style={{ color: P.muted }} /><span className="text-[11px]" style={{ color: P.muted }}>Icon</span></div>}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </button>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Server Name</label>
            <div className="relative">
              <input value={name} onChange={handleNameChange} maxLength={100}
                className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none pr-12"
                style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: P.muted }}>{name.length}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Description</label>
        <div className="relative">
          <textarea value={desc} onChange={handleDescChange} rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none resize-none pr-12"
            style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}
            placeholder="Tell people about your server..." />
          <span className="absolute right-3 bottom-3 text-[11px]" style={{ color: P.muted }}>{desc.length}/500</span>
        </div>
      </div>

      <button onClick={() => onUploadImg('banner_url')} className="w-full h-32 rounded-xl overflow-hidden relative group transition-all hover:brightness-110"
        style={{ background: server?.banner_url ? 'transparent' : P.elevated, border: server?.banner_url ? 'none' : `1px dashed ${P.border}` }}>
        {server?.banner_url ? (
          <img src={server.banner_url} className="w-full h-full object-cover rounded-xl" alt="Server banner" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Camera className="w-6 h-6" style={{ color: P.muted }} />
            <span className="text-[13px]" style={{ color: P.muted }}>Upload Banner</span>
            <span className="text-[11px]" style={{ color: P.muted }}>1500x500 recommended</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
          <div className="flex items-center gap-2 text-white"><Camera className="w-5 h-5" /><span className="text-[13px] font-medium">Change Banner</span></div>
        </div>
      </button>

      {/* Accent Color Picker */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Accent Color</label>
        <div className="flex gap-3 items-center">
          <input type="color" value={accentColor} onChange={e => { setAccentColor(e.target.value); setServerSettings(s => ({ ...s, accent_color: e.target.value })); autoSave(); }}
            className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: P.elevated }} />
          <span className="text-[13px] font-mono" style={{ color: P.textSecondary }}>{accentColor}</span>
          <div className="flex gap-1.5">
            {['#2dd4bf', '#2dd4bf', '#3ba55c', '#faa61a', '#ed4245', '#e91e63', '#00bcd4', '#ff9800'].map(c => (
              <button key={c} onClick={() => { setAccentColor(c); setServerSettings(s => ({ ...s, accent_color: c })); autoSave(); }}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                style={{ background: c, border: accentColor === c ? '2px solid white' : '2px solid transparent' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <div>
          <p className="text-[13px] font-medium" style={{ color: P.textPrimary }}>Public Server</p>
          <p className="text-[11px]" style={{ color: P.muted }}>Allow anyone to find and join via Discovery</p>
        </div>
        <button onClick={() => { setIsPublic(!isPublic); autoSave(); }} className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
          style={{ background: isPublic ? P.success : `${P.muted}40` }}>
          <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: isPublic ? 24 : 4 }} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Default Notifications</label>
          <select value={serverSettings.default_notifications || 'all'} onChange={e => { setServerSettings(s => ({ ...s, default_notifications: e.target.value })); autoSave(); }}
            className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none appearance-none"
            style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
            <option value="all">All Messages</option><option value="mentions">Mentions Only</option><option value="none">Nothing</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Verification Level</label>
          <select value={serverSettings.verification_level || 'none'} onChange={e => { setServerSettings(s => ({ ...s, verification_level: e.target.value })); autoSave(); }}
            className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none appearance-none"
            style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
            <option value="none">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
      </div>

      <button onClick={async () => { setSaveStatus('saving'); await onSave(); setSaveStatus('saved'); setTimeout(() => setSaveStatus(null), 2000); }} disabled={saving}
        className="px-6 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-30 flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
        style={{ background: P.accent, color: '#0d1117' }}>
        {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
      </button>
    </div>
  );
}

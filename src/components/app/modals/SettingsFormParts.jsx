import React from 'react';
import { colors } from '@/components/app/design/tokens';

export function SettingsField({ label, value, onChange, placeholder, area }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>{label}</label>
      {area ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-none transition-colors focus:border-[var(--accent-primary)]"
          style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-colors focus:border-[var(--accent-primary)]"
          style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      )}
    </div>
  );
}

export function SettingsToggle({ label, checked, onChange, desc }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
      <div className="flex-1 min-w-0">
        <span className="text-[14px]" style={{ color: colors.text.primary }}>{label}</span>
        {desc && <p className="text-[12px] mt-0.5" style={{ color: colors.text.muted }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-3" style={{ background: checked ? colors.success : colors.bg.overlay }}>
        <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: checked ? 24 : 4 }} />
      </button>
    </div>
  );
}

export function SettingsSlider({ label, value, onChange, min, max, unit }) {
  return (
    <div className="py-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
      <div className="flex justify-between mb-2">
        <span className="text-[14px]" style={{ color: colors.text.primary }}>{label}</span>
        <span className="text-[12px] font-medium" style={{ color: colors.text.muted }}>{value}{unit}</span>
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: colors.bg.overlay, accentColor: colors.accent.primary }} />
    </div>
  );
}

// For ServerSettings / ChannelSettings modals
export function ServerLabel({ children }) {
  return <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{children}</label>;
}

export function ServerInput({ value, onChange, ...props }) {
  return <input value={value} onChange={onChange} className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} {...props} />;
}

export function ServerToggle({ on, onToggle, label, icon: Icon, desc }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      {Icon ? (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: on ? 'var(--accent-green)' : 'var(--text-muted)' }} />
          <div className="min-w-0">
            <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{label}</p>
            {desc && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
          </div>
        </div>
      ) : (
        <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{label}</span>
      )}
      <button onClick={onToggle} className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0" style={{ background: on ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: on ? 22 : 2 }} />
      </button>
    </div>
  );
}
import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { EFFECTS, FREE_EFFECTS, ELITE_EFFECTS } from './effectsConfig';
import ProfileEffectCanvas from './ProfileEffectCanvas';
import { colors } from '@/components/app/design/tokens';

function EffectCard({ id, effect, selected, locked, onSelect }) {
  return (
    <button
      onClick={() => !locked && onSelect(id)}
      className="relative rounded-lg overflow-hidden transition-all group"
      style={{
        border: `2px solid ${selected ? colors.accent.primary : 'transparent'}`,
        opacity: locked ? 0.5 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="h-14 relative" style={{ background: `linear-gradient(135deg, #1a1a2e, #16213e)` }}>
        {id !== 'none' && <ProfileEffectCanvas effect={id} width={200} height={56} />}
      </div>
      <div className="px-2 py-1.5" style={{ background: colors.bg.elevated }}>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium truncate" style={{ color: colors.text.primary }}>{effect.label}</span>
          {locked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: colors.warning }} />}
        </div>
      </div>
    </button>
  );
}

export default function EffectsSettings({ currentEffect = 'none', hasElite = false, onSave, bannerUrl, accentColor }) {
  const [selected, setSelected] = useState(currentEffect);

  const handleSelect = (id) => {
    setSelected(id);
    onSave(id);
  };

  return (
    <div className="space-y-4">
      {/* Live preview */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Preview</p>
        <div className="h-20 rounded-lg overflow-hidden relative"
          style={{ background: bannerUrl ? `url(${bannerUrl}) center/cover` : `linear-gradient(135deg, ${accentColor || '#5865F2'}, ${accentColor || '#5865F2'}60 60%, ${colors.bg.modal})` }}>
          {selected !== 'none' && <ProfileEffectCanvas effect={selected} width={500} height={80} />}
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: colors.text.muted }}>
          {selected === 'none' ? 'No effect selected' : EFFECTS[selected]?.desc || ''}
        </p>
      </div>

      {/* No effect option */}
      <button onClick={() => handleSelect('none')}
        className="w-full px-3 py-2 rounded-lg text-left text-[12px] font-medium transition-colors"
        style={{
          background: selected === 'none' ? 'rgba(255,255,255,0.06)' : colors.bg.base,
          color: colors.text.primary,
          border: `2px solid ${selected === 'none' ? colors.accent.primary : colors.border.default}`,
        }}>
        None — No effect
      </button>

      {/* Free effects */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Free Effects</p>
        <div className="grid grid-cols-2 gap-2">
          {FREE_EFFECTS.map(id => (
            <EffectCard key={id} id={id} effect={EFFECTS[id]} selected={selected === id} locked={false} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* Elite effects */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: colors.warning }} />
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.warning }}>Elite Exclusive</p>
        </div>
        {!hasElite && (
          <p className="text-[11px] mb-2" style={{ color: colors.text.disabled }}>Subscribe to Kairo Elite to unlock these effects.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {ELITE_EFFECTS.map(id => (
            <EffectCard key={id} id={id} effect={EFFECTS[id]} selected={selected === id} locked={!hasElite} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}
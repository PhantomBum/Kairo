import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

const DEFAULT_RULES = [
  { name: 'Block Spam Links', type: 'block_links', enabled: false, config: { allow_list: '' } },
  { name: 'Block Mass Mentions', type: 'mass_mentions', enabled: false, config: { max_mentions: 5 } },
  { name: 'Block Profanity', type: 'profanity', enabled: false, config: { custom_words: '' } },
  { name: 'Block Excessive Caps', type: 'caps', enabled: false, config: { threshold: 70 } },
  { name: 'Anti-Raid Protection', type: 'anti_raid', enabled: false, config: { join_threshold: 10, time_window: 60 } },
];

export default function AutoModTab({ serverId }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serverId) {
      base44.entities.AutoModRule.filter({ server_id: serverId }).then(data => {
        if (data.length === 0) {
          setRules(DEFAULT_RULES.map((r, i) => ({ ...r, id: `default_${i}`, server_id: serverId })));
        } else {
          setRules(data);
        }
        setLoading(false);
      });
    }
  }, [serverId]);

  const toggleRule = async (rule, idx) => {
    const newEnabled = !rule.enabled;
    if (rule.id?.startsWith('default_')) {
      const created = await base44.entities.AutoModRule.create({ 
        server_id: serverId, name: rule.name, type: rule.type, enabled: newEnabled, config: rule.config 
      });
      setRules(r => r.map((x, i) => i === idx ? { ...created } : x));
    } else {
      await base44.entities.AutoModRule.update(rule.id, { enabled: newEnabled });
      setRules(r => r.map((x, i) => i === idx ? { ...x, enabled: newEnabled } : x));
    }
  };

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-5 h-5" style={{ color: colors.accent.primary }} />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>AutoMod Rules</p>
          <p className="text-[12px]" style={{ color: colors.text.muted }}>Automatically moderate messages and protect your server</p>
        </div>
      </div>

      <div className="space-y-2">
        {rules.map((rule, idx) => (
          <div key={rule.id || idx} className="p-4 rounded-xl transition-colors" style={{ background: colors.bg.elevated, border: `1px solid ${rule.enabled ? 'rgba(139,92,246,0.2)' : colors.border.default}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" style={{ color: rule.enabled ? colors.accent.primary : colors.text.disabled }} />
                <div>
                  <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{rule.name}</p>
                  <p className="text-[11px]" style={{ color: colors.text.disabled }}>Type: {rule.type?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button onClick={() => toggleRule(rule, idx)}
                className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                style={{ background: rule.enabled ? colors.success : colors.bg.overlay }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: rule.enabled ? 22 : 2 }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
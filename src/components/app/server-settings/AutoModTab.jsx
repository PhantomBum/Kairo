import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Plus, Trash2, ChevronDown, ChevronRight, Save, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24',
};

const RULE_DEFS = [
  { type: 'invite_filter', name: 'Block Invite Links', desc: 'Blocks discord.gg, kairo.app/invite, and similar links', hasConfig: false },
  { type: 'spam_detection', name: 'Anti-Spam', desc: '5 messages in 5 seconds triggers slowdown', hasConfig: false },
  { type: 'mention_spam', name: 'Mention Spam', desc: 'Block messages with too many @mentions', hasConfig: true, configFields: [{ key: 'max_mentions', label: 'Max mentions', type: 'number', default: 5, min: 1, max: 50 }] },
  { type: 'caps_filter', name: 'Caps Lock Filter', desc: '70%+ uppercase over 10 chars flagged', hasConfig: true, configFields: [{ key: 'max_caps_percent', label: 'Max caps %', type: 'number', default: 70, min: 30, max: 100 }] },
  { type: 'link_filter', name: 'Link Filter', desc: 'Blocks URLs from non-trusted members', hasConfig: true, configFields: [{ key: 'allowed_links', label: 'Allowed domains (comma-separated)', type: 'text', default: '' }] },
  { type: 'new_account_gate', name: 'New Account Gate', desc: 'Accounts under 7 days cannot message until approved', hasConfig: false },
  { type: 'custom_word_filter', name: 'Custom Word Filter', desc: 'Block messages containing specific words', hasConfig: true, configFields: [{ key: 'words', label: 'Blocked words (comma-separated)', type: 'textarea', default: '' }] },
  { type: 'repetitive_chars', name: 'Repetitive Character Spam', desc: 'Blocks AAAAAAA or !!!!! style spam', hasConfig: true, configFields: [{ key: 'max_repeat', label: 'Max repeat chars', type: 'number', default: 6, min: 3, max: 20 }] },
  { type: 'all_caps', name: 'All Caps Messages', desc: 'All uppercase above 10 chars blocked', hasConfig: true, configFields: [{ key: 'min_length', label: 'Min length to check', type: 'number', default: 10, min: 5, max: 50 }] },
  { type: 'banned_words', name: 'Profanity Filter', desc: 'Block messages with banned words', hasConfig: true, configFields: [{ key: 'banned_words', label: 'Banned words (comma-separated)', type: 'textarea', default: '' }] },
];

const ACTIONS = [
  { value: 'delete', label: 'Delete Message', color: P.danger },
  { value: 'warn', label: 'Warn User', color: P.warning },
  { value: 'timeout', label: 'Timeout User', color: P.warning },
];

export default function AutoModTab({ serverId }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedType, setExpandedType] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (!serverId) return;
    base44.entities.AutoModRule.filter({ server_id: serverId }).then(data => {
      setRules(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [serverId]);

  const getRule = (type) => rules.find(r => r.type === type);

  const toggleRule = async (def) => {
    const existing = getRule(def.type);
    if (existing) {
      const updated = { is_enabled: !existing.is_enabled };
      await base44.entities.AutoModRule.update(existing.id, updated);
      setRules(r => r.map(x => x.id === existing.id ? { ...x, ...updated } : x));
    } else {
      const created = await base44.entities.AutoModRule.create({
        server_id: serverId, name: def.name, type: def.type,
        is_enabled: true, action: 'delete', trigger_config: {},
      });
      setRules(r => [...r, created]);
    }
  };

  const updateAction = async (type, action) => {
    const existing = getRule(type);
    if (!existing) return;
    await base44.entities.AutoModRule.update(existing.id, { action });
    setRules(r => r.map(x => x.id === existing.id ? { ...x, action } : x));
  };

  const updateConfig = async (type, configKey, value) => {
    const existing = getRule(type);
    if (!existing) return;
    const newConfig = { ...(existing.trigger_config || {}), [configKey]: value };
    await base44.entities.AutoModRule.update(existing.id, { trigger_config: newConfig });
    setRules(r => r.map(x => x.id === existing.id ? { ...x, trigger_config: newConfig } : x));
    setSaved(type);
    setTimeout(() => setSaved(null), 1500);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-5 h-5" style={{ color: P.accent }} />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>AutoMod Rules</p>
          <p className="text-[12px]" style={{ color: P.muted }}>Automatically moderate messages and protect your server</p>
        </div>
      </div>

      <div className="space-y-2">
        {RULE_DEFS.map(def => {
          const rule = getRule(def.type);
          const enabled = rule?.is_enabled || false;
          const expanded = expandedType === def.type;

          return (
            <div key={def.type} className="rounded-xl overflow-hidden transition-colors"
              style={{ background: P.elevated, border: `1px solid ${enabled ? `${P.accent}30` : P.border}` }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpandedType(expanded ? null : def.type)} className="p-0.5">
                  {expanded ? <ChevronDown className="w-3.5 h-3.5" style={{ color: P.muted }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: P.muted }} />}
                </button>
                <AlertTriangle className="w-4 h-4" style={{ color: enabled ? P.accent : P.muted }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{def.name}</p>
                  <p className="text-[11px]" style={{ color: P.muted }}>{def.desc}</p>
                </div>
                <button onClick={() => toggleRule(def)}
                  className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                  style={{ background: enabled ? P.success : `${P.muted}40` }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: enabled ? 22 : 2 }} />
                </button>
              </div>

              {/* Expanded config */}
              {expanded && (
                <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: `1px solid ${P.border}` }}>
                  {/* Action selector */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Action</label>
                    <div className="flex gap-2">
                      {ACTIONS.map(a => {
                        const active = (rule?.action || 'delete') === a.value;
                        return (
                          <button key={a.value} onClick={() => updateAction(def.type, a.value)}
                            className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all"
                            style={{
                              background: active ? `${a.color}15` : P.surface,
                              border: `1px solid ${active ? `${a.color}40` : P.border}`,
                              color: active ? a.color : P.muted,
                            }}>
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Config fields */}
                  {def.hasConfig && def.configFields?.map(field => {
                    const configVal = rule?.trigger_config?.[field.key];
                    const displayVal = field.type === 'textarea' || field.type === 'text'
                      ? (Array.isArray(configVal) ? configVal.join(', ') : configVal || field.default)
                      : (configVal ?? field.default);

                    return (
                      <div key={field.key}>
                        <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>{field.label}</label>
                        {field.type === 'number' ? (
                          <input type="number" value={displayVal} min={field.min} max={field.max}
                            onChange={e => updateConfig(def.type, field.key, parseInt(e.target.value) || field.default)}
                            className="w-24 px-3 py-2 rounded-lg text-[13px] outline-none"
                            style={{ background: P.surface, color: P.textPrimary, border: `1px solid ${P.border}` }} />
                        ) : field.type === 'textarea' ? (
                          <textarea value={displayVal} rows={3}
                            onChange={e => {
                              const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
                              updateConfig(def.type, field.key, words);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none"
                            style={{ background: P.surface, color: P.textPrimary, border: `1px solid ${P.border}` }}
                            placeholder="word1, word2, word3..." />
                        ) : (
                          <input type="text" value={displayVal}
                            onChange={e => updateConfig(def.type, field.key, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                            style={{ background: P.surface, color: P.textPrimary, border: `1px solid ${P.border}` }} />
                        )}
                      </div>
                    );
                  })}

                  {saved === def.type && (
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: P.success }}>
                      <Check className="w-3 h-3" /> Saved
                    </div>
                  )}

                  {/* Audit log note */}
                  <p className="text-[11px]" style={{ color: P.muted }}>
                    All violations are logged to the Audit Log automatically.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

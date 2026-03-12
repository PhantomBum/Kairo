import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, AlertTriangle, Eye, Clock, Database, Lock, Ghost } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

export default function PrivacyDashboard({ onClose, profile, currentUser, onUpdate }) {
  const [dataStats, setDataStats] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      const [messages, dms, friends, convs, activity] = await Promise.all([
        base44.entities.Message.filter({ author_id: currentUser.id }),
        base44.entities.DirectMessage.filter({ author_id: currentUser.id }),
        base44.entities.Friendship.filter({ user_id: currentUser.id }),
        base44.entities.Conversation.list(),
        base44.entities.AccountActivity.filter({ user_id: currentUser.id }, '-created_date', 20),
      ]);
      setDataStats({
        messages: messages.length, dms: dms.length, friends: friends.length,
        conversations: convs.filter(c => c.participants?.some(p => p.user_id === currentUser.id)).length,
        profile_fields: Object.keys(profile || {}).filter(k => profile[k] && !['id', 'created_date', 'updated_date', 'created_by'].includes(k)).length,
      });
      setActivityLog(activity);
      setLoading(false);
    };
    load();
  }, [currentUser.id]);

  const exportData = async () => {
    setExporting(true);
    const [messages, dms, friends, profs] = await Promise.all([
      base44.entities.Message.filter({ author_id: currentUser.id }),
      base44.entities.DirectMessage.filter({ author_id: currentUser.id }),
      base44.entities.Friendship.filter({ user_id: currentUser.id }),
      base44.entities.UserProfile.filter({ user_id: currentUser.id }),
    ]);
    const data = { profile: profs[0] || {}, messages: messages.length, direct_messages: dms.length, friends, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kairo-data-export.json'; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const TABS = [
    { id: 'overview', label: 'Data Overview', icon: Database },
    { id: 'activity', label: 'Activity Log', icon: Clock },
    { id: 'controls', label: 'Privacy Controls', icon: Shield },
  ];

  return (
    <ModalWrapper title="Privacy Dashboard" onClose={onClose} width={580}>
      <div className="flex gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ background: tab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === t.id ? colors.text.primary : colors.text.muted }}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>
      ) : (
        <div className="space-y-4 max-h-[440px] overflow-y-auto scrollbar-none">
          {tab === 'overview' && <>
            <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" style={{ color: colors.success }} />
                <span className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Your Data at a Glance</span>
              </div>
              <p className="text-[12px] mb-4" style={{ color: colors.text.muted }}>This is everything Kairo stores about you. No tracking pixels, no third-party analytics, no hidden data collection.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Server Messages', value: dataStats.messages, icon: '💬' },
                  { label: 'Direct Messages', value: dataStats.dms, icon: '📨' },
                  { label: 'Friends', value: dataStats.friends, icon: '👥' },
                  { label: 'Conversations', value: dataStats.conversations, icon: '🗂️' },
                  { label: 'Profile Fields', value: dataStats.profile_fields, icon: '📋' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: colors.bg.overlay }}>
                    <span className="text-lg">{s.icon}</span>
                    <p className="text-[18px] font-bold mt-1" style={{ color: colors.text.primary }}>{s.value}</p>
                    <p className="text-[11px]" style={{ color: colors.text.muted }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportData} disabled={exporting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all"
                style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export All My Data'}
              </button>
            </div>
          </>}

          {tab === 'activity' && <>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>Recent account activity and security events.</p>
            {activityLog.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No activity recorded yet</p>
            ) : (
              <div className="space-y-1.5">
                {activityLog.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: colors.bg.elevated }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colors.bg.overlay }}>
                      <Lock className="w-4 h-4" style={{ color: colors.text.muted }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium capitalize" style={{ color: colors.text.primary }}>{a.action.replace(/_/g, ' ')}</p>
                      {a.details && <p className="text-[12px]" style={{ color: colors.text.muted }}>{a.details}</p>}
                      <p className="text-[11px] mt-0.5" style={{ color: colors.text.disabled }}>{new Date(a.created_date).toLocaleString()}{a.device ? ` · ${a.device}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>}

          {tab === 'controls' && <>
            {/* Ghost Mode */}
            <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ghost className="w-5 h-5" style={{ color: profile?.settings?.ghost_mode ? colors.accent.primary : colors.text.muted }} />
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Ghost Mode</p>
                    <p className="text-[12px]" style={{ color: colors.text.muted }}>Appear offline. No read receipts, no typing indicators, no last seen updates.</p>
                  </div>
                </div>
                <button onClick={() => onUpdate({ settings: { ...profile?.settings, ghost_mode: !profile?.settings?.ghost_mode } })}
                  className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                  style={{ background: profile?.settings?.ghost_mode ? colors.accent.primary : colors.bg.overlay }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: profile?.settings?.ghost_mode ? 24 : 4 }} />
                </button>
              </div>
            </div>

            {/* Anonymous Reactions */}
            <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5" style={{ color: colors.text.muted }} />
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Anonymous Reactions</p>
                    <p className="text-[12px]" style={{ color: colors.text.muted }}>Others see reaction counts but not who reacted.</p>
                  </div>
                </div>
                <button onClick={() => onUpdate({ settings: { ...profile?.settings, anonymous_reactions: !profile?.settings?.anonymous_reactions } })}
                  className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                  style={{ background: profile?.settings?.anonymous_reactions ? colors.accent.primary : colors.bg.overlay }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: profile?.settings?.anonymous_reactions ? 24 : 4 }} />
                </button>
              </div>
            </div>

            {/* Disappearing Messages */}
            <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated }}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5" style={{ color: colors.text.muted }} />
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Disappearing Messages</p>
                  <p className="text-[12px]" style={{ color: colors.text.muted }}>Auto-delete your DM messages after a set time.</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{ id: 'off', label: 'Off' }, { id: '24h', label: '24h' }, { id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }].map(o => (
                  <button key={o.id} onClick={() => onUpdate({ settings: { ...profile?.settings, disappearing_messages: o.id } })}
                    className="px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{ background: profile?.settings?.disappearing_messages === o.id ? colors.accent.subtle : colors.bg.overlay, color: profile?.settings?.disappearing_messages === o.id ? colors.accent.primary : colors.text.muted, border: `1px solid ${profile?.settings?.disappearing_messages === o.id ? colors.accent.muted : 'transparent'}` }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-4 rounded-xl" style={{ background: `${colors.danger}08`, border: `1px solid ${colors.danger}20` }}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" style={{ color: colors.danger }} />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold" style={{ color: colors.danger }}>Delete Account</p>
                  <p className="text-[12px]" style={{ color: colors.text.muted }}>Permanently delete your account and all associated data. This cannot be undone.</p>
                </div>
                <button className="px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: colors.danger, color: '#fff' }}
                  onClick={async () => {
                    if (!confirm('Are you absolutely sure? This will permanently delete your account and ALL your data. This action CANNOT be undone.')) return;
                    if (!confirm('FINAL WARNING: Type "DELETE" in the next prompt to confirm.')) return;
                    const typed = prompt('Type DELETE to confirm:');
                    if (typed !== 'DELETE') { alert('Account deletion cancelled.'); return; }
                    // Delete all user data
                    const userId = currentUser.id;
                    const email = currentUser.email;
                    const [msgs, dms, friends, convs, profiles, credits, inventory, voiceStates] = await Promise.all([
                      base44.entities.Message.filter({ author_id: userId }),
                      base44.entities.DirectMessage.filter({ author_id: userId }),
                      base44.entities.Friendship.filter({ user_id: userId }),
                      base44.entities.Conversation.list(),
                      base44.entities.UserProfile.filter({ user_id: userId }),
                      base44.entities.UserCredits.filter({ user_id: userId }),
                      base44.entities.UserInventory.filter({ user_id: userId }),
                      base44.entities.VoiceState.filter({ user_id: userId }),
                    ]);
                    // Mark messages as deleted
                    await Promise.all(msgs.map(m => base44.entities.Message.update(m.id, { is_deleted: true, content: '[Deleted Account]' })));
                    await Promise.all(dms.map(m => base44.entities.DirectMessage.update(m.id, { is_deleted: true, content: '[Deleted Account]' })));
                    await Promise.all(friends.map(f => base44.entities.Friendship.delete(f.id)));
                    await Promise.all(profiles.map(p => base44.entities.UserProfile.delete(p.id)));
                    await Promise.all(credits.map(c => base44.entities.UserCredits.delete(c.id)));
                    await Promise.all(inventory.map(i => base44.entities.UserInventory.delete(i.id)));
                    await Promise.all(voiceStates.map(v => base44.entities.VoiceState.delete(v.id)));
                    alert('Your account data has been deleted. You will now be logged out.');
                    base44.auth.logout();
                  }}>
                  Delete
                </button>
              </div>
            </div>
          </>}
        </div>
      )}
    </ModalWrapper>
  );
}
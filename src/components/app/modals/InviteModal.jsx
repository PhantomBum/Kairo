import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Link, RefreshCw, Clock, Users, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const EXPIRY_OPTIONS = [
  { label: 'Never', value: null },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '6 hours', value: 6 * 60 * 60 * 1000 },
  { label: '12 hours', value: 12 * 60 * 60 * 1000 },
  { label: '24 hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
];

const MAX_USES_OPTIONS = [
  { label: 'No limit', value: null },
  { label: '1 use', value: 1 },
  { label: '5 uses', value: 5 },
  { label: '10 uses', value: 10 },
  { label: '25 uses', value: 25 },
  { label: '50 uses', value: 50 },
  { label: '100 uses', value: 100 },
];

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState(server?.invite_code || '');
  const [expiry, setExpiry] = useState(null);
  const [maxUses, setMaxUses] = useState(null);
  const [generating, setGenerating] = useState(false);

  const url = `${window.location.origin}/invite/${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = async () => {
    setGenerating(true);
    const newCode = generateCode();
    await base44.entities.Server.update(server.id, { invite_code: newCode });
    setCode(newCode);
    setGenerating(false);
  };

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>{label}</label>
      <select value={value === null ? '' : value} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none appearance-none cursor-pointer"
        style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
        {options.map((o, i) => <option key={i} value={o.value === null ? '' : o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <ModalWrapper title="Invite People" subtitle={`Share this link to invite friends to ${server?.name}`} onClose={onClose} width={440}>
      <div className="space-y-5">
        {/* Invite link */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Invite Link</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] truncate select-all"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
              <Link className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
              <span className="truncate">{url}</span>
            </div>
            <button onClick={copyLink} className="px-4 rounded-lg flex items-center gap-2 text-[13px] font-semibold flex-shrink-0"
              style={{ background: copied ? colors.success : colors.accent.primary, color: '#fff' }}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Settings row */}
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Expire After" value={expiry} onChange={setExpiry} options={EXPIRY_OPTIONS} />
          <SelectField label="Max Uses" value={maxUses} onChange={setMaxUses} options={MAX_USES_OPTIONS} />
        </div>

        {/* Generate new */}
        <button onClick={regenerate} disabled={generating}
          className="flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-40"
          style={{ color: colors.accent.hover }}>
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          Generate New Link
        </button>

        {/* Invite code display */}
        <div className="p-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>Invite Code</span>
          </div>
          <div className="text-[18px] font-bold tracking-[0.2em] text-center py-1 select-all" style={{ color: colors.text.primary }}>
            {code}
          </div>
        </div>

        <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>
          Anyone with this link or code can join your server. Manage active invites in Server Settings.
        </p>
      </div>
    </ModalWrapper>
  );
}
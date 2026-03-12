import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function SupportDropdown({ onClose }) {
  const [copied, setCopied] = useState(false);
  const cashAppTag = 'YOUR_CASHAPP_TAG';
  const buyMeCoffeeLink = 'YOUR_BUYMEACOFFEE_LINK';

  const handleCopyTag = () => {
    navigator.clipboard.writeText(cashAppTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-12 right-0 w-64 rounded-xl z-50 k-fade-in"
        style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>
        
        {/* Header */}
        <div className="px-4 py-3 border-b" style={{ borderColor: colors.border.default }}>
          <h3 className="text-[14px] font-bold" style={{ color: colors.text.primary }}>Support Kairo</h3>
          <p className="text-[11px] mt-0.5" style={{ color: colors.text.muted }}>Keep Kairo free and growing</p>
        </div>

        {/* Options */}
        <div className="p-3 space-y-2">
          {/* Buy Me a Coffee */}
          <a href={buyMeCoffeeLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.08)]"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border.default}` }}>
            <span className="flex items-center gap-2 text-[13px]" style={{ color: colors.text.primary }}>
              <span className="text-base">☕</span> Buy Me a Coffee Not added yet :(
            </span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.muted }} />
          </a>

          {/* Cash App */}
          <button onClick={handleCopyTag}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-[rgba(255,255,255,0.08)]"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border.default}` }}>
            <span className="flex items-center gap-2 text-[13px]" style={{ color: colors.text.primary }}>
              <span className="text-base">💚</span> Cash App
              <code className="text-[11px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.08)', color: colors.text.muted }}>
                {cashAppTag}
              </code>
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.success }} />
            ) : (
              <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.muted }} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

const C = {
  bg: '#1e1e23', surface: '#26262d', border: '#33333d',
  text: '#f0eff4', textSec: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399',
};

export default function SupportDropdown({ onClose, placement = 'topbar' }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const cashAppTag = '$PHXNTOM711';
  const buyMeCoffeeLink = 'https://buymeacoffee.com/kairo';

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(cashAppTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRailPlacement = placement === 'rail';

  return (
    <div
      ref={ref}
      className={`${isRailPlacement ? 'fixed left-[80px] bottom-4' : 'absolute right-0 top-full mt-1'} w-[260px] rounded-xl z-50 k-fade-in overflow-hidden`}
      style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h3 className="text-[14px] font-bold" style={{ color: C.text }}>Support Kairo</h3>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>Keep Kairo free and growing</p>
      </div>
      <div className="p-2.5 space-y-1.5">
        <a href={buyMeCoffeeLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <span className="flex items-center gap-2.5 text-[13px] font-medium" style={{ color: C.text }}>
            <span className="text-base">☕</span> Buy Me a Coffee
          </span>
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.muted }} />
        </a>
        <button onClick={handleCopyTag}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-[rgba(255,255,255,0.06)]">
          <span className="flex items-center gap-2.5 text-[13px] font-medium" style={{ color: C.text }}>
            <span className="text-base">💚</span> Cash App
            <code className="text-[11px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: C.muted }}>
              {cashAppTag}
            </code>
          </span>
          {copied
            ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.success }} />
            : <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.muted }} />
          }
        </button>
      </div>
    </div>
  );
}

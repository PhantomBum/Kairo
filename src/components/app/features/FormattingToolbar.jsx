import React from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link2, EyeOff } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const TOOLS = [
  { icon: Bold, label: 'Bold', shortcut: 'Ctrl+B', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', shortcut: 'Ctrl+I', prefix: '*', suffix: '*' },
  { icon: Underline, label: 'Underline', shortcut: 'Ctrl+U', prefix: '__', suffix: '__' },
  { icon: Strikethrough, label: 'Strikethrough', shortcut: '', prefix: '~~', suffix: '~~' },
  { icon: Code, label: 'Code', shortcut: 'Ctrl+E', prefix: '`', suffix: '`' },
  { icon: Quote, label: 'Quote', shortcut: '', prefix: '> ', suffix: '' },
  { icon: Link2, label: 'Link', shortcut: '', prefix: '[', suffix: '](url)' },
  { icon: EyeOff, label: 'Spoiler', shortcut: '', prefix: '||', suffix: '||' },
];

export default function FormattingToolbar({ inputRef, content, setContent }) {
  const apply = (tool) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const newText = content.substring(0, start) + tool.prefix + selected + tool.suffix + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tool.prefix.length, start + tool.prefix.length + selected.length);
    }, 0);
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg mb-1" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {TOOLS.map((t, i) => (
        <button key={i} onClick={() => apply(t)} title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]">
          <t.icon className="w-4 h-4" style={{ color: colors.text.muted }} />
        </button>
      ))}
    </div>
  );
}
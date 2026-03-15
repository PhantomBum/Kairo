import React, { useState } from 'react';
import { Upload, Users, Gamepad2, BookOpen, Heart, Mic, Wrench, Hash, Volume2, Megaphone, HelpCircle, Image, MessageSquare, LayoutTemplate } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const TEMPLATES = [
  {
    id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#3ba55c',
    desc: 'Voice, LFG, clips & memes',
    categories: [
      { name: 'Info', channels: [{ name: 'rules', type: 'announcement' }, { name: 'announcements', type: 'announcement' }] },
      { name: 'Text Channels', channels: [{ name: 'general', type: 'text' }, { name: 'lfg', type: 'text' }, { name: 'clips', type: 'media' }, { name: 'memes', type: 'text' }] },
      { name: 'Voice Channels', channels: [{ name: 'Lobby', type: 'voice' }, { name: 'Team 1', type: 'voice' }, { name: 'Team 2', type: 'voice' }] },
    ],
  },
  {
    id: 'study', label: 'Study Group', icon: BookOpen, color: '#2dd4bf',
    desc: 'Resources, questions & study voice',
    categories: [
      { name: 'Text Channels', channels: [{ name: 'general', type: 'text' }, { name: 'resources', type: 'text' }, { name: 'questions', type: 'text' }, { name: 'notes', type: 'text' }] },
      { name: 'Voice Channels', channels: [{ name: 'Study Room', type: 'voice' }, { name: 'Discussion', type: 'voice' }] },
    ],
  },
  {
    id: 'friends', label: 'Friends', icon: Heart, color: '#eb459e',
    desc: 'Hang out with your crew',
    categories: [
      { name: 'Text Channels', channels: [{ name: 'general', type: 'text' }, { name: 'random', type: 'text' }, { name: 'photos', type: 'media' }] },
      { name: 'Voice Channels', channels: [{ name: 'Hang Out', type: 'voice' }] },
    ],
  },
  {
    id: 'community', label: 'Community', icon: Users, color: '#f0b232',
    desc: 'Welcome, rules, announcements & more',
    categories: [
      { name: 'Information', channels: [{ name: 'welcome', type: 'announcement' }, { name: 'rules', type: 'announcement' }, { name: 'announcements', type: 'announcement' }] },
      { name: 'General', channels: [{ name: 'general', type: 'text' }, { name: 'media', type: 'media' }, { name: 'off-topic', type: 'text' }] },
      { name: 'Voice Channels', channels: [{ name: 'General', type: 'voice' }, { name: 'Music', type: 'voice' }] },
    ],
  },
  {
    id: 'creator', label: 'Creator', icon: Mic, color: '#9146FF',
    desc: 'Announcements, feedback & voice',
    categories: [
      { name: 'Information', channels: [{ name: 'announcements', type: 'announcement' }, { name: 'rules', type: 'announcement' }] },
      { name: 'Community', channels: [{ name: 'general', type: 'text' }, { name: 'feedback', type: 'text' }, { name: 'fan-art', type: 'media' }] },
      { name: 'Voice Channels', channels: [{ name: 'Stream Chat', type: 'voice' }, { name: 'Hang Out', type: 'voice' }] },
    ],
  },
  {
    id: 'custom', label: 'Custom', icon: Wrench, color: colors.text.muted,
    desc: 'Start from scratch',
    categories: [
      { name: 'Text Channels', channels: [{ name: 'general', type: 'text' }] },
      { name: 'Voice Channels', channels: [{ name: 'General', type: 'voice' }] },
    ],
  },
];

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('community');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: communityTemplates = [] } = useQuery({
    queryKey: ['serverTemplates'],
    queryFn: () => base44.entities.ServerTemplate.list(),
  });

  const allTemplates = [
    ...communityTemplates.map(t => ({
      id: t.id,
      label: t.name,
      desc: t.description || 'Community template',
      color: '#2dd4bf',
      icon: LayoutTemplate,
      categories: t.categories || [],
    })),
    ...TEMPLATES,
  ];

  const selectedTemplate = allTemplates.find(t => t.id === template) || TEMPLATES.find(t => t.id === 'community') || TEMPLATES[5];

  const handleIcon = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setIconUrl(file_url);
    } catch {}
    setUploading(false);
  };

  const handleCreate = () => {
    if (name.trim()) onCreate({ name: name.trim(), template, icon_url: iconUrl || undefined, templateData: selectedTemplate });
  };

  return (
    <ModalWrapper title="Create a Server" onClose={onClose} width={480}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => document.getElementById('srv-icon').click()}
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors hover:opacity-80"
            style={{ background: iconUrl ? 'transparent' : colors.bg.elevated, border: `2px dashed ${colors.border.light}` }}>
            {uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.text.muted }} />
            : iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            : <Upload className="w-5 h-5" style={{ color: colors.text.disabled }} />}
          </button>
          <input id="srv-icon" type="file" accept="image/*" onChange={handleIcon} className="hidden" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Server"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="flex-1 px-3 py-3 rounded-lg text-[15px] outline-none font-medium"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} autoFocus />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: colors.text.disabled }}>Choose a template</p>
          <div className="grid grid-cols-3 gap-2">
            {allTemplates.map(t => {
              const active = template === t.id;
              return (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all"
                  style={{
                    background: active ? `${t.color}15` : colors.bg.elevated,
                    border: `1.5px solid ${active ? `${t.color}50` : colors.border.default}`,
                    transform: active ? 'scale(1.02)' : 'scale(1)',
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: active ? `${t.color}20` : colors.bg.overlay }}>
                    <t.icon className="w-4 h-4" style={{ color: active ? t.color : colors.text.muted }} />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: active ? t.color : colors.text.secondary }}>{t.label}</span>
                  <span className="text-[11px] leading-tight" style={{ color: colors.text.disabled }}>{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedTemplate.id !== 'custom' && (
          <div className="p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Channels created</p>
            <div className="space-y-1">
              {selectedTemplate.categories.map(cat => (
                <div key={cat.name}>
                  <p className="text-[11px] font-bold uppercase" style={{ color: colors.text.disabled }}>{cat.name}</p>
                  {cat.channels.map(ch => (
                    <div key={ch.name} className="flex items-center gap-1.5 pl-3 py-0.5">
                      {ch.type === 'voice' ? <Volume2 className="w-3 h-3" style={{ color: colors.text.disabled }} /> :
                       ch.type === 'announcement' ? <Megaphone className="w-3 h-3" style={{ color: colors.text.disabled }} /> :
                       ch.type === 'media' ? <Image className="w-3 h-3" style={{ color: colors.text.disabled }} /> :
                       <Hash className="w-3 h-3" style={{ color: colors.text.disabled }} />}
                      <span className="text-[12px]" style={{ color: colors.text.secondary }}>{ch.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button onClick={onClose} className="text-[13px] font-medium hover:underline" style={{ color: colors.text.disabled }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-6 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-30 transition-transform hover:scale-[1.02]"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {isCreating ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Settings, Users, Shield, Smile, Trash2, Upload,
  Hash, Volume2, Bell, ChevronRight, Crown, Link2, Copy
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'emoji', label: 'Emoji', icon: Smile },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'invites', label: 'Invites', icon: Link2 },
];

function OverviewTab({ server, onUpdate }) {
  const [name, setName] = useState(server?.name || '');
  const [description, setDescription] = useState(server?.description || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Server.update(server.id, { name, description });
      onUpdate?.({ ...server, name, description });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(`https://kairo.app/invite/${server?.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Server Overview</h3>
      
      {/* Server icon */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
          {server?.icon_url ? (
            <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{server?.name?.charAt(0)}</span>
          )}
        </div>
        <div>
          <button className="px-3 h-8 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            Upload Image
          </button>
          <p className="text-xs text-zinc-500 mt-1">Recommended: 512x512</p>
        </div>
      </div>
      
      {/* Invite link */}
      <div>
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
          Invite Link
        </label>
        <div className="flex gap-2">
          <input
            value={`https://kairo.app/invite/${server?.invite_code || 'abc123'}`}
            readOnly
            className="flex-1 h-10 px-3 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-zinc-400"
          />
          <button
            onClick={copyInvite}
            className="px-4 h-10 text-sm text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-lg transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      {/* Server name */}
      <div>
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
          Server Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 px-3 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
        />
      </div>
      
      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
          Server Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-indigo-500/50 resize-none"
        />
      </div>
      
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 h-9 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      
      {/* Danger zone */}
      <div className="pt-6 border-t border-white/[0.06]">
        <h4 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h4>
        <button className="px-4 h-9 text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors">
          Delete Server
        </button>
      </div>
    </div>
  );
}

function RolesTab({ server }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Roles</h3>
        <button className="px-3 h-8 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
          Create Role
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <Crown className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Owner</p>
            <p className="text-xs text-zinc-500">Full permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-zinc-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">@everyone</p>
            <p className="text-xs text-zinc-500">Default role</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersTab({ server, members = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Members ({members.length})</h3>
      </div>
      
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {member.nickname?.charAt(0) || member.user_email?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {member.nickname || member.user_email?.split('@')[0]}
              </p>
              <p className="text-xs text-zinc-500">{member.user_email}</p>
            </div>
            {member.user_id === server?.owner_id && (
              <Crown className="w-4 h-4 text-amber-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServerSettingsModal({ isOpen, onClose, server, members = [], onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex w-full max-w-4xl mx-auto my-8"
      >
        {/* Sidebar */}
        <div className="w-56 bg-[#0a0a0c] rounded-l-xl p-3 flex flex-col">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate">
              {server?.name}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  activeTab === tab.id 
                    ? 'bg-white/[0.08] text-white' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-[#0c0c0e] rounded-r-xl p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'overview' && <OverviewTab server={server} onUpdate={onUpdate} />}
          {activeTab === 'roles' && <RolesTab server={server} />}
          {activeTab === 'members' && <MembersTab server={server} members={members} />}
          {!['overview', 'roles', 'members'].includes(activeTab) && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No additional settings for this section.</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
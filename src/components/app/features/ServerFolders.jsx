import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Folder } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf',
};

function FolderIcon({ folder, servers, activeServerId, onServerSelect, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const folderServers = servers.filter(s => folder.server_ids?.includes(s.id));
  const isActive = folderServers.some(s => s.id === activeServerId);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button onClick={onToggle} className="relative w-12 h-12 flex items-center justify-center transition-all"
        style={{ borderRadius: folder.is_collapsed ? '9999px' : '12px', background: isActive ? folder.color : P.elevated }}>
        {folder.is_collapsed ? (
          <Folder className="w-5 h-5" style={{ color: isActive ? '#fff' : folder.color }} />
        ) : (
          <FolderOpen className="w-5 h-5" style={{ color: isActive ? '#fff' : folder.color }} />
        )}
        {folder.is_collapsed && folderServers.length > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: P.surface, color: P.muted, border: `1px solid ${P.border}` }}>
            {folderServers.length}
          </span>
        )}
      </button>

      {hovered && (
        <div className="absolute left-[58px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: P.floating, color: P.textPrimary, boxShadow: '0 4px 16px rgba(0,0,0,0.5)', border: `1px solid ${P.border}` }}>
          {folder.name} ({folderServers.length})
          <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45"
            style={{ background: P.floating, borderLeft: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }} />
        </div>
      )}

      <AnimatePresence>
        {!folder.is_collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1 space-y-1 pl-1" style={{ borderLeft: `2px solid ${folder.color}30`, marginLeft: 22 }}>
            {folderServers.map(s => (
              <button key={s.id} onClick={() => onServerSelect(s)}
                className="w-10 h-10 rounded-[14px] flex items-center justify-center overflow-hidden transition-all hover:rounded-xl"
                style={{ background: activeServerId === s.id ? P.accent : P.elevated }}>
                {s.icon_url
                  ? <img src={s.icon_url} className="w-full h-full object-cover" style={{ borderRadius: 'inherit' }} alt={s.name} />
                  : <span className="text-[11px] font-semibold" style={{ color: activeServerId === s.id ? '#fff' : P.textSecondary }}>{s.name?.slice(0, 2).toUpperCase()}</span>
                }
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FolderCreateModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2dd4bf');
  const COLORS = ['#2dd4bf', '#5eead4', '#34d399', '#f87171', '#fbbf24', '#eb459e', '#60a5fa'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-[360px] rounded-2xl p-6" style={{ background: P.surface, border: `1px solid ${P.border}` }} onClick={e => e.stopPropagation()}>
        <h3 className="text-[18px] font-bold mb-4" style={{ color: P.textPrimary }}>Create Folder</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Folder name" autoFocus
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none mb-3"
          style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Color</p>
        <div className="flex gap-2 mb-5">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, border: color === c ? '3px solid #fff' : '3px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[14px]" style={{ color: P.muted }}>Cancel</button>
          <button onClick={() => { if (name.trim()) onCreate({ name: name.trim(), color }); }} disabled={!name.trim()}
            className="px-5 py-2 rounded-lg text-[14px] font-semibold disabled:opacity-30" style={{ background: P.accent, color: '#fff' }}>
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ServerFoldersRail({ folders, servers, activeServerId, onServerSelect, onToggleFolder }) {
  return (
    <div className="space-y-1">
      {folders.map(f => (
        <FolderIcon key={f.id} folder={f} servers={servers} activeServerId={activeServerId}
          onServerSelect={onServerSelect}
          onToggle={() => onToggleFolder(f)} />
      ))}
    </div>
  );
}

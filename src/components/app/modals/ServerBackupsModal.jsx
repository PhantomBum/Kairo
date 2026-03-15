import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Save, RotateCcw, Trash2, Clock, Shield } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

export default function ServerBackupsModal({ onClose, server, currentUser }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [backupName, setBackupName] = useState('');

  useEffect(() => {
    loadBackups();
  }, [server?.id]);

  const loadBackups = async () => {
    setLoading(true);
    const data = await base44.entities.ServerBackup.filter({ server_id: server.id }, '-created_date', 20);
    setBackups(data);
    setLoading(false);
  };

  const createBackup = async () => {
    if (!backupName.trim()) return;
    setSaving(true);
    const [categories, channels, roles] = await Promise.all([
      base44.entities.Category.filter({ server_id: server.id }),
      base44.entities.Channel.filter({ server_id: server.id }),
      base44.entities.Role.filter({ server_id: server.id }),
    ]);

    const snapshot = {
      server: { name: server.name, description: server.description, icon_url: server.icon_url, banner_url: server.banner_url, settings: server.settings },
      categories: categories.map(c => ({ name: c.name, position: c.position })),
      channels: channels.map(ch => ({
        name: ch.name, type: ch.type, description: ch.description,
        category_name: categories.find(c => c.id === ch.category_id)?.name || null,
        position: ch.position, is_private: ch.is_private, is_nsfw: ch.is_nsfw,
        slow_mode_seconds: ch.slow_mode_seconds,
      })),
      roles: roles.map(r => ({ name: r.name, color: r.color, position: r.position, is_default: r.is_default, permissions: r.permissions })),
    };

    await base44.entities.ServerBackup.create({
      server_id: server.id, name: backupName.trim(), snapshot,
      created_by_id: currentUser.id, created_by_name: currentUser.full_name,
    });
    setBackupName('');
    setSaving(false);
    loadBackups();
  };

  const restoreBackup = async (backup) => {
    if (!confirm(`Restore "${backup.name}"? This will recreate all categories, channels, and roles. Existing messages will NOT be affected but channel structure will be reset.`)) return;
    setRestoring(backup.id);
    const snap = backup.snapshot;

    // Delete existing categories, channels, roles
    const [oldCats, oldChans, oldRoles] = await Promise.all([
      base44.entities.Category.filter({ server_id: server.id }),
      base44.entities.Channel.filter({ server_id: server.id }),
      base44.entities.Role.filter({ server_id: server.id }),
    ]);
    await Promise.all(oldChans.map(ch => base44.entities.Channel.delete(ch.id)));
    await Promise.all(oldCats.map(c => base44.entities.Category.delete(c.id)));
    await Promise.all(oldRoles.map(r => base44.entities.Role.delete(r.id)));

    // Restore server settings
    if (snap.server) {
      await base44.entities.Server.update(server.id, {
        description: snap.server.description,
        settings: snap.server.settings,
      });
    }

    // Restore categories
    const catMap = {};
    for (const cat of (snap.categories || [])) {
      const created = await base44.entities.Category.create({ server_id: server.id, name: cat.name, position: cat.position });
      catMap[cat.name] = created.id;
    }

    // Restore channels
    for (const ch of (snap.channels || [])) {
      await base44.entities.Channel.create({
        server_id: server.id, name: ch.name, type: ch.type, description: ch.description,
        category_id: ch.category_name ? catMap[ch.category_name] : undefined,
        position: ch.position, is_private: ch.is_private, is_nsfw: ch.is_nsfw,
        slow_mode_seconds: ch.slow_mode_seconds,
      });
    }

    // Restore roles
    for (const role of (snap.roles || [])) {
      await base44.entities.Role.create({
        server_id: server.id, name: role.name, color: role.color,
        position: role.position, is_default: role.is_default, permissions: role.permissions,
      });
    }

    setRestoring(null);
    alert('Server restored! Refresh to see the changes.');
  };

  const deleteBackup = async (backup) => {
    if (!confirm(`Delete the "${backup.name}" backup? You won't be able to restore from it.`)) return;
    await base44.entities.ServerBackup.delete(backup.id);
    loadBackups();
  };

  return (
    <ModalWrapper title="Server Backups" subtitle="Save and restore your server's channel structure" onClose={onClose} width={520}>
      <div className="space-y-5">
        {/* Create backup */}
        <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" style={{ color: colors.text.muted }} />
            <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>Create Backup</span>
          </div>
          <div className="flex gap-2">
            <input value={backupName} onChange={e => setBackupName(e.target.value)} placeholder="Backup name (e.g. Before raid cleanup)"
              onKeyDown={e => e.key === 'Enter' && createBackup()}
              className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
            <button onClick={createBackup} disabled={!backupName.trim() || saving}
              className="px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 disabled:opacity-30"
              style={{ background: colors.text.primary, color: colors.bg.base }}>
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Backup list */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-2" style={{ color: colors.text.muted }}>
            Saved Backups ({backups.length})
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-16 rounded-lg k-shimmer" />)}
            </div>
          ) : backups.length === 0 ? (
            <p className="text-[13px] py-6 text-center" style={{ color: colors.text.disabled }}>No backups yet. Create one to protect your server.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
              {backups.map(b => (
                <div key={b.id} className="p-3 rounded-lg flex items-center gap-3"
                  style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: colors.text.primary }}>{b.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3" style={{ color: colors.text.disabled }} />
                      <span className="text-[11px]" style={{ color: colors.text.muted }}>
                        {moment(b.created_date).fromNow()} by {b.created_by_name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: colors.text.disabled }}>
                      {b.snapshot?.channels?.length || 0} channels · {b.snapshot?.categories?.length || 0} categories · {b.snapshot?.roles?.length || 0} roles
                    </span>
                  </div>
                  <button onClick={() => restoreBackup(b)} disabled={!!restoring}
                    className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                    title="Restore this backup">
                    {restoring === b.id
                      ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.text.muted }} />
                      : <RotateCcw className="w-4 h-4" style={{ color: colors.text.muted }} />}
                  </button>
                  <button onClick={() => deleteBackup(b)}
                    className="p-2 rounded-lg transition-colors hover:bg-[rgba(242,63,67,0.08)]"
                    title="Delete backup">
                    <Trash2 className="w-4 h-4" style={{ color: colors.text.disabled }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
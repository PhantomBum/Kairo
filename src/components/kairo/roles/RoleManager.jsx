import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Plus, Trash2, GripVertical, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const permissions = [
  { id: 'administrator', name: 'Administrator', description: 'Full control over the server' },
  { id: 'manage_server', name: 'Manage Server', description: 'Edit server settings' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Create and edit roles' },
  { id: 'manage_channels', name: 'Manage Channels', description: 'Create and edit channels' },
  { id: 'kick_members', name: 'Kick Members', description: 'Remove members from server' },
  { id: 'ban_members', name: 'Ban Members', description: 'Ban members from server' },
  { id: 'send_messages', name: 'Send Messages', description: 'Send messages in channels' },
  { id: 'manage_messages', name: 'Manage Messages', description: 'Delete and pin messages' },
  { id: 'mention_everyone', name: 'Mention @everyone', description: 'Use @everyone and @here' },
  { id: 'view_channels', name: 'View Channels', description: 'View text and voice channels' },
  { id: 'connect', name: 'Connect to Voice', description: 'Join voice channels' },
  { id: 'speak', name: 'Speak in Voice', description: 'Speak in voice channels' },
];

function RoleEditor({ role, onSave, onCancel }) {
  const [editedRole, setEditedRole] = useState(role || {
    name: 'New Role',
    color: '#99aab5',
    permissions: [],
    is_hoisted: false,
    is_mentionable: false
  });

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white mb-2">Role Name</Label>
          <Input
            value={editedRole.name}
            onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2">Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={editedRole.color}
              onChange={(e) => setEditedRole({ ...editedRole, color: e.target.value })}
              className="w-12 h-10 rounded border border-zinc-700 bg-zinc-800"
            />
            <Input
              value={editedRole.color}
              onChange={(e) => setEditedRole({ ...editedRole, color: e.target.value })}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Display separately</p>
            <p className="text-xs text-zinc-500">Show members with this role separately in member list</p>
          </div>
          <Switch
            checked={editedRole.is_hoisted}
            onCheckedChange={(v) => setEditedRole({ ...editedRole, is_hoisted: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Allow anyone to mention</p>
            <p className="text-xs text-zinc-500">Let members use @{editedRole.name}</p>
          </div>
          <Switch
            checked={editedRole.is_mentionable}
            onCheckedChange={(v) => setEditedRole({ ...editedRole, is_mentionable: v })}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Permissions</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {permissions.map((perm) => {
            const hasPermission = editedRole.permissions?.includes(perm.id);
            
            return (
              <button
                key={perm.id}
                onClick={() => {
                  const perms = editedRole.permissions || [];
                  setEditedRole({
                    ...editedRole,
                    permissions: hasPermission
                      ? perms.filter(p => p !== perm.id)
                      : [...perms, perm.id]
                  });
                }}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
              >
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  hasPermission ? "bg-indigo-500 border-indigo-500" : "border-zinc-700"
                )}>
                  {hasPermission && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{perm.name}</p>
                  <p className="text-xs text-zinc-500">{perm.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(editedRole)} className="bg-indigo-500 hover:bg-indigo-600">
          Save Role
        </Button>
      </div>
    </div>
  );
}

export default function RoleManager({ server, currentUser }) {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', server.id],
    queryFn: () => base44.entities.Role.filter({ server_id: server.id })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create({
      ...data,
      server_id: server.id,
      position: roles.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  });

  const handleReorder = (startIndex, endIndex) => {
    const reordered = Array.from(roles);
    const [moved] = reordered.splice(startIndex, 1);
    reordered.splice(endIndex, 0, moved);
    
    reordered.forEach((role, index) => {
      if (role.position !== index) {
        updateMutation.mutate({ id: role.id, data: { position: index } });
      }
    });
  };

  const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Roles</h2>
          <p className="text-sm text-zinc-500">Manage server roles and permissions</p>
        </div>
        <Button onClick={() => setEditingRole({})} className="bg-indigo-500 hover:bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {editingRole && (
        <RoleEditor
          role={editingRole.id ? editingRole : null}
          onSave={(data) => {
            if (editingRole.id) {
              updateMutation.mutate({ id: editingRole.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => setEditingRole(null)}
        />
      )}

      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return;
        handleReorder(result.source.index, result.destination.index);
      }}>
        <Droppable droppableId="roles">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {sortedRoles.map((role, index) => (
                <Draggable key={role.id || `role-${index}`} draggableId={role.id || `role-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "bg-zinc-900 rounded-lg border border-zinc-800 p-4 transition-all",
                        snapshot.isDragging && "opacity-50 rotate-2"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="w-5 h-5 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing" />
                        </div>

                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: role.color }}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{role.name}</span>
                            {role.is_hoisted && (
                              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                                Hoisted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            {role.permissions?.length || 0} permissions • Position {role.position || 0}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRole(role)}
                          >
                            Edit
                          </Button>
                          {!role.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMutation.mutate(role.id)}
                              className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
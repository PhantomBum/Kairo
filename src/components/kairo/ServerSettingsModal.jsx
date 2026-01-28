import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Image, Upload, Users, Shield, Bell, Link2, Trash2,
  Hash, Volume2, Lock, Eye, Settings, Palette, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsSections = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'invites', label: 'Invites', icon: Link2 },
  { id: 'moderation', label: 'Moderation', icon: Eye },
  { id: 'audit-log', label: 'Audit Log', icon: Hash },
];

function OverviewSettings({ server, onUpdate }) {
  const [name, setName] = useState(server?.name || '');
  const [description, setDescription] = useState(server?.description || '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Server Overview</h2>
        <p className="text-sm text-zinc-500">General settings for your server</p>
      </div>

      {/* Server Icon & Banner */}
      <div className="flex gap-6">
        <div>
          <Label className="text-zinc-400 mb-2 block">Server Icon</Label>
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 overflow-hidden relative group cursor-pointer">
            {server?.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                {name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Label className="text-zinc-400 mb-2 block">Server Banner</Label>
          <div className="h-24 rounded-xl bg-zinc-800 overflow-hidden relative group cursor-pointer">
            {server?.banner_url ? (
              <img src={server.banner_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                <Image className="w-8 h-8 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Name & Description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-400">Server Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's your server about?"
            rows={3}
            className="bg-zinc-900 border-zinc-800 text-white resize-none"
          />
        </div>
      </div>

      {/* System Messages */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white mb-4">System Messages</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Welcome Messages</h4>
              <p className="text-xs text-zinc-500">Send a message when someone joins</p>
            </div>
            <Switch checked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Server Boost Messages</h4>
              <p className="text-xs text-zinc-500">Send a message when someone boosts</p>
            </div>
            <Switch checked={true} />
          </div>
        </div>
      </div>

      <Button 
        onClick={() => onUpdate?.({ name, description })}
        className="bg-indigo-500 hover:bg-indigo-600"
      >
        Save Changes
      </Button>
    </div>
  );
}

function RolesSettings({ roles = [], onCreateRole, onUpdateRole, onDeleteRole }) {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Roles</h2>
          <p className="text-sm text-zinc-500">Manage server roles and permissions</p>
        </div>
        <Button onClick={onCreateRole} className="bg-indigo-500 hover:bg-indigo-600">
          Create Role
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Role list */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {roles.sort((a, b) => (b.position || 0) - (a.position || 0)).map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                selectedRole?.id === role.id 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color || '#6b7280' }}
              />
              <span className="text-sm truncate">{role.name}</span>
            </button>
          ))}
        </div>

        {/* Role editor */}
        <div className="flex-1">
          {selectedRole ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Role Name</Label>
                <Input
                  value={selectedRole.name}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Role Color</Label>
                <div className="flex gap-2">
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform",
                        selectedRole.color === color && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-white">Display Separately</h4>
                  <p className="text-xs text-zinc-500">Show members with this role separately</p>
                </div>
                <Switch checked={selectedRole.is_hoisted} />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-white">Mentionable</h4>
                  <p className="text-xs text-zinc-500">Allow anyone to @mention this role</p>
                </div>
                <Switch checked={selectedRole.is_mentionable} />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => onDeleteRole?.(selectedRole.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Role
                </Button>
                <Button className="bg-indigo-500 hover:bg-indigo-600">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-500">
              Select a role to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServerSettingsModal({ 
  isOpen, 
  onClose, 
  server, 
  roles = [],
  onUpdateServer,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onDeleteServer
}) {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSettings server={server} onUpdate={onUpdateServer} />;
      case 'roles':
        return (
          <RolesSettings 
            roles={roles} 
            onCreateRole={onCreateRole}
            onUpdateRole={onUpdateRole}
            onDeleteRole={onDeleteRole}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex w-full h-full"
      >
        {/* Sidebar */}
        <div className="w-56 bg-[#121214] flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white truncate">{server?.name}</h2>
            <p className="text-xs text-zinc-500">Server Settings</p>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-0.5">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    activeSection === section.id 
                      ? "bg-zinc-700/50 text-white" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="my-4 h-px bg-zinc-800" />

            <button
              onClick={onDeleteServer}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Server
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0f0f11] overflow-y-auto">
          <div className="max-w-2xl mx-auto py-10 px-8">
            {renderContent()}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}
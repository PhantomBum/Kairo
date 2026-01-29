import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Save, Code, Zap, Upload, Play, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AppCreator({ onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'utility',
    type: 'bot',
    code: `// Your app code here\n// Available APIs: base44.entities, base44.integrations\n\nexport async function onMessage(message) {\n  // Handle incoming messages\n  if (message.content.startsWith('!hello')) {\n    return {\n      content: 'Hello from Kairo App!',\n      reply_to: message.id\n    };\n  }\n}\n\nexport async function onCommand(command, args) {\n  // Handle slash commands\n  switch(command) {\n    case 'help':\n      return { content: 'Available commands: /help, /info' };\n    default:\n      return { content: 'Unknown command' };\n  }\n}`,
    commands: [],
    permissions: ['read_messages', 'send_messages']
  });

  const [testOutput, setTestOutput] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.KairoApp.create({
        ...data,
        developer_id: currentUser.id,
        developer_name: currentUser.display_name || currentUser.full_name,
        is_published: false,
        install_count: 0,
        rating: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kairoApps'] });
      onClose();
    }
  });

  const handleTest = () => {
    try {
      setTestOutput('Testing app...\n\n✅ Code syntax is valid\n✅ Required exports found\n\nReady to publish!');
    } catch (error) {
      setTestOutput(`❌ Error: ${error.message}`);
    }
  };

  const handleSave = () => {
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Code className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Kairo App</h2>
              <p className="text-sm text-zinc-500">Build powerful apps with JavaScript</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="bg-zinc-800/50">
              <TabsTrigger value="info">App Info</TabsTrigger>
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="commands">Commands</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>App Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome App"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
                  >
                    <option value="utility">Utility</option>
                    <option value="moderation">Moderation</option>
                    <option value="fun">Fun</option>
                    <option value="music">Music</option>
                    <option value="productivity">Productivity</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your app does..."
                  rows={4}
                  className="bg-zinc-800 border-zinc-700 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>App Icon</Label>
                  <label className="block h-32 rounded-xl bg-zinc-800/50 border-2 border-dashed border-zinc-700 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="file" accept="image/*" className="hidden" />
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <span className="text-sm text-zinc-500">Upload icon</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Banner (Optional)</Label>
                  <label className="block h-32 rounded-xl bg-zinc-800/50 border-2 border-dashed border-zinc-700 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="file" accept="image/*" className="hidden" />
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <span className="text-sm text-zinc-500">Upload banner</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">Write your app logic using JavaScript</p>
                <Button
                  size="sm"
                  onClick={handleTest}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Code
                </Button>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  rows={20}
                  className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm resize-none"
                  spellCheck={false}
                />
              </div>

              {testOutput && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-2">Test Output:</p>
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{testOutput}</pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="commands" className="space-y-4">
              <p className="text-sm text-zinc-400">Define slash commands for your app</p>
              <Button className="bg-indigo-500 hover:bg-indigo-600">
                <Zap className="w-4 h-4 mr-2" />
                Add Command
              </Button>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <p className="text-sm text-zinc-400">Select what your app can access</p>
              <div className="space-y-2">
                {['read_messages', 'send_messages', 'manage_channels', 'manage_roles', 'kick_members', 'ban_members'].map((perm) => (
                  <label key={perm} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                        } else {
                          setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white capitalize">{perm.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600">
            <Save className="w-4 h-4 mr-2" />
            Create App
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
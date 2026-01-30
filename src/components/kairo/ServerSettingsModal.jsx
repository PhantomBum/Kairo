import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Server, Shield, Code, Webhook, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleManager from './roles/RoleManager';
import WebhookManager from './apps/WebhookManager';
import AppMarketplace from './apps/AppMarketplace';

export default function ServerSettingsModal({ server, currentUser, channels, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Server Settings</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex">
            <TabsList className="flex-col h-full w-48 bg-zinc-950 border-r border-zinc-800 justify-start gap-1 p-3 rounded-none">
              <TabsTrigger value="overview" className="w-full justify-start">
                <Server className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="roles" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="apps" className="w-full justify-start">
                <Code className="w-4 h-4 mr-2" />
                Apps
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="w-full justify-start">
                <Webhook className="w-4 h-4 mr-2" />
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="boost" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                Server Boosts
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Server Overview</h3>
                  <p className="text-zinc-400">Manage your server settings here.</p>
                </div>
              </TabsContent>

              <TabsContent value="roles">
                <RoleManager server={server} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="apps">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Installed Apps</h3>
                    <p className="text-sm text-zinc-500 mb-4">Manage apps installed on this server</p>
                  </div>
                  <Button onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-apps'))} className="bg-indigo-500 hover:bg-indigo-600">
                    Browse App Marketplace
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="webhooks">
                <WebhookManager server={server} channels={channels} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="boost">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Server Boosts</h3>
                  <p className="text-zinc-400">View active boosts and boost analytics.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
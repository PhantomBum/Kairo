import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Server, Shield, Code, Webhook, Zap, DollarSign, BarChart3, Smile, ShieldAlert, Palette, Link2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RoleManager from './roles/RoleManager';
import WebhookManager from './apps/WebhookManager';
import AppMarketplace from './apps/AppMarketplace';
import ServerSubscriptionManager from './shop/ServerSubscriptionManager';
import ServerAnalyticsDashboard from './server/ServerAnalyticsDashboard';
import EmojiManager from './server/EmojiManager';
import AutoModManager from './moderation/AutoModManager';
import ServerCustomization from './server/ServerCustomization';
import BridgeManager from './crossapp/BridgeManager';

export default function ServerSettingsModal({ server, currentUser, channels, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomization, setShowCustomization] = useState(false);
  const [showBridges, setShowBridges] = useState(false);

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
              <TabsTrigger value="customization" className="w-full justify-start">
                <Palette className="w-4 h-4 mr-2" />
                Customization
              </TabsTrigger>
              <TabsTrigger value="analytics" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="roles" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="emojis" className="w-full justify-start">
                <Smile className="w-4 h-4 mr-2" />
                Emojis
              </TabsTrigger>
              <TabsTrigger value="automod" className="w-full justify-start">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Auto-Mod
              </TabsTrigger>
              <TabsTrigger value="bridges" className="w-full justify-start">
                <Link2 className="w-4 h-4 mr-2" />
                Cross-App
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
              <TabsTrigger value="subscriptions" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Subscriptions
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Server Overview</h3>
                  <p className="text-zinc-400">Manage your server settings here.</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                      <p className="text-sm text-zinc-500">Members</p>
                      <p className="text-2xl font-bold text-white">{server?.member_count || 1}</p>
                    </div>
                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                      <p className="text-sm text-zinc-500">Channels</p>
                      <p className="text-2xl font-bold text-white">{channels?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customization" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Server Customization</h3>
                    <p className="text-sm text-zinc-500 mb-4">Theme, branding, welcome screens, and more</p>
                  </div>
                  <Button onClick={() => setShowCustomization(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Palette className="w-4 h-4 mr-2" />
                    Open Customization Studio
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="p-0">
                <ServerAnalyticsDashboard server={server} />
              </TabsContent>

              <TabsContent value="roles" className="p-6">
                <RoleManager server={server} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="emojis" className="p-0">
                <EmojiManager server={server} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="automod" className="p-0">
                <AutoModManager server={server} />
              </TabsContent>

              <TabsContent value="bridges" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Cross-App Bridges</h3>
                    <p className="text-sm text-zinc-500 mb-4">Connect channels with Discord, Slack, Telegram & more</p>
                  </div>
                  <Button onClick={() => setShowBridges(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Link2 className="w-4 h-4 mr-2" />
                    Manage Bridges
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="apps" className="p-6">
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

              <TabsContent value="webhooks" className="p-6">
                <WebhookManager server={server} channels={channels} currentUser={currentUser} />
              </TabsContent>

              <TabsContent value="boost" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Server Boosts</h3>
                  <p className="text-zinc-400">View active boosts and boost analytics.</p>
                </div>
              </TabsContent>

              <TabsContent value="subscriptions" className="p-6">
                <ServerSubscriptionManager server={server} currentUser={currentUser} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>

      {showCustomization && (
        <ServerCustomization server={server} onClose={() => setShowCustomization(false)} />
      )}
      
      {showBridges && (
        <BridgeManager server={server} channels={channels} isOpen={showBridges} onClose={() => setShowBridges(false)} />
      )}
    </div>
  );
}
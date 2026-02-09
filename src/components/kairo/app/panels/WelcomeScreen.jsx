import React from 'react';
import { Plus, Users, Compass } from 'lucide-react';

function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all w-44"
    >
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-zinc-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white mb-1">{title}</p>
        <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

export default function WelcomeScreen({ greeting, onCreateServer, onJoinServer, onDiscover }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0c0c0c]">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <span className="text-lg font-bold text-white">K</span>
          </div>
          <span className="text-2xl font-light text-white tracking-tight">Kairo</span>
        </div>

        {/* Greeting */}
        <h1 className="text-xl font-medium text-zinc-300 mb-2">
          {greeting.text} {greeting.emoji}
        </h1>
        <p className="text-sm text-zinc-600 mb-10 max-w-sm mx-auto">
          Chat with friends, build communities, and connect — all without giving up your privacy.
        </p>

        {/* Action cards */}
        <div className="flex items-center justify-center gap-4">
          <ActionCard
            icon={Plus}
            title="Create Server"
            description="Start your own private community"
            onClick={onCreateServer}
          />
          <ActionCard
            icon={Users}
            title="Join Server"
            description="Enter an invite code to join"
            onClick={onJoinServer}
          />
          <ActionCard
            icon={Compass}
            title="Discover"
            description="Explore public communities"
            onClick={onDiscover}
          />
        </div>
      </div>
    </div>
  );
}
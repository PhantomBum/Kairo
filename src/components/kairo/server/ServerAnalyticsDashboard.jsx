import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, MessageSquare, TrendingUp, TrendingDown, Clock,
  BarChart3, Activity, Hash, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ icon: Icon, label, value, change, changeLabel, color = 'indigo' }) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50"
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          color === 'indigo' && "bg-indigo-500/20 text-indigo-400",
          color === 'emerald' && "bg-emerald-500/20 text-emerald-400",
          color === 'amber' && "bg-amber-500/20 text-amber-400",
          color === 'purple' && "bg-purple-500/20 text-purple-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-sm text-zinc-500">{label}</p>
        {changeLabel && (
          <p className="text-xs text-zinc-600 mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, className }) {
  return (
    <div className={cn("bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50", className)}>
      <h3 className="text-sm font-semibold text-zinc-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ServerAnalyticsDashboard({ server }) {
  const { data: analytics = [] } = useQuery({
    queryKey: ['serverAnalytics', server?.id],
    queryFn: () => base44.entities.ServerAnalytics.filter(
      { server_id: server.id },
      '-date',
      30
    ),
    enabled: !!server?.id
  });

  const { data: members = [] } = useQuery({
    queryKey: ['serverMembers', server?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: server.id }),
    enabled: !!server?.id
  });

  // Calculate stats
  const today = analytics[0] || {};
  const yesterday = analytics[1] || {};
  const weekAgo = analytics[6] || {};

  const memberChange = yesterday.member_count 
    ? ((today.member_count - yesterday.member_count) / yesterday.member_count * 100).toFixed(1)
    : 0;

  const messageChange = yesterday.message_count
    ? ((today.message_count - yesterday.message_count) / yesterday.message_count * 100).toFixed(1)
    : 0;

  // Prepare chart data
  const chartData = [...analytics].reverse().map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    members: a.member_count || 0,
    messages: a.message_count || 0,
    active: a.active_users || 0,
    voice: Math.round((a.voice_minutes || 0) / 60)
  }));

  // If no analytics data, show placeholder
  if (analytics.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Server analytics will start tracking once there's activity. Check back later to see insights about your community.
          </p>
        </div>

        {/* Show current stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            label="Total Members" 
            value={members.length || server?.member_count || 0}
            color="indigo"
          />
          <StatCard 
            icon={Hash} 
            label="Channels" 
            value={0}
            color="emerald"
          />
          <StatCard 
            icon={MessageSquare} 
            label="Messages Today" 
            value={0}
            color="amber"
          />
          <StatCard 
            icon={Activity} 
            label="Active Now" 
            value={members.filter(m => m.status === 'online').length}
            color="purple"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Server Analytics</h2>
          <p className="text-sm text-zinc-500">Last 30 days overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Calendar className="w-4 h-4" />
          Updated just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Members" 
          value={today.member_count || members.length}
          change={parseFloat(memberChange)}
          changeLabel="vs yesterday"
          color="indigo"
        />
        <StatCard 
          icon={MessageSquare} 
          label="Messages Today" 
          value={today.message_count || 0}
          change={parseFloat(messageChange)}
          changeLabel="vs yesterday"
          color="emerald"
        />
        <StatCard 
          icon={Activity} 
          label="Active Users" 
          value={today.active_users || 0}
          color="amber"
        />
        <StatCard 
          icon={Clock} 
          label="Voice Hours" 
          value={Math.round((today.voice_minutes || 0) / 60)}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Member Growth" className="col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#6366f1" 
                  fill="url(#memberGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Message Activity" className="col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Channels */}
      {today.top_channels?.length > 0 && (
        <ChartCard title="Most Active Channels">
          <div className="space-y-3">
            {today.top_channels.slice(0, 5).map((channel, i) => {
              const maxCount = today.top_channels[0]?.message_count || 1;
              const percentage = (channel.message_count / maxCount) * 100;
              
              return (
                <div key={channel.channel_id} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-4">{i + 1}</span>
                  <Hash className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300 w-32 truncate">{channel.channel_name}</span>
                  <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-16 text-right">
                    {channel.message_count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
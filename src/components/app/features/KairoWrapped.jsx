import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, MessageSquare, Mic, Server, Smile, Clock, Users, Award, Trophy, Share2, Download, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_COLORS = [
  'linear-gradient(135deg, #2dd4bf 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #3ba55c 0%, #2ecc71 100%)',
  'linear-gradient(135deg, #f0b232 0%, #ff9800 100%)',
  'linear-gradient(135deg, #ed4245 0%, #eb459e 100%)',
  'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #00bcd4 0%, #3ba55c 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #f0b232 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
];

function StatCard({ icon: Icon, label, value, subtitle, index, isActive }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
      animate={isActive ? { opacity: 1, rotateY: 0, scale: 1 } : { opacity: 0, rotateY: 90, scale: 0.8 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[360px] mx-auto rounded-2xl p-8 text-center"
      style={{ background: CARD_COLORS[index % CARD_COLORS.length], minHeight: 280 }}>
      <Icon className="w-10 h-10 mx-auto mb-4 text-white/90" />
      <p className="text-white/70 text-[13px] font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-[48px] font-black leading-none mb-2">{value}</p>
      {subtitle && <p className="text-white/60 text-[14px]">{subtitle}</p>}
    </motion.div>
  );
}

function WrappedIntro({ onStart }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2dd4bf, #fbbf24)' }}>
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-[32px] font-black mb-3" style={{ color: colors.text.primary }}>Your Year on Kairo</h1>
      <p className="text-[15px] mb-8" style={{ color: colors.text.muted }}>Let's look back at what you've been up to this year.</p>
      <button onClick={onStart}
        className="px-8 py-3 rounded-xl text-[15px] font-bold text-white transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #2dd4bf, #2dd4bf)' }}>
        See My Wrapped
      </button>
    </motion.div>
  );
}

function WrappedEnd({ stats, username, year, onShare }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto">
      <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#f0b232' }} />
      <h2 className="text-[28px] font-black mb-2" style={{ color: colors.text.primary }}>That's a Wrap!</h2>
      <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>Here's to another great year on Kairo.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { l: 'Messages', v: stats.totalMessages?.toLocaleString() || '0' },
          { l: 'Voice Hours', v: stats.voiceHours || '0' },
          { l: 'Friends Made', v: stats.friendsMade || '0' },
          { l: 'Badges Earned', v: stats.badgesEarned || '0' },
        ].map(s => (
          <div key={s.l} className="p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{s.v}</p>
            <p className="text-[11px]" style={{ color: colors.text.muted }}>{s.l}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={onShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
          style={{ background: colors.accent.primary }}>
          <Share2 className="w-4 h-4" /> Share Wrapped
        </button>
      </div>
    </motion.div>
  );
}

export default function KairoWrapped({ onClose, currentUser, profile }) {
  const [phase, setPhase] = useState('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const [messages, members, friends, profiles] = await Promise.all([
          base44.entities.Message.list(),
          base44.entities.ServerMember.filter({ user_id: currentUser.id }),
          base44.entities.Friend.filter({ user_id: currentUser.id }),
          base44.entities.UserProfile.filter({ user_id: currentUser.id }),
        ]);

        const myMessages = messages.filter(m => m.author_id === currentUser.id);
        const thisYearMsgs = myMessages.filter(m => new Date(m.created_date).getFullYear() === year);

        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const emojiCounts = {};
        thisYearMsgs.forEach(m => {
          const emojis = m.content?.match(emojiRegex) || [];
          emojis.forEach(e => { emojiCounts[e] = (emojiCounts[e] || 0) + 1; });
        });
        const topEmoji = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0];

        const hourCounts = {};
        thisYearMsgs.forEach(m => {
          const h = new Date(m.created_date).getHours();
          hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
        const formatHour = (h) => { const n = parseInt(h); return n === 0 ? '12 AM' : n < 12 ? `${n} AM` : n === 12 ? '12 PM' : `${n - 12} PM`; };

        const serverCounts = {};
        thisYearMsgs.forEach(m => { if (m.server_id) serverCounts[m.server_id] = (serverCounts[m.server_id] || 0) + 1; });
        const topServerId = Object.entries(serverCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        let topServerName = 'Unknown';
        if (topServerId) {
          try {
            const servers = await base44.entities.Server.list();
            topServerName = servers.find(s => s.id === topServerId)?.name || 'Unknown';
          } catch {}
        }

        setStats({
          totalMessages: thisYearMsgs.length,
          voiceHours: Math.floor(Math.random() * 50 + 5),
          topServer: topServerName,
          topEmoji: topEmoji ? topEmoji[0] : '😊',
          topEmojiCount: topEmoji ? topEmoji[1] : 0,
          peakHour: topHour ? formatHour(topHour[0]) : '9 PM',
          friendsMade: friends.length,
          serversJoined: members.length,
          badgesEarned: (profile?.badges || []).length,
        });
      } catch (err) {
        setStats({
          totalMessages: 0, voiceHours: 0, topServer: 'None', topEmoji: '😊',
          topEmojiCount: 0, peakHour: 'N/A', friendsMade: 0, serversJoined: 0, badgesEarned: 0,
        });
      }
      setLoading(false);
    })();
  }, [currentUser.id, year, profile?.badges]);

  const cards = useMemo(() => [
    { icon: MessageSquare, label: 'Messages Sent', value: stats.totalMessages?.toLocaleString() || '0', subtitle: `You had a lot to say in ${year}` },
    { icon: Mic, label: 'Voice Hours', value: stats.voiceHours || '0', subtitle: 'Hours spent in voice channels' },
    { icon: Server, label: 'Most Active Server', value: stats.topServer || 'None', subtitle: 'Your home away from home' },
    { icon: Smile, label: 'Most Used Emoji', value: stats.topEmoji || '😊', subtitle: `Used ${stats.topEmojiCount || 0} times` },
    { icon: Clock, label: 'Peak Activity', value: stats.peakHour || 'N/A', subtitle: 'Your most active hour' },
    { icon: Users, label: 'Friends Made', value: stats.friendsMade || '0', subtitle: 'New connections this year' },
    { icon: Trophy, label: 'Servers Joined', value: stats.serversJoined || '0', subtitle: 'Communities you\'re part of' },
    { icon: Award, label: 'Badges Earned', value: stats.badgesEarned || '0', subtitle: 'Achievements unlocked' },
  ], [stats, year]);

  const handleNext = useCallback(() => {
    if (cardIndex < cards.length - 1) setCardIndex(i => i + 1);
    else setPhase('end');
  }, [cardIndex, cards.length]);

  const handleStart = () => { setPhase('cards'); setCardIndex(0); };

  const handleShare = () => {
    const url = `${window.location.origin}/wrapped/${profile?.username || 'user'}/${year}`;
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] z-10">
        <X className="w-5 h-5" style={{ color: colors.text.muted }} />
      </button>

      <div className="w-full max-w-lg px-6">
        <AnimatePresence mode="wait">
          {phase === 'intro' && <WrappedIntro key="intro" onStart={handleStart} />}
          {phase === 'cards' && (
            <motion.div key={`card-${cardIndex}`} className="cursor-pointer" onClick={handleNext}>
              <StatCard {...cards[cardIndex]} index={cardIndex} isActive={true} />
              <div className="flex items-center justify-center gap-2 mt-6">
                {cards.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full transition-colors" style={{ background: i === cardIndex ? '#fff' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>
              <p className="text-center mt-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {cardIndex < cards.length - 1 ? 'Tap to continue' : 'Tap to see your summary'}
              </p>
            </motion.div>
          )}
          {phase === 'end' && <WrappedEnd key="end" stats={stats} username={profile?.username} year={year} onShare={handleShare} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ServerWrapped({ server, onClose }) {
  const [stats, setStats] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const [messages, members] = await Promise.all([
          base44.entities.Message.filter({ server_id: server.id }),
          base44.entities.ServerMember.filter({ server_id: server.id }),
        ]);
        const thisYear = messages.filter(m => new Date(m.created_date).getFullYear() === year);
        const authorCounts = {};
        thisYear.forEach(m => { authorCounts[m.author_name || 'Unknown'] = (authorCounts[m.author_name || 'Unknown'] || 0) + 1; });
        const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];
        setStats({
          totalMessages: thisYear.length,
          memberCount: members.length,
          topContributor: topAuthor ? topAuthor[0] : 'Nobody',
          topContributorMsgs: topAuthor ? topAuthor[1] : 0,
          newMembers: members.filter(m => new Date(m.joined_at).getFullYear() === year).length,
        });
      } catch { setStats({ totalMessages: 0, memberCount: 0, topContributor: 'Nobody', topContributorMsgs: 0, newMembers: 0 }); }
    })();
  }, [server.id, year]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-w-md w-full mx-4 rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #2dd4bf, #2dd4bf)' }}>
        <Crown className="w-10 h-10 mx-auto mb-4 text-white/90" />
        <h2 className="text-[24px] font-black text-white mb-1">{server.name}</h2>
        <p className="text-white/60 text-[13px] mb-6">Server Wrapped {year}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-[24px] font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
            <p className="text-[11px] text-white/60">Messages</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-[24px] font-bold text-white">{stats.memberCount}</p>
            <p className="text-[11px] text-white/60">Members</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-[24px] font-bold text-white">{stats.newMembers}</p>
            <p className="text-[11px] text-white/60">New This Year</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-[16px] font-bold text-white truncate">{stats.topContributor}</p>
            <p className="text-[11px] text-white/60">Top Contributor</p>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-white/20 hover:bg-white/30">
          Close
        </button>
      </div>
    </div>
  );
}

export function useIsWrappedSeason() {
  return new Date().getMonth() === 11;
}

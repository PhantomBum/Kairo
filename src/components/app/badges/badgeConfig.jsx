import {
  Crown, ShieldCheck, Sparkles, Award, Heart, Code2, Eye, Gem,
  FlaskConical, Handshake, Youtube, Mic, MessageSquare, Pin,
  Globe, Smile, Compass, Moon, Users, Clock, Volume2, Star, Key, Palette, Bot, Flag, Trophy, Zap
} from 'lucide-react';

export const RARITY = {
  common:    { label: 'Common',    color: '#b5bac1', glow: false },
  uncommon:  { label: 'Uncommon',  color: '#3ba55c', glow: false },
  rare:      { label: 'Rare',      color: '#2dd4bf', glow: true },
  epic:      { label: 'Epic',      color: '#a855f7', glow: true },
  legendary: { label: 'Legendary', color: '#f0b232', glow: true },
};

export const BADGE_CONFIG = {
  // Platform Badges
  kairo_elite:          { icon: Crown,       color: '#f0b232', rarity: 'legendary', label: '👑 Kairo Elite',           desc: 'Active Elite subscriber', animated: true, hint: 'Subscribe to Kairo Elite' },
  early_adopter:        { icon: Sparkles,    color: '#fbbf24', rarity: 'epic',      label: '🌟 Early Adopter',          desc: 'Joined Kairo in the first 6 months', hint: 'Permanent — thank you!' },
  bug_hunter:           { icon: FlaskConical,color: '#faa61a', rarity: 'rare',      label: '🐛 Bug Hunter',             desc: 'Granted by admin for finding bugs', hint: 'Report bugs to the team' },
  verified_server_owner:{ icon: ShieldCheck, color: '#3ba55c', rarity: 'legendary', label: '🛡️ Verified Server Owner',  desc: 'Owns a public server with 500+ members', hint: 'Grow a server to 500+ members' },
  kairo_friend:         { icon: Heart,       color: '#ed4245', rarity: 'common',    label: '❤️ Kairo Friend',           desc: 'Joined the official Kairo server', hint: 'Join the official Kairo server' },
  anniversary:          { icon: Award,       color: '#eb459e', rarity: 'uncommon',  label: '🎉 Anniversary',            desc: 'Account is 1+ year old', hint: 'Wait for your account birthday!' },
  secret_key:           { icon: Key,         color: '#a78bfa', rarity: 'rare',      label: '🔑 Secret Key User',        desc: 'Signed up using secret key method', hint: 'Use a secret key to register' },
  kairo_staff:          { icon: Star,        color: '#2dd4bf', rarity: 'legendary', label: '⭐ Kairo Staff',            desc: 'Official Kairo team member', hint: 'Staff only', animated: true },
  bot_developer:        { icon: Bot,         color: '#a78bfa', rarity: 'rare',      label: '🤖 Bot Developer',          desc: 'Published a bot to marketplace', hint: 'Publish a bot to the marketplace' },
  theme_creator:        { icon: Palette,     color: '#e91e63', rarity: 'rare',      label: '🎨 Theme Creator',          desc: 'Published a theme to marketplace', hint: 'Create and publish a theme' },

  // Activity Badges (low bars)
  regular:              { icon: MessageSquare,color:'#2dd4bf', rarity: 'common',    label: '🗣️ Regular',               desc: 'Sent messages on 7 different days', hint: 'Chat on 7 different days' },
  voice_regular:        { icon: Volume2,     color: '#8b5cf6', rarity: 'common',    label: '🎙️ Voice Regular',          desc: 'Joined 5 different voice sessions', hint: 'Join voice 5 times' },
  explorer:             { icon: Compass,     color: '#14b8a6', rarity: 'common',    label: '🌍 Explorer',               desc: 'Joined 3 different servers', hint: 'Join 3 servers' },
  night_owl:            { icon: Moon,        color: '#818cf8', rarity: 'common',    label: '🌙 Night Owl',              desc: 'Sent a message between 2–4 AM', hint: 'Happens naturally — stay up late!' },
  social:               { icon: Users,       color: '#f472b6', rarity: 'common',    label: '🤝 Social',                 desc: 'Added at least one friend', hint: 'Add a friend' },
  thread_starter:       { icon: MessageSquare,color:'#06b6d4', rarity: 'common',    label: '🧵 Thread Starter',          desc: 'Created at least one thread', hint: 'Start a thread' },
  curator:              { icon: Pin,         color: '#f59e0b', rarity: 'common',    label: '📌 Curator',                desc: 'Pinned at least one message', hint: 'Pin a message' },

  // Community Badges
  server_legend:        { icon: Trophy,      color: '#e879f9', rarity: 'epic',      label: '🏆 Server Legend',          desc: 'Been in same server for 6+ months', hint: 'Stay in a server for 6 months' },
  expressive:           { icon: Smile,       color: '#f97316', rarity: 'uncommon',  label: '🎭 Expressive',             desc: 'Used emoji in messages regularly for a week', hint: 'Use emoji while chatting' },

  // Legacy mappings
  owner:          { icon: Crown,       color: '#f0b232', rarity: 'legendary', label: 'Server Owner',    desc: 'Owns a Kairo server', hint: 'Create a server' },
  admin:          { icon: ShieldCheck, color: '#2dd4bf', rarity: 'rare',      label: 'Admin',           desc: 'Server administrator', hint: 'Become an admin' },
  premium:        { icon: Gem,         color: '#f0b232', rarity: 'legendary', label: 'Kairo Elite',     desc: 'Active Elite subscriber', animated: true, hint: 'Subscribe to Elite' },
  verified:       { icon: Award,       color: '#3ba55c', rarity: 'rare',      label: 'Verified',        desc: 'Verified account', hint: 'Get verified' },
  early_supporter:{ icon: Heart,       color: '#ed4245', rarity: 'epic',      label: 'Early Supporter', desc: 'Joined Kairo early', hint: 'Permanent' },
  developer:      { icon: Code2,       color: '#a78bfa', rarity: 'rare',      label: 'Developer',       desc: 'Kairo app developer', hint: 'Staff only' },
  moderator:      { icon: Eye,         color: '#2ecc71', rarity: 'rare',      label: 'Moderator',       desc: 'Community moderator', hint: 'Become a moderator' },
  partner:        { icon: Handshake,   color: '#2dd4bf', rarity: 'epic',      label: 'Partner',         desc: 'Official Kairo partner', hint: 'Partner with Kairo' },
  youtube:        { icon: Youtube,     color: '#ff0000', rarity: 'rare',      label: 'Creator',         desc: 'YouTube creator', hint: 'Be a creator' },
  tester:         { icon: Sparkles,    color: '#00d4aa', rarity: 'uncommon',  label: 'Tester',          desc: 'Platform tester', hint: 'Help test Kairo' },
  friendly:       { icon: Users,       color: '#f472b6', rarity: 'common',    label: 'Friendly',        desc: 'Added your first friend', hint: 'Add a friend' },
  active_voice:   { icon: Volume2,     color: '#2dd4bf', rarity: 'epic',      label: 'Active Voice',    desc: '500+ hours in voice channels', hint: 'Spend time in voice' },
  conversationalist: { icon: Mic,      color: '#6366f1', rarity: 'uncommon',  label: 'Conversationalist', desc: 'Sent 1000+ messages', hint: 'Keep chatting' },
  globetrotter:   { icon: Globe,       color: '#10b981', rarity: 'uncommon',  label: 'Globetrotter',    desc: 'Joined servers from 5+ categories', hint: 'Explore different servers' },
  thread_enthusiast: { icon: MessageSquare, color:'#06b6d4', rarity: 'rare', label: 'Thread Enthusiast', desc: 'Created 100+ threads', hint: 'Start lots of threads' },
  expresser:      { icon: Smile,       color: '#f97316', rarity: 'uncommon',  label: 'Expresser',       desc: 'Used 200+ unique emoji', hint: 'Use lots of different emoji' },
};

export function getOrderedBadges(badges = [], badgeOrder = []) {
  if (!badges.length) return [];
  const ordered = [];
  for (const id of badgeOrder) {
    if (badges.includes(id)) ordered.push(id);
  }
  for (const id of badges) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

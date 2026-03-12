import {
  Crown, ShieldCheck, Sparkles, Award, Heart, Code2, Eye, Gem,
  FlaskConical, Handshake, Youtube, Mic, MessageSquare, Pin,
  Globe, Smile, Compass, Moon, Users, Clock, Volume2
} from 'lucide-react';

// Rarity tiers
export const RARITY = {
  common:    { label: 'Common',    color: '#b5bac1', glow: false },
  uncommon:  { label: 'Uncommon',  color: '#3ba55c', glow: false },
  rare:      { label: 'Rare',      color: '#5865F2', glow: true },
  epic:      { label: 'Epic',      color: '#a855f7', glow: true },
  legendary: { label: 'Legendary', color: '#f0b232', glow: true },
};

export const BADGE_CONFIG = {
  // Platform badges
  kairo_elite:          { icon: Crown,       color: '#f0b232', rarity: 'legendary', label: 'Kairo Elite',           desc: 'Active Elite subscriber',                          animated: true },
  early_adopter:        { icon: Sparkles,    color: '#fbbf24', rarity: 'epic',      label: 'Early Adopter',          desc: 'Joined Kairo in the first 6 months' },
  bug_hunter:           { icon: FlaskConical,color: '#faa61a', rarity: 'rare',      label: 'Bug Hunter',             desc: 'Granted by Kairo team for finding bugs' },
  active_voice:         { icon: Volume2,     color: '#5865F2', rarity: 'epic',      label: 'Active Voice',           desc: '500+ hours in voice channels' },
  bot_developer:        { icon: Code2,       color: '#a78bfa', rarity: 'rare',      label: 'Bot Developer',          desc: 'Published a bot to the marketplace' },
  verified_server_owner:{ icon: ShieldCheck, color: '#3ba55c', rarity: 'legendary', label: 'Verified Server Owner',  desc: 'Owns a verified server with 1000+ members' },
  kairo_friend:         { icon: Heart,       color: '#ed4245', rarity: 'common',    label: 'Kairo Friend',           desc: 'Joined the official Kairo server' },
  anniversary:          { icon: Award,       color: '#eb459e', rarity: 'uncommon',  label: 'Anniversary',            desc: 'Account is 1+ year old' },

  // Community badges
  server_legend:        { icon: Crown,       color: '#e879f9', rarity: 'epic',      label: 'Server Legend',          desc: 'Member of the same server for 1+ year' },
  thread_enthusiast:    { icon: MessageSquare,color:'#06b6d4', rarity: 'rare',      label: 'Thread Enthusiast',      desc: 'Created 100+ threads' },
  curator:              { icon: Pin,         color: '#f59e0b', rarity: 'rare',      label: 'Curator',                desc: 'Pinned 50+ messages' },
  globetrotter:         { icon: Globe,       color: '#10b981', rarity: 'uncommon',  label: 'Globetrotter',           desc: 'Joined servers from 5+ categories' },
  expresser:            { icon: Drama,       color: '#f97316', rarity: 'uncommon',  label: 'Expresser',              desc: 'Used 200+ unique emoji' },
  conversationalist:    { icon: Mic,         color: '#6366f1', rarity: 'uncommon',  label: 'Conversationalist',      desc: 'Sent 1000+ messages' },
  voice_regular:        { icon: Clock,       color: '#8b5cf6', rarity: 'common',    label: 'Voice Regular',          desc: '10+ hours in voice channels' },
  explorer:             { icon: Compass,     color: '#14b8a6', rarity: 'common',    label: 'Explorer',               desc: 'Joined 5+ servers' },
  night_owl:            { icon: Moon,        color: '#818cf8', rarity: 'common',    label: 'Night Owl',              desc: 'Sent a message between 2–4 AM' },
  friendly:             { icon: Users,       color: '#f472b6', rarity: 'common',    label: 'Friendly',               desc: 'Added your first friend' },

  // Legacy keys — map old badge IDs to new system
  owner:          { icon: Crown,       color: '#f0b232', rarity: 'legendary', label: 'Server Owner',   desc: 'Owns a Kairo server' },
  admin:          { icon: ShieldCheck, color: '#5865F2', rarity: 'rare',      label: 'Admin',          desc: 'Server administrator' },
  premium:        { icon: Gem,         color: '#f0b232', rarity: 'legendary', label: 'Kairo Elite',    desc: 'Active Elite subscriber', animated: true },
  verified:       { icon: Award,       color: '#3ba55c', rarity: 'rare',      label: 'Verified',       desc: 'Verified account' },
  early_supporter:{ icon: Heart,       color: '#ed4245', rarity: 'epic',      label: 'Early Supporter',desc: 'Joined Kairo early' },
  developer:      { icon: Code2,       color: '#a78bfa', rarity: 'rare',      label: 'Developer',      desc: 'Kairo app developer' },
  moderator:      { icon: Eye,         color: '#2ecc71', rarity: 'rare',      label: 'Moderator',      desc: 'Community moderator' },
  partner:        { icon: Handshake,   color: '#5865F2', rarity: 'epic',      label: 'Partner',        desc: 'Official Kairo partner' },
  youtube:        { icon: Youtube,     color: '#ff0000', rarity: 'rare',      label: 'Creator',        desc: 'YouTube creator' },
  tester:         { icon: Sparkles,    color: '#00d4aa', rarity: 'uncommon',  label: 'Tester',         desc: 'Platform tester' },
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
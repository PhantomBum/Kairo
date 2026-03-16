/**
 * Kairo — Kloak-style UI. Dark, minimal, premium.
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Home,
  Plus,
  Hash,
  MessageCircle,
  ChevronDown,
  Settings,
  Paperclip,
  LayoutGrid,
  Smile,
  Image as ImageIcon,
  Send,
  Reply,
  Pencil,
  Pin,
  Copy,
  MoreHorizontal,
  Trash2,
  Users,
  Compass,
  Bell,
  Search,
  AtSign,
  Link2,
  ClipboardPaste,
  ArrowDown,
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import KairoSettingsView from '@/components/kairo/KairoSettingsView';
import QuickSwitcher from '@/components/kairo/QuickSwitcher';

const headerActionBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888899',
};
const hoverBarBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888899',
  fontSize: 14,
};
const inputActionBtnStyle = {
  width: 30,
  height: 30,
  borderRadius: 6,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#555566',
};

function useServers(userId, userEmail) {
  return useQuery({
    queryKey: ['servers', userId],
    queryFn: async () => {
      const [servers, members] = await Promise.all([base44.entities.Server.list(), base44.entities.ServerMember.list()]);
      const myIds = new Set(members.filter(m => m.user_id === userId || m.user_email === userEmail).map(m => m.server_id));
      return (servers || []).filter(s => myIds.has(s.id) || s.owner_id === userId);
    },
    enabled: !!userId,
  });
}

function useChannels(serverId) {
  return useQuery({
    queryKey: ['channels', serverId],
    queryFn: () => base44.entities.Channel.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

function useCategories(serverId) {
  return useQuery({
    queryKey: ['categories', serverId],
    queryFn: () => base44.entities.Category.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

function useServerMembers(serverId) {
  return useQuery({
    queryKey: ['serverMembers', serverId],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

function useMessages(channelId) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!channelId) return;
    const unsub = base44.entities.Message.subscribe(() => qc.invalidateQueries({ queryKey: ['messages', channelId] }));
    return unsub;
  }, [channelId, qc]);
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: channelId }, '-created_date', 100);
      return (msgs || []).filter(m => !m.is_deleted).reverse();
    },
    enabled: !!channelId,
  });
}

function useConversations(userId, userEmail) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const all = await base44.entities.Conversation.filter({}, '-last_message_at');
      return (all || []).filter(c => c.participants?.some(p => p.user_id === userId || p.user_email === userEmail));
    },
    enabled: !!userId,
  });
}

function useDMMessages(convId) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!convId) return;
    const unsub = base44.entities.DirectMessage.subscribe(() => qc.invalidateQueries({ queryKey: ['dmMessages', convId] }));
    return unsub;
  }, [convId, qc]);
  return useQuery({
    queryKey: ['dmMessages', convId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: convId }, '-created_date', 100);
      return (msgs || []).filter(m => !m.is_deleted).reverse();
    },
    enabled: !!convId,
  });
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60 * 1000) return 'now';
  if (diffMs < 60 * 60 * 1000) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, 'MMM d, h:mm a');
}

const CONTINUED_THRESHOLD_MS = 5 * 60 * 1000; // 5 min
function isContinuedMessage(prev, curr) {
  if (!prev || !curr) return false;
  const prevT = prev.created_date ? new Date(prev.created_date).getTime() : 0;
  const currT = curr.created_date ? new Date(curr.created_date).getTime() : 0;
  return prev.author_id === curr.author_id && currT - prevT < CONTINUED_THRESHOLD_MS;
}

function DMHomeScreen({ user, onOpenCreate, onOpenJoin, onExplore }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';
  const username = user?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: '#0a0a0b',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 16, color: '#888899', marginBottom: 8 }}>{greeting}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            @{username}
          </h1>
          <span style={{ fontSize: 48 }}>{emoji}</span>
        </div>
        <p style={{ fontSize: 14, color: '#555566', marginTop: 12, maxWidth: 400, lineHeight: 1.6 }}>
          Create your own community, join one with an invite, or explore what's out there.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          type="button"
          style={{
            width: '100%',
            background: '#111114',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transition: 'background 150ms ease, border-color 150ms ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#161619';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#111114';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
          onClick={onOpenCreate}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888899',
              flexShrink: 0,
            }}
          >
            <Plus size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>Create a Server</div>
            <div style={{ fontSize: 13, color: '#555566', marginTop: 2 }}>
              Start your own private community and invite friends
            </div>
          </div>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            style={{
              background: '#111114',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'background 150ms ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#161619';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#111114';
            }}
            onClick={onOpenJoin}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888899',
                flexShrink: 0,
              }}
            >
              <Users size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Join Server</div>
              <div style={{ fontSize: 12, color: '#555566', marginTop: 2 }}>Enter an invite code</div>
            </div>
          </button>

          <button
            type="button"
            style={{
              background: '#111114',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'background 150ms ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#161619';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#111114';
            }}
            onClick={onExplore}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888899',
                flexShrink: 0,
              }}
            >
              <Compass size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Explore</div>
              <div style={{ fontSize: 12, color: '#555566', marginTop: 2 }}>Find public communities</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Kairo() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [server, setServer] = useState(null);
  const [channel, setChannel] = useState(null);
  const [conv, setConv] = useState(null);
  const [view, setView] = useState('home');
  const [modal, setModal] = useState(null);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState(null);
  const [optimisticMessage, setOptimisticMessage] = useState(null);
  const [offline, setOffline] = useState(false);

  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const createInputRef = useRef(null);
  const joinInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { data: servers = [] } = useServers(user?.id, user?.email);
  const { data: channels = [] } = useChannels(server?.id);
  const { data: categories = [] } = useCategories(server?.id);
  const { data: serverMembers = [] } = useServerMembers(server?.id);
  const { data: messages = [], isLoading: msgLoading } = useMessages(channel?.id);
  const { data: conversations = [] } = useConversations(user?.id, user?.email);
  const { data: dmMessages = [], isLoading: dmLoading } = useDMMessages(conv?.id);

  const isDM = !!conv;
  const msgs = isDM ? dmMessages : messages;
  const loading = isDM ? dmLoading : msgLoading;
  const label = isDM
    ? conv?.name || conv?.participants?.find((p) => p.user_id !== user?.id)?.user_name || 'DM'
    : channel?.name || '';

  useEffect(() => {
    if (server && channels.length && !channel) {
      const ch = channels.find((c) => c.type === 'text' || c.type === 'announcement') || channels[0];
      if (ch) setChannel(ch);
    }
  }, [server, channels]);

  const selectServer = (s) => {
    setServer(s);
    setChannel(null);
    setConv(null);
    setView(s ? 'server' : 'home');
    setModal(null);
  };
  const goHome = () => {
    setServer(null);
    setChannel(null);
    setConv(null);
    setView('home');
  };

  const createServer = useMutation({
    mutationFn: async ({ name }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const s = await base44.entities.Server.create({ name, owner_id: user.id, invite_code: code, member_count: 1 });
      await base44.entities.ServerMember.create({
        server_id: s.id,
        user_id: user.id,
        user_email: user.email,
        joined_at: new Date().toISOString(),
        role_ids: [],
      });
      await base44.entities.Role.create({ server_id: s.id, name: '@everyone', is_default: true, position: 0, color: '#99AAB5' });
      const cat = await base44.entities.Category.create({ server_id: s.id, name: 'Text', position: 0 });
      await base44.entities.Channel.create({ server_id: s.id, category_id: cat.id, name: 'general', type: 'text', position: 0 });
      const vCat = await base44.entities.Category.create({ server_id: s.id, name: 'Voice', position: 1 });
      await base44.entities.Channel.create({ server_id: s.id, category_id: vCat.id, name: 'General', type: 'voice', position: 0 });
      return s;
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['servers'] });
      selectServer(s);
      setModal(null);
    },
    onError: (e) => toast.error(e?.message || 'Failed'),
  });

  const joinServer = useMutation({
    mutationFn: async (code) => {
      const clean = (code || '').trim().toUpperCase().replace(/.*\/INVITE\//, '').split(/[?#]/)[0] || '';
      const all = await base44.entities.Server.list();
      const s = all.find((x) => (x.invite_code || '').toUpperCase() === clean);
      if (!s) throw new Error('Invalid invite');
      const existing = await base44.entities.ServerMember.filter({ server_id: s.id, user_id: user.id });
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({
          server_id: s.id,
          user_id: user.id,
          user_email: user.email,
          joined_at: new Date().toISOString(),
          role_ids: [],
        });
        const mems = await base44.entities.ServerMember.filter({ server_id: s.id });
        await base44.entities.Server.update(s.id, { member_count: mems.filter((m) => !m.is_banned).length });
      }
      return s;
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ['servers'] });
      selectServer(s);
      setModal(null);
    },
    onError: (e) => toast.error(e?.message || 'Invalid invite'),
  });

  const sendMsg = useMutation({
    mutationFn: async ({ content }) => {
      let body = content;
      if (replyTo?.author_name && replyTo?.content) {
        body = `> **${replyTo.author_name}:** ${(replyTo.content || '').slice(0, 100)}${replyTo.content?.length > 100 ? '…' : ''}\n\n${content}`;
      }
      if (isDM) {
        await base44.entities.Conversation.update(conv.id, {
          last_message_at: new Date().toISOString(),
          last_message_preview: content?.slice(0, 50),
        });
        return base44.entities.DirectMessage.create({
          conversation_id: conv.id,
          author_id: user.id,
          author_name: user.full_name || user.email?.split('@')[0],
          author_avatar: null,
          content: body,
          type: 'default',
        });
      }
      return base44.entities.Message.create({
        channel_id: channel.id,
        server_id: server.id,
        author_id: user.id,
        author_name: user.full_name || user.email?.split('@')[0],
        author_avatar: null,
        author_badges: [],
        content: body,
        type: 'default',
      });
    },
    onMutate: async ({ content }) => {
      setOptimisticMessage({
        id: `opt-${Date.now()}`,
        content,
        author_id: user?.id,
        author_name: user?.full_name || user?.email?.split('@')[0],
        created_date: new Date().toISOString(),
        continued: false,
      });
    },
    onSuccess: () => {
      setOptimisticMessage(null);
      qc.invalidateQueries({ queryKey: isDM ? ['dmMessages', conv?.id] : ['messages', channel?.id] });
      if (isDM) qc.invalidateQueries({ queryKey: ['conversations'] });
      setInput('');
      setReplyTo(null);
    },
    onError: (e) => {
      setOptimisticMessage(null);
      toast.error(e?.message || 'Failed to send');
    },
  });

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    setOffline(!navigator.onLine);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const handleSend = (e) => {
    e?.preventDefault();
    const txt = input.trim();
    if (!txt) return;
    sendMsg.mutate({ content: txt });
  };

  const leaveServerMutation = useMutation({
    mutationFn: async () => {
      const members = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: user.id });
      for (const m of members) await base44.entities.ServerMember.delete(m.id);
      const mems = await base44.entities.ServerMember.filter({ server_id: server.id });
      await base44.entities.Server.update(server.id, { member_count: mems.filter((mb) => !mb.is_banned).length });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servers'] });
      setServer(null);
      setChannel(null);
      setView('home');
      setModal(null);
      toast.success('Left server');
    },
    onError: (e) => toast.error(e?.message || 'Failed to leave'),
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, content, isDM: dm }) => {
      if (dm) return base44.entities.DirectMessage.update(id, { content });
      return base44.entities.Message.update(id, { content });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: isDM ? ['dmMessages', conv?.id] : ['messages', channel?.id] });
      setEditingMessage(null);
      setEditContent('');
      toast.success('Message updated');
    },
    onError: (e) => toast.error(e?.message || 'Update failed'),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async ({ id, isDM: dm }) => {
      if (dm) return base44.entities.DirectMessage.update(id, { is_deleted: true, content: '' });
      return base44.entities.Message.update(id, { is_deleted: true, content: '' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: isDM ? ['dmMessages', conv?.id] : ['messages', channel?.id] });
      setDeleteConfirmMessage(null);
      toast.success('Message deleted');
    },
    onError: (e) => toast.error(e?.message || 'Delete failed'),
  });

  // Ctrl/Cmd+K quick switcher
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setQuickSwitcherOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close server dropdown on click outside
  useEffect(() => {
    if (!serverDropdownOpen) return;
    const handler = () => setServerDropdownOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [serverDropdownOpen]);

  const inChat =
    (view === 'server' && channel && (channel.type === 'text' || channel.type === 'announcement')) ||
    (view === 'home' && conv);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  // Track scroll position for "scroll to bottom" button
  const onMessageListScroll = useCallback(() => {
    const el = messageListRef.current;
    if (!el) return;
    const threshold = 150;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setShowScrollBottom(!atBottom);
  }, []);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    el.addEventListener('scroll', onMessageListScroll);
    return () => el.removeEventListener('scroll', onMessageListScroll);
  }, [inChat, onMessageListScroll]);

  // Escape closes modal
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus modal input when opened
  useEffect(() => {
    if (modal === 'create') setTimeout(() => createInputRef.current?.focus(), 50);
    if (modal === 'join') setTimeout(() => joinInputRef.current?.focus(), 50);
  }, [modal]);

  const copyInviteLink = useCallback(() => {
    if (!server?.invite_code) return;
    const url = `${window.location.origin}/invite/${server.invite_code}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Invite link copied')).catch(() => toast.error('Could not copy'));
  }, [server?.invite_code]);

  const copyMessageContent = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard')).catch(() => toast.error('Could not copy'));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Reset textarea height when message is sent
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const msgsWithOptimistic = useMemo(() => {
    if (!optimisticMessage) return msgs;
    return [...msgs, optimisticMessage];
  }, [msgs, optimisticMessage]);

  // Group messages by date and mark continued (same author, within 5 min)
  const messageGroupsByDate = useMemo(() => {
    if (!msgsWithOptimistic.length) return [];
    const groups = [];
    let currentDate = null;
    let prevMsg = null;
    msgsWithOptimistic.forEach((m) => {
      const d = m.created_date;
      const dateKey = d ? formatDateLabel(d) : null;
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ type: 'date', date: d, label: dateKey });
      }
      const continued = isContinuedMessage(prevMsg, m);
      groups.push({ type: 'message', ...m, continued });
      prevMsg = m;
    });
    return groups;
  }, [msgsWithOptimistic]);

  const showDMHome = view === 'home' && !conv;

  return (
    <div
      className="kairo-app-root"
      style={{
        display: 'flex',
        height: '100vh',
        background: '#0a0a0b',
        overflow: 'hidden',
      }}
    >
      {/* Server icon column — 52px */}
      <div
        style={{
          width: 52,
          background: '#0a0a0b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: 8,
          borderRight: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'relative', width: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={goHome}
            aria-label="Home / DMs"
            title="Home"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: view === 'home' && !conv ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: view === 'home' ? '#ffffff' : '#888899',
              border: 'none',
              transition: 'border-radius 200ms ease, opacity 150ms ease',
            }}
          >
            <Home size={20} />
          </button>
          {view === 'home' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 20,
                background: '#ffffff',
                borderRadius: '0 3px 3px 0',
              }}
            />
          )}
        </div>
        {servers.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'relative',
              width: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => selectServer(s)}
              title={s.name || 'Server'}
              aria-label={s.name || 'Server'}
              style={{
                width: 36,
                height: 36,
                borderRadius: server?.id === s.id ? 14 : 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                background: server?.id === s.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                opacity: server?.id === s.id ? 1 : 0.6,
                border: 'none',
                transition: 'border-radius 200ms ease, opacity 150ms ease',
              }}
            >
              {s.icon_url ? (
                <img src={s.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{(s.name || 'S').charAt(0)}</span>
              )}
            </button>
            {server?.id === s.id && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 32,
                  background: '#ffffff',
                  borderRadius: '0 3px 3px 0',
                }}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setModal('create')}
          aria-label="Create server"
          title="Create Server"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888899',
            transition: 'background 150ms ease, color 150ms ease, border-radius 200ms ease',
            marginTop: 'auto',
            marginBottom: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2dd4bf';
            e.currentTarget.style.color = '#0a0a0b';
            e.currentTarget.style.borderRadius = '14px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#888899';
            e.currentTarget.style.borderRadius = '50%';
          }}
        >
          <Plus size={20} />
        </button>
        <button
          type="button"
          onClick={() => setModal('join')}
          aria-label="Join server"
          title="Join Server"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888899',
          }}
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Channel sidebar — 220px, reworked */}
      <div
        className="kairo-channel-sidebar"
        style={{
          width: 220,
          background: '#0d0d0f',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 14px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
          }}
          onClick={() => view === 'server' && setServerDropdownOpen((o) => !o)}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {view === 'server' ? server?.name || 'Server' : 'Messages'}
          </span>
          <ChevronDown size={16} style={{ color: '#888899', flexShrink: 0 }} />
          {view === 'server' && serverDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 2,
                background: '#111114',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 100,
                padding: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="kairo-dropdown-item" onClick={() => { setModal('invite'); setServerDropdownOpen(false); }}>
                <Users size={16} /> Invite People
              </button>
              <button type="button" className="kairo-dropdown-item" onClick={() => { copyInviteLink(); setServerDropdownOpen(false); }}>
                <Link2 size={16} /> Copy invite link
              </button>
              <button type="button" className="kairo-dropdown-item kairo-dropdown-item-danger" onClick={() => { setModal('leaveServer'); setServerDropdownOpen(false); }}>
                <Trash2 size={16} /> Leave Server
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {view === 'server' ? (
            (() => {
              const textChannels = channels.filter((c) => c.type === 'text' || c.type === 'announcement' || c.type === 'voice');
              const byCategory = (categories || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
              const uncategorized = textChannels.filter((c) => !c.category_id);
              const channelRow = (ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch)}
                  style={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: channel?.id === ch.id ? '#ffffff' : '#888899',
                    fontSize: 14,
                    fontWeight: channel?.id === ch.id ? 500 : 400,
                    background: channel?.id === ch.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'background 100ms ease, color 100ms ease',
                  }}
                >
                  {channel?.id === ch.id && (
                    <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 2, background: '#ffffff', borderRadius: '0 2px 2px 0' }} />
                  )}
                  <span style={{ opacity: 0.7, flexShrink: 0 }}>{ch.type === 'voice' ? '🔊' : <Hash size={16} style={{ verticalAlign: 'middle' }} />}</span>
                  {ch.name}
                </button>
              );
              return (
                <>
                  {byCategory.map((cat) => {
                    const chs = textChannels.filter((c) => c.category_id === cat.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                    if (chs.length === 0) return null;
                    return (
                      <div key={cat.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555566', padding: '4px 8px 4px', cursor: 'default' }}>
                          {cat.name || 'Channels'}
                        </div>
                        {chs.map(channelRow)}
                      </div>
                    );
                  })}
                  {uncategorized.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      {byCategory.length > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555566', padding: '4px 8px 4px' }}>
                          Channels
                        </div>
                      )}
                      {uncategorized.map(channelRow)}
                    </div>
                  )}
                  {textChannels.length === 0 && (
                    <div style={{ padding: 16, fontSize: 13, color: '#555566', textAlign: 'center' }}>No channels yet</div>
                  )}
                </>
              );
            })()
          ) : (
            <>
              {conversations.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#555566', marginBottom: 4 }}>No DMs yet</div>
                  <div style={{ fontSize: 12, color: '#444455' }}>Start a conversation from a server or add a friend.</div>
                </div>
              )}
              {conversations.map((c) => {
              const other = c.participants?.find((p) => p.user_id !== user?.id);
              const name = c.name || other?.user_name || other?.user_email?.split('@')[0] || 'DM';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setConv(c);
                    setView('home');
                  }}
                  style={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: conv?.id === c.id ? '#ffffff' : '#888899',
                    fontSize: 14,
                    fontWeight: conv?.id === c.id ? 500 : 400,
                    background: conv?.id === c.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 100ms ease, color 100ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#111114',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#888899',
                    }}
                  >
                    {other?.avatar ? null : name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    {c.last_message_preview && (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#555566',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.last_message_preview}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            </>
          )}
        </div>

        {/* Bottom user bar */}
        <div
          style={{
            height: 58,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {(user?.full_name || user?.email || '?').charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: 12, color: '#888899', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                }}
              />
              Online
            </div>
          </div>
          <button
            type="button"
            aria-label="User settings"
            title="Settings"
            onClick={() => setView('settings')}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888899',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main content: Settings | Explore | Chat */}
      <div
        style={{
          flex: 1,
          background: '#0a0a0b',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {view === 'settings' && (
          <KairoSettingsView onClose={() => setView('home')} />
        )}
        {view === 'explore' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#0a0a0b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Explore communities</h2>
            <p style={{ fontSize: 14, color: '#888899', marginBottom: 24, maxWidth: 360, textAlign: 'center' }}>
              Find public servers and communities. Discovery is coming soon.
            </p>
            <button type="button" className="k-btn k-btn-secondary" onClick={() => setView('home')}>Back to Home</button>
          </div>
        )}
        {view !== 'settings' && view !== 'explore' && showDMHome ? (
          <DMHomeScreen
            user={user}
            onOpenCreate={() => setModal('create')}
            onOpenJoin={() => setModal('join')}
            onExplore={() => setView('explore')}
          />
        ) : view !== 'settings' && view !== 'explore' && inChat ? (
          <>
            {/* Channel header */}
            <div
              style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                {isDM ? <MessageCircle size={18} /> : <Hash size={18} />}
                {label}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                {server?.invite_code && (
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    aria-label="Copy invite link"
                    title="Copy invite link"
                    style={headerActionBtnStyle}
                  >
                    <Link2 size={18} />
                  </button>
                )}
                <button type="button" aria-label="Search" title="Search" style={headerActionBtnStyle}>
                  <Search size={18} />
                </button>
                <button type="button" aria-label="Mention" title="Mention" style={headerActionBtnStyle}>
                  <AtSign size={18} />
                </button>
                <button type="button" aria-label="Notifications" title="Notifications" style={headerActionBtnStyle}>
                  <Bell size={18} />
                </button>
              </div>
            </div>

            {offline && (
              <div style={{ flexShrink: 0, padding: '8px 16px', background: 'rgba(239,68,68,0.15)', borderBottom: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                You're offline. Messages will send when you're back online.
              </div>
            )}

            {/* Message list + scroll to bottom */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              ref={messageListRef}
              onScroll={onMessageListScroll}
              style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 8px' }}
            >
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 14, width: 120, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ height: 12, width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                messageGroupsByDate.map((item) => {
                  if (item.type === 'date') {
                    return (
                      <div
                        key={`date-${item.label}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          margin: '24px 0',
                          color: '#555566',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        {item.label}
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    );
                  }
                  const m = item;
                  const continued = m.continued;
                  return (
                    <div
                      key={m.id}
                      className="message-group"
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: continued ? '1px 0 1px 48px' : '2px 0',
                        position: 'relative',
                        borderRadius: 8,
                        transition: 'background 80ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {!continued && (
                        <div
                          className="k-avatar"
                          style={{ width: 36, height: 36, fontSize: 14, marginTop: 2, flexShrink: 0 }}
                        >
                          {m.author_avatar ? (
                            <img src={m.author_avatar} alt="" />
                          ) : (
                            (m.author_name || '?').charAt(0)
                          )}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {!continued && (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
                              {m.author_name || 'User'}
                            </span>
                            <span style={{ fontSize: 11, color: '#555566', fontWeight: 400 }} title={m.created_date ? new Date(m.created_date).toLocaleString() : ''}>
                              {formatTimeAgo(m.created_date)}
                            </span>
                          </div>
                        )}
                        {editingMessage?.id === m.id ? (
                          <div style={{ marginTop: 8 }}>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              autoFocus
                              style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 8, background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              <button type="button" className="k-btn k-btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => updateMessageMutation.mutate({ id: m.id, content: editContent, isDM })} disabled={updateMessageMutation.isPending || editContent.trim() === (m.content || '').trim()}>Save</button>
                              <button type="button" className="k-btn k-btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => { setEditingMessage(null); setEditContent(''); }}>Cancel</button>
                            </div>
                          </div>
                        ) : continued ? (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: '#555566', flexShrink: 0 }} title={m.created_date ? new Date(m.created_date).toLocaleString() : ''}>
                              {formatTimeAgo(m.created_date)}
                            </span>
                            <span style={{ fontSize: 14, color: '#ccccdd', lineHeight: 1.5, wordBreak: 'break-word' }}>
                              {m.content || '(empty)'}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 14, color: '#ccccdd', lineHeight: 1.5, wordBreak: 'break-word', marginTop: 2 }}>
                            {m.content || '(empty)'}
                            {m.id?.toString().startsWith('opt-') && (
                              <span style={{ fontSize: 11, color: '#888899', marginLeft: 8 }}>Sending…</span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Message hover bar */}
                      <div
                        style={{
                          position: 'absolute',
                          top: -18,
                          right: 8,
                          background: '#111114',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                          gap: 2,
                          opacity: 0,
                          transition: 'opacity 120ms ease, transform 120ms ease',
                          zIndex: 100,
                          pointerEvents: 'none',
                        }}
                        className="message-hover-bar"
                      >
                        <button type="button" style={hoverBarBtnStyle} aria-label="Like">👍</button>
                        <button type="button" style={hoverBarBtnStyle} aria-label="Love">❤️</button>
                        <button type="button" style={hoverBarBtnStyle} aria-label="Haha">😂</button>
                        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
                        <button type="button" style={hoverBarBtnStyle} aria-label="Add emoji"><Smile size={16} /></button>
                        <button type="button" style={hoverBarBtnStyle} onClick={(e) => { e.stopPropagation(); setReplyTo(m); }} aria-label="Reply"><Reply size={16} /></button>
                        {m.author_id === user?.id && (
                          <button type="button" style={hoverBarBtnStyle} aria-label="Edit" onClick={(e) => { e.stopPropagation(); setEditingMessage(m); setEditContent(m.content || ''); }}><Pencil size={14} /></button>
                        )}
                        <button type="button" style={hoverBarBtnStyle} aria-label="Pin"><Pin size={14} /></button>
                        <button type="button" style={hoverBarBtnStyle} onClick={(e) => { e.stopPropagation(); copyMessageContent(m.content); }} aria-label="Copy"><Copy size={14} /></button>
                        <button type="button" style={hoverBarBtnStyle} aria-label="More"><MoreHorizontal size={14} /></button>
                        {m.author_id === user?.id && (
                          <button type="button" style={{ ...hoverBarBtnStyle, color: '#ef4444' }} aria-label="Delete" onClick={(e) => { e.stopPropagation(); setDeleteConfirmMessage(m); }}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {showScrollBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                style={{
                  position: 'absolute',
                  bottom: 88,
                  right: 24,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#111114',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#888899',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  zIndex: 10,
                }}
              >
                <ArrowDown size={18} />
              </button>
            )}
            </div>

            {/* Reply preview */}
            {replyTo && (
              <div
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Reply size={16} style={{ color: '#2dd4bf' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: '#888899' }}>Replying to </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{replyTo.author_name}</span>
                  <span style={{ fontSize: 12, color: '#555566', marginLeft: 4 }}>{(replyTo.content || '').slice(0, 50)}{(replyTo.content || '').length > 50 ? '…' : ''}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  aria-label="Cancel reply"
                  style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', padding: 4 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Message input */}
            <div style={{ flexShrink: 0, padding: '0 12px 12px' }}>
              <div
                style={{
                  background: '#111114',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.target;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isDM ? `Message @${label}` : `Message #${label}`}
                  rows={1}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'none',
                    padding: '14px 16px 8px',
                    minHeight: 44,
                    maxHeight: 160,
                    lineHeight: 1.5,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px 10px',
                    gap: 4,
                  }}
                >
                  <button type="button" style={inputActionBtnStyle} aria-label="Attach file"><Paperclip size={18} /></button>
                  <button type="button" style={inputActionBtnStyle} aria-label="Format"><LayoutGrid size={18} /></button>
                  <button type="button" style={inputActionBtnStyle} aria-label="Emoji"><Smile size={18} /></button>
                  <button type="button" style={inputActionBtnStyle} aria-label="Image"><ImageIcon size={18} /></button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label="Send"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: 'transparent',
                      border: 'none',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: input.trim() ? '#2dd4bf' : '#333344',
                      marginLeft: 'auto',
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555566',
              gap: 16,
              padding: 40,
            }}
          >
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#888899' }}>Choose a channel or DM</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setModal('create')} className="k-btn k-btn-primary">
                Create Server
              </button>
              <button onClick={() => setModal('join')} className="k-btn k-btn-secondary">
                Join Server
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member list — 220px, reworked */}
      {inChat && server && (
        <div
          className="kairo-member-sidebar"
          style={{
            width: 220,
            background: '#0a0a0b',
            borderLeft: '1px solid rgba(255,255,255,0.04)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#555566', padding: '12px 8px 4px' }}>
            MEMBERS — {serverMembers.filter((m) => !m.is_banned).length}
          </div>
          <div style={{ fontSize: 11, color: '#444455', padding: '0 8px 12px' }}>{serverMembers.filter((m) => !m.is_banned).length} member{serverMembers.filter((m) => !m.is_banned).length !== 1 ? 's' : ''}</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555566', padding: '8px 0 4px' }}>
              Online
            </div>
            {serverMembers.filter((m) => !m.is_banned).map((member) => {
              const displayName = member.user_name || member.user_email?.split('@')[0] || 'User';
              const isMe = member.user_id === user?.id || member.user_email === user?.email;
              return (
                <div
                  key={member.id}
                  style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'background 100ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isMe ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.06)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#ffffff',
                    }}
                  >
                    {displayName.charAt(0)}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 400, color: isMe ? '#2dd4bf' : '#888899', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}{isMe ? ' (you)' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <div
          className="k-modal-overlay"
          onClick={() => setModal(null)}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="k-modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
            <div className="k-modal-title">Create Server</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = (e.target.elements?.name?.value || e.target.querySelector('[name=name]')?.value || 'My Server').trim();
                createServer.mutate({ name });
              }}
            >
              <input
                ref={createInputRef}
                name="name"
                placeholder="Server name"
                defaultValue="My Server"
                className="k-input"
                style={{ marginBottom: 16 }}
              />
              <div className="k-modal-actions">
                <button type="button" onClick={() => setModal(null)} className="k-btn k-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createServer.isPending} className="k-btn k-btn-primary">
                  {createServer.isPending ? '…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modal === 'invite' && server && (
        <div className="k-modal-overlay" onClick={() => setModal(null)} style={{ backdropFilter: 'blur(12px)' }}>
          <div className="k-modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.8)', maxWidth: 420 }}>
            <div className="k-modal-title">Invite People to {server.name}</div>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 16 }}>Share this link to invite others to your server.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                readOnly
                value={server.invite_code ? `${window.location.origin}/invite/${server.invite_code}` : ''}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 13 }}
              />
              <button type="button" className="k-btn k-btn-primary" onClick={() => { copyInviteLink(); toast.success('Copied!'); }}>Copy</button>
            </div>
            <div className="k-modal-actions">
              <button type="button" onClick={() => setModal(null)} className="k-btn k-btn-secondary">Done</button>
            </div>
          </div>
        </div>
      )}
      {modal === 'leaveServer' && server && (
        <div className="k-modal-overlay" onClick={() => setModal(null)} style={{ backdropFilter: 'blur(12px)' }}>
          <div className="k-modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
            <div className="k-modal-title" style={{ color: '#ef4444' }}>Leave "{server.name}"?</div>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 20 }}>You'll need an invite link to rejoin this server.</p>
            <div className="k-modal-actions">
              <button type="button" onClick={() => setModal(null)} className="k-btn k-btn-secondary">Cancel</button>
              <button type="button" onClick={() => leaveServerMutation.mutate()} disabled={leaveServerMutation.isPending} className="k-btn k-btn-danger">Leave Server</button>
            </div>
          </div>
        </div>
      )}
      {modal === 'join' && (
        <div
          className="k-modal-overlay"
          onClick={() => setModal(null)}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="k-modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
            <div className="k-modal-title">Join Server</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const code = e.target.elements?.code?.value || e.target.querySelector('[name=code]')?.value;
                joinServer.mutate(code);
              }}
            >
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  ref={joinInputRef}
                  name="code"
                  placeholder="Invite code or link"
                  className="k-input"
                  style={{ marginBottom: 0, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const t = await navigator.clipboard.readText();
                      if (joinInputRef.current) {
                        joinInputRef.current.value = t.replace(/.*\/invite\//i, '').replace(/[?#].*/, '').trim();
                        toast.success('Pasted from clipboard');
                      }
                    } catch {
                      toast.error('Could not read clipboard');
                    }
                  }}
                  aria-label="Paste invite from clipboard"
                  title="Paste"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: '#888899',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClipboardPaste size={16} />
                </button>
              </div>
              <div className="k-modal-actions">
                <button type="button" onClick={() => setModal(null)} className="k-btn k-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={joinServer.isPending} className="k-btn k-btn-primary">
                  {joinServer.isPending ? '…' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmMessage && (
        <div className="k-modal-overlay" onClick={() => setDeleteConfirmMessage(null)} style={{ backdropFilter: 'blur(12px)' }}>
          <div className="k-modal-box" onClick={(e) => e.stopPropagation()} style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.8)' }}>
            <div className="k-modal-title" style={{ color: '#ef4444' }}>Delete message?</div>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 20 }}>This cannot be undone.</p>
            <div className="k-modal-actions">
              <button type="button" onClick={() => setDeleteConfirmMessage(null)} className="k-btn k-btn-secondary">Cancel</button>
              <button type="button" onClick={() => deleteMessageMutation.mutate({ id: deleteConfirmMessage.id, isDM })} disabled={deleteMessageMutation.isPending} className="k-btn k-btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      <QuickSwitcher
        open={quickSwitcherOpen}
        onClose={() => setQuickSwitcherOpen(false)}
        servers={servers}
        channels={channels}
        conversations={conversations}
        currentServerId={server?.id}
        currentChannelId={channel?.id}
        currentConvId={conv?.id}
        onSelectServer={(s) => { selectServer(s); setQuickSwitcherOpen(false); }}
        onSelectChannel={(ch) => {
          const s = servers.find((x) => x.id === ch.server_id);
          if (s) selectServer(s);
          setChannel(ch);
          setView('server');
          setQuickSwitcherOpen(false);
        }}
        onSelectConv={(c) => { setConv(c); setView('home'); setQuickSwitcherOpen(false); }}
      />
    </div>
  );
}

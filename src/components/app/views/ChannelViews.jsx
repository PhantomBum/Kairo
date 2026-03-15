import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Megaphone, Users, Hand, Mic, MicOff, Headphones, Monitor, Video, PhoneOff, Settings,
  MessageSquare, ArrowUp, ArrowDown, Tag, CheckCircle, Image as ImageIcon, Film, Upload,
  BarChart3, Clock, Pencil, Columns, Plus, GripVertical, Trash2, ChevronRight,
  Palette, Type, StickyNote, MousePointer, Eraser, Square, Undo, Redo, Download,
  Music, Play, Volume2 as VolumeIcon, Bookmark, ExternalLink, Calendar, MapPin, Bell,
  TicketIcon, Lock, Send, X, Check, AlertCircle,
} from 'lucide-react';
import EmptyState from '@/components/kairo/EmptyState';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24',
};

// ── Announcement Channel ──
export function AnnouncementView({ channel, messages = [], isAdmin }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Megaphone className="w-5 h-5" style={{ color: P.accent }} />
          <span className="text-[13px] font-medium" style={{ color: P.muted }}>
            {isAdmin
              ? 'You can post announcements here. Only admins can send messages.'
              : 'Only admins can post in this channel. Members can follow to receive updates.'}
          </span>
        </div>
        {messages.length === 0 ? (
          <EmptyState type="noMessages" context={channel?.name} />
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className="p-4 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ background: P.surface }}>
                  {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : <span className="text-sm font-semibold" style={{ color: P.muted }}>{(msg.author_name || 'A').charAt(0)}</span>}
                </div>
                <div>
                  <div className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{msg.author_name}</div>
                  <div className="text-[11px]" style={{ color: P.muted }}>{new Date(msg.created_date).toLocaleDateString()}</div>
                </div>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: P.textSecondary }}>{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Forum Channel ──
export function ForumView({ channel }) {
  const [sort, setSort] = useState('latest');
  const [tagFilter, setTagFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Discussion');

  useEffect(() => {
    const key = `kairo-forum-${channel?.id}`;
    try { setPosts(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setPosts([]); }
  }, [channel?.id]);

  const savePost = () => {
    if (!newTitle.trim()) return;
    const post = { id: Date.now().toString(), title: newTitle.trim(), content: newContent.trim(), tag: newTag, author: 'You', replies: 0, created: new Date().toISOString() };
    const updated = [post, ...posts];
    setPosts(updated);
    try { localStorage.setItem(`kairo-forum-${channel?.id}`, JSON.stringify(updated)); } catch {}
    setNewTitle(''); setNewContent(''); setShowCreate(false);
  };

  const filtered = tagFilter ? posts.filter(p => p.tag === tagFilter) : posts;
  const sorted = [...filtered].sort((a, b) => sort === 'top' ? (b.replies - a.replies) : new Date(b.created) - new Date(a.created));

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {['latest', 'top', 'new'].map(s => (
              <button key={s} onClick={() => setSort(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors"
                style={{ background: sort === s ? P.accent : P.floating, color: sort === s ? '#0d1117' : P.textSecondary, border: `1px solid ${sort === s ? P.accent : P.border}` }}>
                {s === 'latest' ? 'Latest Activity' : s === 'top' ? 'Top' : 'New'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          {['Discussion', 'Question', 'Showcase', 'Bug Report', 'Suggestion'].map(tag => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors"
              style={{ background: tagFilter === tag ? `${P.accent}20` : P.floating, color: tagFilter === tag ? P.accent : P.muted, border: `1px solid ${tagFilter === tag ? `${P.accent}40` : P.border}` }}>
              <Tag className="w-3 h-3 inline mr-1" />{tag}
            </button>
          ))}
        </div>

        {showCreate && (
          <div className="p-4 rounded-xl mb-4 space-y-3 k-fade-in" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title"
              className="w-full px-3 py-2 rounded-lg text-[14px] font-semibold outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} autoFocus />
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Write your post..."
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-24" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
            <div className="flex items-center justify-between">
              <select value={newTag} onChange={e => setNewTag(e.target.value)} className="px-2 py-1 rounded-md text-[12px] outline-none" style={{ background: P.base, color: P.muted, border: `1px solid ${P.border}` }}>
                {['Discussion', 'Question', 'Showcase', 'Bug Report', 'Suggestion'].map(t => <option key={t}>{t}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: P.muted }}>Cancel</button>
                <button onClick={savePost} disabled={!newTitle.trim()} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40" style={{ background: P.accent }}>Post</button>
              </div>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No posts yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Start a discussion by creating the first post.</p>
          </div>
        ) : sorted.map(post => (
          <div key={post.id} className="p-4 rounded-xl mb-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: `${P.accent}20`, color: P.accent }}>{post.tag}</span>
                </div>
                <h3 className="text-[14px] font-semibold mb-0.5 truncate" style={{ color: P.textPrimary }}>{post.title}</h3>
                {post.content && <p className="text-[12px] line-clamp-2" style={{ color: P.muted }}>{post.content}</p>}
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: P.muted }}>
                  <span>{post.author}</span>
                  <span>{new Date(post.created).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies} replies</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage Channel ──
export function StageView({ channel }) {
  const [raised, setRaised] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <div className="flex-1 flex flex-col" style={{ background: P.base }}>
      <div className="px-6 py-4 text-center" style={{ borderBottom: `1px solid ${P.border}` }}>
        <h2 className="text-[18px] font-bold" style={{ color: P.textPrimary }}>{channel?.name || 'Stage'}</h2>
        <p className="text-[13px] mt-1" style={{ color: P.muted }}>{channel?.description || 'No topic set'}</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-[12px] flex items-center gap-1" style={{ color: P.muted }}><Users className="w-3.5 h-3.5" /> 0 listeners</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-[13px] mb-4 font-semibold" style={{ color: P.textSecondary }}>Speakers</p>
        <div className="flex gap-4 flex-wrap justify-center mb-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2" style={{ background: P.elevated, border: `2px solid ${P.accent}` }}>
              <Mic className="w-6 h-6" style={{ color: P.accent }} />
            </div>
            <p className="text-[12px] font-medium" style={{ color: P.textSecondary }}>Host</p>
          </div>
        </div>

        <p className="text-[13px] mb-3 font-semibold" style={{ color: P.textSecondary }}>Audience</p>
        <div className="text-center py-4">
          <p className="text-[12px]" style={{ color: P.muted }}>No one else is listening yet. Share this stage to invite others.</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 p-4" style={{ background: P.elevated, borderTop: `1px solid ${P.border}` }}>
        <button onClick={() => setRaised(!raised)} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{ background: raised ? `${P.warning}20` : P.floating, border: raised ? `2px solid ${P.warning}` : `2px solid transparent` }}>
          <Hand className="w-5 h-5" style={{ color: raised ? P.warning : P.muted }} />
        </button>
        <button onClick={() => setMuted(!muted)} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{ background: !muted ? `${P.success}20` : P.floating }}>
          {muted ? <MicOff className="w-5 h-5" style={{ color: P.muted }} /> : <Mic className="w-5 h-5" style={{ color: P.success }} />}
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${P.danger}20` }}>
          <PhoneOff className="w-5 h-5" style={{ color: P.danger }} />
        </button>
      </div>
    </div>
  );
}

// ── Media Channel ──
export function MediaView({ channel, isAdmin }) {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const key = `kairo-media-${channel?.id}`;
    try { setItems(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setItems([]); }
  }, [channel?.id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const { base44 } = await import('@/api/base44Client');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const isVideo = file.type.startsWith('video');
      const item = { id: Date.now().toString(), url: file_url, name: file.name, type: isVideo ? 'video' : 'image', uploaded: new Date().toISOString(), uploader: 'You' };
      const updated = [item, ...items];
      setItems(updated);
      try { localStorage.setItem(`kairo-media-${channel?.id}`, JSON.stringify(updated)); } catch {}
    } catch {}
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === (filter === 'images' ? 'image' : 'video'));

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {['all', 'images', 'videos'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize"
                style={{ background: filter === f ? P.accent : P.floating, color: filter === f ? '#fff' : P.textSecondary }}>
                {f === 'all' ? 'All' : f === 'images' ? 'Images' : 'Videos'}
              </button>
            ))}
          </div>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No media yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Upload images and videos to share with the server.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map(item => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer" style={{ background: P.floating }}>
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: P.base }}>
                    <Play className="w-8 h-8" style={{ color: P.textSecondary }} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                  <p className="text-[11px] text-white truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Polls Channel ──
export function PollsView({ channel }) {
  const [polls, setPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    const key = `kairo-polls-${channel?.id}`;
    try { setPolls(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setPolls([]); }
  }, [channel?.id]);

  const createPoll = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;
    const poll = { id: Date.now().toString(), question: question.trim(), options: options.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: 0 })), created: new Date().toISOString(), totalVotes: 0, voted: null };
    const updated = [poll, ...polls];
    setPolls(updated);
    try { localStorage.setItem(`kairo-polls-${channel?.id}`, JSON.stringify(updated)); } catch {}
    setQuestion(''); setOptions(['', '']); setShowCreate(false);
  };

  const vote = (pollId, optIdx) => {
    setPolls(prev => {
      const updated = prev.map(p => {
        if (p.id !== pollId || p.voted !== null) return p;
        const newOpts = p.options.map((o, i) => i === optIdx ? { ...o, votes: o.votes + 1 } : o);
        return { ...p, options: newOpts, totalVotes: p.totalVotes + 1, voted: optIdx };
      });
      try { localStorage.setItem(`kairo-polls-${channel?.id}`, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold" style={{ color: P.textPrimary }}>Polls</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            <Plus className="w-4 h-4" /> Create Poll
          </button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-xl mb-4 space-y-3 k-fade-in" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..."
              className="w-full px-3 py-2 rounded-lg text-[14px] font-semibold outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} autoFocus />
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
                {options.length > 2 && <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-1"><X className="w-3.5 h-3.5" style={{ color: P.muted }} /></button>}
              </div>
            ))}
            {options.length < 6 && <button onClick={() => setOptions([...options, ''])} className="text-[12px] font-medium" style={{ color: P.accent }}>+ Add option</button>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: P.muted }}>Cancel</button>
              <button onClick={createPoll} disabled={!question.trim() || options.filter(o => o.trim()).length < 2} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40" style={{ background: P.accent }}>Create</button>
            </div>
          </div>
        )}

        {polls.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No polls yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Create a poll to get the community's opinion.</p>
          </div>
        ) : polls.map(poll => (
          <div key={poll.id} className="p-4 rounded-xl mb-3" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <h3 className="text-[14px] font-semibold mb-3" style={{ color: P.textPrimary }}>{poll.question}</h3>
            <div className="space-y-2">
              {poll.options.map((opt, i) => {
                const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                const isVoted = poll.voted === i;
                return (
                  <button key={i} onClick={() => vote(poll.id, i)} disabled={poll.voted !== null}
                    className="w-full text-left px-3 py-2 rounded-lg relative overflow-hidden transition-colors disabled:cursor-default"
                    style={{ background: P.base, border: `1px solid ${isVoted ? P.accent : P.border}` }}>
                    {poll.voted !== null && <div className="absolute inset-y-0 left-0 rounded-lg transition-all" style={{ width: `${pct}%`, background: isVoted ? `${P.accent}25` : 'rgba(255,255,255,0.03)' }} />}
                    <div className="relative flex items-center justify-between">
                      <span className="text-[13px]" style={{ color: isVoted ? P.accent : P.textSecondary }}>{opt.text}</span>
                      {poll.voted !== null && <span className="text-[12px] font-semibold" style={{ color: P.muted }}>{pct}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] mt-2" style={{ color: P.muted }}>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Canvas Channel ──
export function CanvasView({ channel }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#2dd4bf');
  const lastPos = useRef(null);
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];
  const colors = ['#2dd4bf', '#f87171', '#34d399', '#fbbf24', '#5eead4', '#eb459e', '#ffffff'];

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#1a1a1f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const startDraw = (e) => { if (tool !== 'pen' && tool !== 'eraser') return; setDrawing(true); lastPos.current = getPos(e); };
  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a1f' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : 3; ctx.lineCap = 'round'; ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = () => setDrawing(false);

  const exportPng = () => {
    const a = document.createElement('a'); a.download = `canvas-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL(); a.click();
  };

  return (
    <div className="flex-1 flex flex-col" style={{ background: '#1a1a1f' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: P.elevated, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-1">
          {tools.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" title={t.label}
              style={{ background: tool === t.id ? P.accent : 'transparent', color: tool === t.id ? '#0d1117' : P.muted }}>
              <t.icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-6 mx-2" style={{ background: P.border }} />
          {colors.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full mx-0.5" style={{ background: c, border: color === c ? '2px solid #fff' : '2px solid transparent' }} />
          ))}
        </div>
        <button onClick={exportPng} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold" style={{ background: P.floating, color: P.textSecondary, border: `1px solid ${P.border}` }}>
          <Download className="w-3.5 h-3.5" /> Export PNG
        </button>
      </div>
      <canvas ref={canvasRef} className="flex-1 cursor-crosshair" style={{ display: 'block' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
    </div>
  );
}

// ── Boards Channel (Kanban) ──
export function BoardsView({ channel }) {
  const [columns, setColumns] = useState([
    { id: 'todo', name: 'To Do', color: P.accent, cards: [] },
    { id: 'progress', name: 'In Progress', color: P.warning, cards: [] },
    { id: 'done', name: 'Done', color: P.success, cards: [] },
  ]);
  const [adding, setAdding] = useState(null);
  const [newCard, setNewCard] = useState('');

  useEffect(() => {
    const key = `kairo-board-${channel?.id}`;
    try { const saved = JSON.parse(localStorage.getItem(key)); if (saved) setColumns(saved); } catch {}
  }, [channel?.id]);

  const save = (cols) => { try { localStorage.setItem(`kairo-board-${channel?.id}`, JSON.stringify(cols)); } catch {} };

  const addCard = (colId) => {
    if (!newCard.trim()) return;
    const updated = columns.map(c => c.id === colId ? { ...c, cards: [...c.cards, { id: Date.now().toString(), text: newCard.trim() }] } : c);
    setColumns(updated); save(updated);
    setNewCard(''); setAdding(null);
  };

  const deleteCard = (colId, cardId) => {
    const updated = columns.map(c => c.id === colId ? { ...c, cards: c.cards.filter(x => x.id !== cardId) } : c);
    setColumns(updated); save(updated);
  };

  const addColumn = () => {
    const name = prompt('Column name:');
    if (!name?.trim()) return;
    const updated = [...columns, { id: Date.now().toString(), name: name.trim(), color: P.muted, cards: [] }];
    setColumns(updated); save(updated);
  };

  return (
    <div className="flex-1 overflow-x-auto scrollbar-none p-4" style={{ background: P.elevated }}>
      <div className="flex gap-4 h-full min-w-max">
        {columns.map(col => (
          <div key={col.id} className="w-72 flex-shrink-0 flex flex-col rounded-xl" style={{ background: P.surface }}>
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{col.name}</span>
              <span className="text-[11px] ml-auto" style={{ color: P.muted }}>{col.cards.length}</span>
            </div>
            <div className="flex-1 px-2 pb-2 space-y-2 min-h-[100px] overflow-y-auto scrollbar-none">
              {col.cards.map(card => (
                <div key={card.id} className="p-3 rounded-lg group" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
                  <div className="flex items-start justify-between">
                    <p className="text-[13px]" style={{ color: P.textSecondary }}>{card.text}</p>
                    <button onClick={() => deleteCard(col.id, card.id)} className="opacity-0 group-hover:opacity-100 p-1 -mt-1 -mr-1">
                      <X className="w-3 h-3" style={{ color: P.muted }} />
                    </button>
                  </div>
                </div>
              ))}
              {col.cards.length === 0 && !adding && (
                <div className="h-16 rounded-lg flex items-center justify-center" style={{ border: `2px dashed ${P.border}` }}>
                  <span className="text-[12px]" style={{ color: P.muted }}>No cards yet</span>
                </div>
              )}
            </div>
            {adding === col.id ? (
              <div className="px-2 pb-2">
                <input value={newCard} onChange={e => setNewCard(e.target.value)} placeholder="Card title..." autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') addCard(col.id); if (e.key === 'Escape') { setAdding(null); setNewCard(''); } }}
                  className="w-full px-2.5 py-2 rounded-lg text-[12px] outline-none mb-1" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
                <div className="flex gap-1">
                  <button onClick={() => addCard(col.id)} className="px-3 py-1 rounded text-[11px] font-semibold text-white" style={{ background: P.accent }}>Add</button>
                  <button onClick={() => { setAdding(null); setNewCard(''); }} className="px-2 py-1 rounded text-[11px]" style={{ color: P.muted }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(col.id)} className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-b-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ color: P.muted }}>
                <Plus className="w-4 h-4" /> Add Card
              </button>
            )}
          </div>
        ))}
        <button onClick={addColumn} className="w-72 h-12 flex-shrink-0 flex items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ background: P.surface, color: P.muted, border: `2px dashed ${P.border}` }}>
          <Plus className="w-4 h-4" /> Add Column
        </button>
      </div>
    </div>
  );
}

// ── Sounds Channel ──
export function SoundsView({ channel, isAdmin }) {
  const [playing, setPlaying] = useState(null);
  const sounds = [
    { name: 'Airhorn', emoji: '📯', freq: 440 }, { name: 'Drumroll', emoji: '🥁', freq: 220 },
    { name: 'Applause', emoji: '👏', freq: 330 }, { name: 'Tada', emoji: '🎉', freq: 523 },
    { name: 'Sad Trombone', emoji: '🎺', freq: 175 }, { name: 'Crickets', emoji: '🦗', freq: 880 },
    { name: 'Ding', emoji: '🔔', freq: 659 }, { name: 'Whoosh', emoji: '💨', freq: 392 },
  ];

  const playSound = (sound) => {
    setPlaying(sound.name);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = sound.freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch {}
    setTimeout(() => setPlaying(null), 500);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none p-4" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold" style={{ color: P.textPrimary }}>Soundboard</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {sounds.map(s => (
            <button key={s.name} onClick={() => playSound(s)}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: playing === s.name ? `${P.accent}20` : P.floating, border: `1px solid ${playing === s.name ? P.accent : P.border}`, transform: playing === s.name ? 'scale(1.05)' : 'scale(1)' }}>
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-[11px] font-medium" style={{ color: P.textSecondary }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Marks Channel (Server Moments) ──
export function MarksView({ channel, serverId }) {
  const [moments, setMoments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    (async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        let items = [];
        try { items = await base44.entities.Moment.filter({ server_id: serverId }); } catch {
          try { items = await base44.entities.Highlight.filter({ server_id: serverId }); } catch {}
        }
        setMoments(items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch {}
      setLoading(false);
    })();
  }, [serverId]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-5">
          <Bookmark className="w-5 h-5" style={{ color: P.accent }} />
          <h2 className="text-[15px] font-semibold" style={{ color: P.textPrimary }}>Server Moments</h2>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: P.accent }} />
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No moments yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Server admins can mark messages as Moments from the message menu.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moments.map(m => (
              <div key={m.id} className="p-4 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
                {m.title && <h3 className="text-[14px] font-semibold mb-1" style={{ color: P.textPrimary }}>{m.title}</h3>}
                {m.content && (
                  <div className="p-3 rounded-lg mb-2" style={{ background: P.base }}>
                    <p className="text-[13px]" style={{ color: P.textSecondary }}>{m.content}</p>
                    {m.author_name && <p className="text-[11px] mt-1" style={{ color: P.muted }}>— {m.author_name}</p>}
                  </div>
                )}
                {m.note && <p className="text-[12px] mb-2" style={{ color: P.muted }}>{m.note}</p>}
                <div className="flex items-center gap-2 text-[11px]" style={{ color: P.muted }}>
                  {m.source_channel && <span>#{m.source_channel}</span>}
                  <span>{new Date(m.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Events Channel ──
export function EventsView({ channel }) {
  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const key = `kairo-events-${channel?.id}`;
    try { setEvents(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setEvents([]); }
  }, [channel?.id]);

  const createEvent = () => {
    if (!name.trim() || !date) return;
    const evt = { id: Date.now().toString(), name: name.trim(), description: desc.trim(), date, location: location.trim(), interested: 0, created: new Date().toISOString() };
    const updated = [evt, ...events];
    setEvents(updated);
    try { localStorage.setItem(`kairo-events-${channel?.id}`, JSON.stringify(updated)); } catch {}
    setName(''); setDesc(''); setDate(''); setLocation(''); setShowCreate(false);
  };

  const toggleInterest = (id) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, interested: e.interested + 1 } : e);
      try { localStorage.setItem(`kairo-events-${channel?.id}`, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold" style={{ color: P.textPrimary }}>Events</h2>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {showCreate && (
          <div className="p-4 rounded-xl mb-4 space-y-3 k-fade-in" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Event name" className="w-full px-3 py-2 rounded-lg text-[14px] font-semibold outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} autoFocus />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-16" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
            <div className="flex gap-2">
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: P.muted }}>Cancel</button>
              <button onClick={createEvent} disabled={!name.trim() || !date} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40" style={{ background: P.accent }}>Create</button>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No events yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Create an event for your community to look forward to.</p>
          </div>
        ) : events.map(evt => (
          <div key={evt.id} className="p-4 rounded-xl mb-3" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${P.accent}15`, border: `1px solid ${P.accent}30` }}>
                <span className="text-[11px] font-bold uppercase" style={{ color: P.accent }}>{new Date(evt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                <span className="text-[18px] font-black leading-none" style={{ color: P.textPrimary }}>{new Date(evt.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{evt.name}</h3>
                {evt.description && <p className="text-[12px] mt-0.5" style={{ color: P.muted }}>{evt.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: P.muted }}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>}
                  <span className="flex items-center gap-1"><Bell className="w-3 h-3" />{evt.interested} interested</span>
                </div>
              </div>
              <button onClick={() => toggleInterest(evt.id)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex-shrink-0" style={{ background: `${P.accent}15`, color: P.accent, border: `1px solid ${P.accent}30` }}>
                Interested
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ticket Channel ──
export function TicketView({ channel }) {
  const [tickets, setTickets] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const key = `kairo-tickets-${channel?.id}`;
    try { setTickets(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setTickets([]); }
  }, [channel?.id]);

  const createTicket = () => {
    if (!subject.trim()) return;
    const ticket = { id: Date.now().toString(), subject: subject.trim(), description: description.trim(), status: 'open', created: new Date().toISOString() };
    const updated = [ticket, ...tickets];
    setTickets(updated);
    try { localStorage.setItem(`kairo-tickets-${channel?.id}`, JSON.stringify(updated)); } catch {}
    setSubject(''); setDescription(''); setShowCreate(false);
  };

  const updateStatus = (id, status) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status } : t);
    setTickets(updated);
    try { localStorage.setItem(`kairo-tickets-${channel?.id}`, JSON.stringify(updated)); } catch {}
  };

  const statusColors = { open: P.success, 'in-progress': P.warning, closed: P.muted };
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ background: P.elevated }}>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5" style={{ color: P.accent }} />
            <h2 className="text-[15px] font-semibold" style={{ color: P.textPrimary }}>Support Tickets</h2>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold" style={{ background: P.accent, color: '#0d1117' }}>
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'open', 'in-progress', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors"
              style={{ background: filter === s ? P.floating : 'transparent', color: filter === s ? P.textSecondary : P.muted, border: `1px solid ${filter === s ? P.border : 'transparent'}` }}>
              {s === 'all' ? `All (${tickets.length})` : `${s.replace('-', ' ')} (${tickets.filter(t => t.status === s).length})`}
            </button>
          ))}
        </div>

        {showCreate && (
          <div className="p-4 rounded-xl mb-4 space-y-3 k-fade-in" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 rounded-lg text-[14px] font-semibold outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} autoFocus />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your issue..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-20" style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: P.muted }}>Cancel</button>
              <button onClick={createTicket} disabled={!subject.trim()} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40" style={{ background: P.accent }}>Submit</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <TicketIcon className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.4 }} />
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>No tickets yet</p>
            <p className="text-[12px] mt-1" style={{ color: P.muted }}>Create a ticket to get help from the staff team.</p>
          </div>
        ) : filtered.map(ticket => (
          <div key={ticket.id} className="p-4 rounded-xl mb-2" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: statusColors[ticket.status] }} />
                  <h3 className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{ticket.subject}</h3>
                </div>
                {ticket.description && <p className="text-[12px] ml-4 line-clamp-2" style={{ color: P.muted }}>{ticket.description}</p>}
                <p className="text-[11px] mt-1.5 ml-4" style={{ color: P.muted }}>{new Date(ticket.created).toLocaleDateString()}</p>
              </div>
              <select value={ticket.status} onChange={e => updateStatus(ticket.id, e.target.value)}
                className="text-[11px] px-2 py-1 rounded-md outline-none" style={{ background: P.base, color: P.muted, border: `1px solid ${P.border}` }}>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Heart, MessageCircle, UserPlus, UserMinus, Image, Send, X, Globe } from 'lucide-react';
import { colors, shadows, radius } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

function PostCard({ post, currentUserId, onLike }) {
  const liked = post.likes?.includes(currentUserId);
  return (
    <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
          style={{ background: colors.bg.overlay, color: colors.text.muted }}>
          {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" alt="" /> : (post.author_name || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{post.author_name}</p>
          <p className="text-[11px]" style={{ color: colors.text.disabled }}>{new Date(post.created_date).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="text-[14px] leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: colors.text.secondary }}>{post.content}</p>
      {post.attachments?.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.attachments.map((a, i) => a.content_type?.startsWith('image/') ? (
            <img key={i} src={a.url} className="max-h-[200px] rounded-lg object-cover" alt="" />
          ) : null)}
        </div>
      )}
      <div className="flex items-center gap-4 pt-2" style={{ borderTop: `1px solid ${colors.border.default}` }}>
        <button onClick={() => onLike(post)} className="flex items-center gap-1.5 text-[13px] transition-colors"
          style={{ color: liked ? colors.danger : colors.text.muted }}>
          <Heart className="w-4 h-4" fill={liked ? colors.danger : 'none'} /> {post.like_count || 0}
        </button>
        <span className="flex items-center gap-1.5 text-[13px]" style={{ color: colors.text.muted }}>
          <MessageCircle className="w-4 h-4" /> {post.comment_count || 0}
        </span>
      </div>
    </div>
  );
}

export function CreateSpaceModal({ onClose, currentUser, profile }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await base44.entities.Space.create({ name: name.trim(), description: desc.trim(), owner_id: currentUser.id, owner_name: profile?.display_name || currentUser.full_name, follower_count: 1 });
    setCreating(false);
    onClose();
  };

  return (
    <ModalWrapper title="Create Space" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Space Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My Space" autoFocus
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this Space about?" rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <button onClick={create} disabled={!name.trim() || creating} className="w-full py-3 rounded-xl text-[14px] font-semibold disabled:opacity-30"
          style={{ background: colors.accent.primary, color: '#fff' }}>{creating ? 'Creating...' : 'Create Space'}</button>
      </div>
    </ModalWrapper>
  );
}

export default function SpacesView({ currentUser, profile }) {
  const [spaces, setSpaces] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeSpace, setActiveSpace] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [s, f] = await Promise.all([
      base44.entities.Space.list('-created_date', 50),
      base44.entities.SpaceFollower.filter({ user_id: currentUser.id }),
    ]);
    setSpaces(s); setFollowers(f); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (activeSpace) { base44.entities.SpacePost.filter({ space_id: activeSpace.id }, '-created_date', 50).then(setPosts); }
  }, [activeSpace?.id]);

  const isFollowing = (spaceId) => followers.some(f => f.space_id === spaceId);

  const toggleFollow = async (space) => {
    const existing = followers.find(f => f.space_id === space.id);
    if (existing) {
      await base44.entities.SpaceFollower.delete(existing.id);
      await base44.entities.Space.update(space.id, { follower_count: Math.max(0, (space.follower_count || 1) - 1) });
    } else {
      await base44.entities.SpaceFollower.create({ space_id: space.id, user_id: currentUser.id, user_name: profile?.display_name });
      await base44.entities.Space.update(space.id, { follower_count: (space.follower_count || 0) + 1 });
    }
    load();
  };

  const handlePost = async () => {
    if (!newPost.trim() || !activeSpace) return;
    setPosting(true);
    await base44.entities.SpacePost.create({ space_id: activeSpace.id, author_id: currentUser.id, author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url, content: newPost.trim() });
    setNewPost('');
    const p = await base44.entities.SpacePost.filter({ space_id: activeSpace.id }, '-created_date', 50);
    setPosts(p); setPosting(false);
  };

  const handleLike = async (post) => {
    const liked = post.likes?.includes(currentUser.id);
    const newLikes = liked ? (post.likes || []).filter(id => id !== currentUser.id) : [...(post.likes || []), currentUser.id];
    await base44.entities.SpacePost.update(post.id, { likes: newLikes, like_count: newLikes.length });
    const p = await base44.entities.SpacePost.filter({ space_id: activeSpace.id }, '-created_date', 50);
    setPosts(p);
  };

  if (activeSpace) {
    return (
      <div className="flex-1 flex flex-col min-h-0 p-6">
        <button onClick={() => setActiveSpace(null)} className="text-[13px] mb-4 hover:underline" style={{ color: colors.text.link }}>← Back to Spaces</button>
        <div className="mb-6">
          <h2 className="text-[24px] font-bold" style={{ color: colors.text.primary }}>{activeSpace.name}</h2>
          <p className="text-[14px] mt-1" style={{ color: colors.text.muted }}>{activeSpace.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[12px]" style={{ color: colors.text.disabled }}>{activeSpace.follower_count || 0} followers</span>
            <button onClick={() => toggleFollow(activeSpace)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ background: isFollowing(activeSpace.id) ? colors.bg.elevated : colors.accent.primary, color: isFollowing(activeSpace.id) ? colors.text.secondary : '#fff' }}>
              {isFollowing(activeSpace.id) ? <><UserMinus className="w-3.5 h-3.5" /> Unfollow</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
            </button>
          </div>
        </div>
        {/* New post */}
        <div className="mb-4 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Write a post..." rows={3}
            className="w-full bg-transparent text-[14px] outline-none resize-none mb-2" style={{ color: colors.text.primary }} />
          <div className="flex justify-end">
            <button onClick={handlePost} disabled={!newPost.trim() || posting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
              style={{ background: colors.accent.primary, color: '#fff' }}><Send className="w-4 h-4" /> Post</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
          {posts.map(p => <PostCard key={p.id} post={p} currentUserId={currentUser.id} onLike={handleLike} />)}
          {posts.length === 0 && <p className="text-center py-12 text-[14px]" style={{ color: colors.text.muted }}>No posts yet. Be the first!</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: colors.text.primary }}>Kairo Spaces</h2>
          <p className="text-[14px]" style={{ color: colors.text.muted }}>Lightweight public communities — announcements, blogs, portfolios.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold"
          style={{ background: colors.accent.primary, color: '#fff' }}><Plus className="w-4 h-4" /> Create Space</button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto scrollbar-none">
          {spaces.map(s => (
            <button key={s.id} onClick={() => setActiveSpace(s)} className="text-left p-4 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.accent.subtle }}>
                  <Globe className="w-5 h-5" style={{ color: colors.accent.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }}>{s.name}</p>
                  <p className="text-[12px]" style={{ color: colors.text.muted }}>{s.follower_count || 0} followers · by {s.owner_name}</p>
                </div>
              </div>
              {s.description && <p className="text-[13px] line-clamp-2" style={{ color: colors.text.secondary }}>{s.description}</p>}
            </button>
          ))}
          {spaces.length === 0 && <p className="col-span-2 text-center py-12 text-[14px]" style={{ color: colors.text.muted }}>No Spaces yet. Create one!</p>}
        </div>
      )}
      {showCreate && <CreateSpaceModal onClose={() => { setShowCreate(false); load(); }} currentUser={currentUser} profile={profile} />}
    </div>
  );
}
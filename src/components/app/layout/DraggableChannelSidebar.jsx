import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Hash, Volume2, Megaphone, Radio, MessageSquare, Lock, ChevronDown, ChevronRight,
  Plus, Settings, GripVertical, LayoutGrid, ShieldAlert, CalendarDays, Search, BellOff, Clock3,
} from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import ServerBannerHeader from './ServerBannerHeader';
import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary,
};

const typeIcons = {
  text: Hash, voice: Volume2, announcement: Megaphone,
  stage: Radio, forum: MessageSquare, board: LayoutGrid,
};

function ChannelItem({ channel, active, unread, muted, onClick, onSettings, onJumpToDate, isOwner, index, voiceStates }) {
  const Icon = typeIcons[channel.type] || Hash;
  const isMuted = muted || channel.is_muted;
  const hasUnread = unread || channel.has_unread;

  return (
    <Draggable draggableId={channel.id} index={index} isDragDisabled={!isOwner}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <ContextMenu>
            <ContextMenuTrigger>
              <button onClick={() => onClick(channel)}
                className="w-full flex items-center gap-2 rounded-md group relative transition-all duration-[120ms] ease-out active:scale-[0.99]"
                style={{
                  height: 40,
                  padding: '0 10px',
                  background: snapshot.isDragging
                    ? 'var(--surface-glass)'
                    : active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? P.textPrimary : hasUnread ? '#ffffff' : isMuted ? 'var(--text-faint)' : P.textSecondary,
                  fontWeight: active || hasUnread ? 500 : 400,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-raised)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Active left indicator — 2px full height */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-r-full"
                    style={{ background: P.accent }} />
                )}

                {isOwner && (
                  <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-30 flex-shrink-0" />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0"
                  style={{ color: active ? P.textSecondary : isMuted ? 'var(--text-faint)' : P.muted, transition: 'color 150ms ease' }} />
                <span className="truncate flex-1 min-w-0 text-left text-[14px]">{channel.name}</span>
                {hasUnread && !active && null}
                {channel.is_nsfw && (
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-danger)', opacity: 0.5 }} />
                )}
                {channel.is_private && (
                  <Lock className="w-3.5 h-3.5 opacity-30 flex-shrink-0" />
                )}
                {channel.slow_mode_seconds > 0 && (
                  <Clock3 className="w-3 h-3 flex-shrink-0" style={{ color: P.muted, opacity: 0.6 }} />
                )}
                {isMuted && (
                  <BellOff className="w-3 h-3 flex-shrink-0" style={{ color: P.muted, opacity: 0.5 }} />
                )}
                {(channel.type === 'voice' || channel.type === 'stage') && voiceStates && voiceStates.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3ba55d' }} />
                    <span className="text-[11px] tabular-nums" style={{ color: P.muted }}>{voiceStates.length}</span>
                  </div>
                )}
                {isOwner && (
                  <button onClick={e => { e.stopPropagation(); onSettings?.(channel); }}
                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 p-0.5 rounded transition-opacity flex-shrink-0">
                    <Settings className="w-3.5 h-3.5" style={{ color: P.muted }} />
                  </button>
                )}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52 p-1.5" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', borderRadius: 12, boxShadow: 'var(--shadow-floating)' }}>
              <ContextMenuItem onClick={() => navigator.clipboard.writeText(channel.id)} className="text-[13px] gap-2 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
                <Hash className="w-4 h-4 opacity-50" /> Copy Channel ID
              </ContextMenuItem>
              {channel.type === 'text' && (
                <ContextMenuItem onClick={() => { onClick(channel); onJumpToDate?.(); }} className="text-[13px] gap-2 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
                  <CalendarDays className="w-4 h-4 opacity-50" /> Jump to Date
                </ContextMenuItem>
              )}
              {isOwner && (
                <>
                  <ContextMenuSeparator style={{ background: P.border, margin: '4px 0' }} />
                  <ContextMenuItem onClick={() => onSettings?.(channel)} className="text-[13px] gap-2 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
                    <Settings className="w-4 h-4 opacity-50" /> Edit Channel
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      )}
    </Draggable>
  );
}

function CategoryGroup({ category, channels, activeId, onSelect, onAdd, onSettings, onJumpToDate, isOwner, index, voiceStates }) {
  const [open, setOpen] = useState(true);
  const sortedChannels = [...channels].sort((a, b) => (a.position || 0) - (b.position || 0));
  const textLikeChannels = sortedChannels.filter(ch => ch.type !== 'voice' && ch.type !== 'stage');
  const voiceLikeChannels = sortedChannels.filter(ch => ch.type === 'voice' || ch.type === 'stage');

  return (
    <Draggable draggableId={`cat-${category.id}`} index={index} isDragDisabled={!isOwner}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-0.5">
          <div {...provided.dragHandleProps}>
            <button onClick={() => setOpen(!open)}
              className="w-full flex items-center gap-1 px-1 pt-6 pb-2 group min-h-[40px] relative">
              {open
                ? <ChevronDown className="w-3 h-3 flex-shrink-0 transition-transform" style={{ color: P.muted }} />
                : <ChevronRight className="w-3 h-3 flex-shrink-0 transition-transform" style={{ color: P.muted }} />
              }
              <span className="text-[10px] font-bold flex-1 text-left truncate min-w-0"
                style={{
                  color: P.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                {category.name}
              </span>
              {isOwner && (
                <button onClick={e => { e.stopPropagation(); onAdd(category.id); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[rgba(255,255,255,0.06)] transition-opacity flex-shrink-0"
                  style={{ color: P.muted }}>
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </button>
          </div>
          <div style={{
            overflow: 'hidden',
            maxHeight: open ? '2000px' : '0px',
            opacity: open ? 1 : 0,
            transition: 'max-height 200ms ease, opacity 150ms ease',
          }}>
            <Droppable droppableId={`cat-${category.id}`} type="channel">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-[1px] min-h-[2px]">
                  {textLikeChannels.length > 0 && (
                    <>
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: P.muted }}>
                        Text Channels
                      </div>
                      {textLikeChannels.map((ch, i) => (
                        <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect}
                          onSettings={onSettings} onJumpToDate={onJumpToDate} isOwner={isOwner} index={i}
                          voiceStates={(voiceStates || []).filter(s => s.channel_id === ch.id)} />
                      ))}
                    </>
                  )}
                  {voiceLikeChannels.length > 0 && (
                    <>
                      <div className="h-px mx-2 my-2" style={{ background: P.border }} />
                      <div className="px-2 pb-0.5 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: P.muted }}>
                        Voice Channels
                      </div>
                      {voiceLikeChannels.map((ch, i) => (
                        <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect}
                          onSettings={onSettings} onJumpToDate={onJumpToDate} isOwner={isOwner} index={textLikeChannels.length + i}
                          voiceStates={(voiceStates || []).filter(s => s.channel_id === ch.id)} />
                      ))}
                    </>
                  )}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function DraggableChannelSidebar({
  server, categories, channels, activeId, onSelect, onAdd, onAddCategory,
  onSettings, onInvite, onModPanel, onAnalytics, onBackups,
  onChannelSettings, onJumpToDate, voiceStates, isOwner, onLeaveServer,
  boostCount, boostLevel, isBoosted, onBoost, onShop, shopEnabled, memberCount, onlineCount,
}) {
  const sorted = [...(categories || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));
  const scrollRef = useRef(null);
  const [search, setSearch] = useState('');
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollY(e.target.scrollTop);
  }, []);

  const filteredChannels = search
    ? (channels || []).filter(ch => ch.name?.toLowerCase().includes(search.toLowerCase()))
    : null;

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination || !isOwner) return;
    const { source, destination, type, draggableId } = result;

    if (type === 'category') {
      const reordered = [...sorted];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      await Promise.all(reordered.map((cat, i) => base44.entities.Category.update(cat.id, { position: i })));
      return;
    }

    const chId = draggableId;
    const dstCatRaw = destination.droppableId.replace('cat-', '');
    const srcCatRaw = source.droppableId.replace('cat-', '');
    const newCategoryId = dstCatRaw === 'uncategorized' ? '' : dstCatRaw;
    const dstChannels = dstCatRaw === 'uncategorized'
      ? uncategorized.filter(c => c.id !== chId)
      : (channels || []).filter(ch => ch.category_id === dstCatRaw && ch.id !== chId);
    const sortedDst = [...dstChannels].sort((a, b) => (a.position || 0) - (b.position || 0));
    sortedDst.splice(destination.index, 0, { id: chId });
    const updates = sortedDst.map((ch, i) => ch.id === chId
      ? base44.entities.Channel.update(chId, { category_id: newCategoryId, position: i })
      : base44.entities.Channel.update(ch.id, { position: i }));
    if (srcCatRaw !== dstCatRaw) {
      const srcChannels = srcCatRaw === 'uncategorized'
        ? uncategorized.filter(c => c.id !== chId)
        : (channels || []).filter(ch => ch.category_id === srcCatRaw && ch.id !== chId);
      srcChannels.sort((a, b) => (a.position || 0) - (b.position || 0)).forEach((ch, i) =>
        updates.push(base44.entities.Channel.update(ch.id, { position: i })));
    }
    await Promise.all(updates);
  }, [isOwner, sorted, channels, uncategorized]);

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: P.surface }}>
      <ServerBannerHeader
        server={server} isOwner={isOwner} onInvite={onInvite} onSettings={onSettings}
        onAnalytics={onAnalytics} onModPanel={onModPanel} onBackups={onBackups}
        onAddChannel={() => onAdd(sorted[0]?.id)} onAddCategory={onAddCategory}
        onLeaveServer={onLeaveServer}
        scrollY={scrollY}
        boostCount={boostCount} boostLevel={boostLevel} isBoosted={isBoosted}
        onBoost={onBoost} onShop={onShop} shopEnabled={shopEnabled}
        memberCount={memberCount} onlineCount={onlineCount}
      />

      {/* Search bar */}
      <div className="px-2.5 py-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-[6px] rounded-md"
          style={{ background: P.base }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.muted }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search channels"
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--text-faint)]"
            style={{ color: P.textPrimary }}
          />
        </div>
      </div>

      {/* Search results mode */}
      {filteredChannels ? (
        <div className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px]" style={{ color: P.muted }}>No channels found</p>
            </div>
          ) : (
            <div className="space-y-[1px]">
              {filteredChannels.map((ch) => {
                const Icon = typeIcons[ch.type] || Hash;
                return (
                  <button key={ch.id} onClick={() => { onSelect(ch); setSearch(''); }}
                    className="w-full flex items-center gap-2 px-2 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    style={{ height: 40, color: activeId === ch.id ? P.textPrimary : P.textSecondary }}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: P.muted }} />
                    <span className="text-[14px] truncate">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Normal channel list */
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories" type="category">
            {(provided) => (
              <div ref={(el) => { provided.innerRef(el); scrollRef.current = el; }}
                {...provided.droppableProps}
                className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2"
                onScroll={handleScroll}>

                {uncategorized.length > 0 && (
                  <Droppable droppableId="cat-uncategorized" type="channel">
                    {(dropP) => (
                      <div ref={dropP.innerRef} {...dropP.droppableProps} className="space-y-[1px] pt-1">
                        <div className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.09em]" style={{ color: P.textSecondary }}>
                          Channels
                        </div>
                        {uncategorized.filter(ch => ch.type !== 'voice' && ch.type !== 'stage').sort((a, b) => (a.position || 0) - (b.position || 0)).map((ch, i) => (
                          <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect}
                            onSettings={onChannelSettings} onJumpToDate={onJumpToDate} isOwner={isOwner} index={i}
                            voiceStates={(voiceStates || []).filter(s => s.channel_id === ch.id)} />
                        ))}
                        {uncategorized.some(ch => ch.type === 'voice' || ch.type === 'stage') && (
                          <>
                            <div className="h-px mx-2 my-2" style={{ background: P.border }} />
                            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: P.muted }}>
                              Voice Channels
                            </div>
                            {uncategorized.filter(ch => ch.type === 'voice' || ch.type === 'stage').sort((a, b) => (a.position || 0) - (b.position || 0)).map((ch, i) => (
                              <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect}
                                onSettings={onChannelSettings} onJumpToDate={onJumpToDate} isOwner={isOwner} index={100 + i}
                                voiceStates={(voiceStates || []).filter(s => s.channel_id === ch.id)} />
                            ))}
                          </>
                        )}
                        {dropP.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}

                {sorted.map((cat, i) => (
                  <CategoryGroup key={cat.id} category={cat} index={i}
                    channels={(channels || []).filter(ch => ch.category_id === cat.id)}
                    activeId={activeId} onSelect={onSelect} onAdd={onAdd} onSettings={onChannelSettings}
                    onJumpToDate={onJumpToDate} isOwner={isOwner} voiceStates={voiceStates} />
                ))}

                {isOwner && (
                  <button onClick={onAddCategory}
                    className="w-full flex items-center gap-2 px-3 py-2.5 mt-2 rounded-md text-[12px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    style={{ color: P.muted }}>
                    <Plus className="w-3.5 h-3.5" /> Create Category
                  </button>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

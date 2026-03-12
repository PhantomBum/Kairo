import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, Lock, ChevronDown, Plus, Settings, GripVertical, LayoutGrid, ShieldAlert } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors, shadows, glass } from '@/components/app/design/tokens';
import ServerBannerHeader from './ServerBannerHeader';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, board: LayoutGrid };

function ChannelItem({ channel, active, onClick, onSettings, isOwner, index }) {
  const Icon = typeIcons[channel.type] || Hash;
  return (
    <Draggable draggableId={channel.id} index={index} isDragDisabled={!isOwner}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <ContextMenu>
            <ContextMenuTrigger>
              <button onClick={() => onClick(channel)}
                className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl text-[13px] group"
                style={{
                  ...(active ? glass.active : {}),
                  background: snapshot.isDragging ? 'rgba(255,255,255,0.06)' : active ? 'rgba(139,92,246,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(139,92,246,0.18)' : '1px solid transparent',
                  color: active ? colors.text.primary : colors.text.muted,
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? '0 0 12px rgba(139,92,246,0.08)' : 'none',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                }}>
                {isOwner && <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-30 flex-shrink-0" />}
                <Icon className="w-[16px] h-[16px] flex-shrink-0" style={{ color: active ? colors.accent.hover : colors.text.disabled, transition: 'color 150ms cubic-bezier(0.4,0,0.2,1)' }} />
                <span className="truncate flex-1 text-left">{channel.name}</span>
                {channel.is_nsfw && <ShieldAlert className="w-3 h-3 flex-shrink-0" style={{ color: '#f23f43', opacity: 0.6 }} />}
                {channel.is_private && <Lock className="w-3 h-3 opacity-30" />}
                {isOwner && (
                  <button onClick={e => { e.stopPropagation(); onSettings?.(channel); }}
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-0.5 rounded transition-opacity">
                    <Settings className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />
                  </button>
                )}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: 'rgba(22,22,32,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: shadows.strong }}>
              <ContextMenuItem onClick={() => navigator.clipboard.writeText(channel.id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
                <Hash className="w-4 h-4 opacity-50" /> Copy Channel ID
              </ContextMenuItem>
              {isOwner && <>
                <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
                <ContextMenuItem onClick={() => onSettings?.(channel)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
                  <Settings className="w-4 h-4 opacity-50" /> Edit Channel
                </ContextMenuItem>
              </>}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      )}
    </Draggable>
  );
}

function CategoryGroup({ category, channels, activeId, onSelect, onAdd, onSettings, isOwner, index }) {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={`cat-${category.id}`} index={index} isDragDisabled={!isOwner}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-1">
          <div {...provided.dragHandleProps}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-1 pt-4 pb-1.5 group">
              <ChevronDown className="w-3 h-3" style={{ color: colors.text.disabled, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 200ms cubic-bezier(0,0,0.2,1)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] flex-1 text-left truncate" style={{ color: colors.text.disabled, letterSpacing: '0.08em' }}>{category.name}</span>
              {isOwner && <Plus onClick={e => { e.stopPropagation(); onAdd(category.id); }} className="w-[14px] h-[14px] opacity-0 group-hover:opacity-50 hover:opacity-100 cursor-pointer k-rotate-hover" style={{ color: colors.accent.hover }} />}
            </button>
          </div>
          <div style={{
            overflow: 'hidden',
            maxHeight: open ? '2000px' : '0px',
            opacity: open ? 1 : 0,
            transition: 'max-height 150ms cubic-bezier(0.4,0,0.2,1), opacity 150ms cubic-bezier(0.4,0,0.2,1)',
          }}>
            <Droppable droppableId={`cat-${category.id}`} type="channel">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-px min-h-[2px]">
                  {channels.sort((a, b) => (a.position || 0) - (b.position || 0)).map((ch, i) => (
                    <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect} onSettings={onSettings} isOwner={isOwner} index={i} />
                  ))}
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

export default function DraggableChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onAddCategory, onSettings, onInvite, onModPanel, onAnalytics, onBackups, onChannelSettings, isOwner }) {
  const sorted = [...(categories || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));
  const scrollRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollY(e.target.scrollTop);
  }, []);

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination || !isOwner) return;
    const { source, destination, type, draggableId } = result;

    if (type === 'category') {
      // Reorder categories
      const reordered = [...sorted];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      // Update all positions
      const updates = reordered.map((cat, i) =>
        base44.entities.Category.update(cat.id, { position: i })
      );
      await Promise.all(updates);
      return;
    }

    // Channel drag
    const chId = draggableId;
    const dstCatRaw = destination.droppableId.replace('cat-', '');
    const srcCatRaw = source.droppableId.replace('cat-', '');
    const newCategoryId = dstCatRaw === 'uncategorized' ? '' : dstCatRaw;

    // Get channels in the destination category
    const dstChannels = dstCatRaw === 'uncategorized'
      ? uncategorized.filter(c => c.id !== chId)
      : (channels || []).filter(ch => ch.category_id === dstCatRaw && ch.id !== chId);

    const sortedDst = [...dstChannels].sort((a, b) => (a.position || 0) - (b.position || 0));

    // Insert at destination index
    sortedDst.splice(destination.index, 0, { id: chId });

    // Batch update all positions in destination
    const updates = sortedDst.map((ch, i) => {
      if (ch.id === chId) {
        return base44.entities.Channel.update(chId, { category_id: newCategoryId, position: i });
      }
      return base44.entities.Channel.update(ch.id, { position: i });
    });

    // If moved between categories, also reorder source category
    if (srcCatRaw !== dstCatRaw) {
      const srcChannels = srcCatRaw === 'uncategorized'
        ? uncategorized.filter(c => c.id !== chId)
        : (channels || []).filter(ch => ch.category_id === srcCatRaw && ch.id !== chId);
      const sortedSrc = [...srcChannels].sort((a, b) => (a.position || 0) - (b.position || 0));
      sortedSrc.forEach((ch, i) => {
        updates.push(base44.entities.Channel.update(ch.id, { position: i }));
      });
    }

    await Promise.all(updates);
  }, [isOwner, sorted, channels, uncategorized]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Banner header */}
      <ServerBannerHeader
        server={server}
        isOwner={isOwner}
        scrollY={scrollY}
        onInvite={onInvite}
        onSettings={onSettings}
        onAnalytics={onAnalytics}
        onModPanel={onModPanel}
        onBackups={onBackups}
        onAddChannel={() => onAdd(sorted[0]?.id)}
      />

      {/* Channel list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div
              ref={(el) => { provided.innerRef(el); scrollRef.current = el; }}
              {...provided.droppableProps}
              className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2"
              onScroll={handleScroll}
            >
              {uncategorized.length > 0 && (
                <Droppable droppableId="cat-uncategorized" type="channel">
                  {(dropP) => (
                    <div ref={dropP.innerRef} {...dropP.droppableProps} className="space-y-px pt-2">
                      {uncategorized.sort((a, b) => (a.position || 0) - (b.position || 0)).map((ch, i) => (
                        <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect} onSettings={onChannelSettings} isOwner={isOwner} index={i} />
                      ))}
                      {dropP.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
              {sorted.map((cat, i) => (
                <CategoryGroup key={cat.id} category={cat} index={i}
                  channels={(channels || []).filter(ch => ch.category_id === cat.id)}
                  activeId={activeId} onSelect={onSelect} onAdd={onAdd} onSettings={onChannelSettings} isOwner={isOwner} />
              ))}
              {isOwner && (
                <button onClick={onAddCategory}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-[12px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ color: colors.text.disabled }}>
                  <Plus className="w-3.5 h-3.5 k-rotate-hover" /> Create Category
                </button>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
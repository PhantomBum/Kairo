import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, Lock, ChevronDown, Plus, Settings, UserPlus, Shield, BarChart3, GripVertical, LayoutGrid, X, ShieldAlert, History } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors, radius, shadows } from '@/components/app/design/tokens';

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
                className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-[14px] group"
                style={{
                  background: snapshot.isDragging ? colors.bg.overlay : active ? colors.accent.muted : 'transparent',
                  color: active ? colors.text.primary : colors.text.muted,
                  fontWeight: active ? 600 : 400,
                  transition: 'background 150ms cubic-bezier(0.4,0,0.2,1), color 150ms cubic-bezier(0.4,0,0.2,1)',
                }}>
                {isOwner && <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-30 flex-shrink-0" />}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? colors.accent.hover : colors.text.disabled, transition: 'color 150ms cubic-bezier(0.4,0,0.2,1)' }} />
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
            <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
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
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1 px-0.5 pt-4 pb-1 group">
              <ChevronDown className="w-3 h-3" style={{ color: colors.text.disabled, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms cubic-bezier(0.4,0,0.2,1)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] flex-1 text-left truncate" style={{ color: colors.text.muted }}>{category.name}</span>
              {isOwner && <Plus onClick={e => { e.stopPropagation(); onAdd(category.id); }} className="w-[14px] h-[14px] opacity-0 group-hover:opacity-60 hover:opacity-100 cursor-pointer transition-opacity" style={{ color: colors.text.muted }} />}
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

export default function DraggableChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onSettings, onInvite, onModPanel, onAnalytics, onBackups, onChannelSettings, isOwner }) {
  const sorted = [...(categories || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Reset dropdown when server changes
  const prevServerId = useRef(server?.id);
  useEffect(() => {
    if (server?.id !== prevServerId.current) {
      setDropdownOpen(false);
      prevServerId.current = server?.id;
    }
  }, [server?.id]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    const handleKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [dropdownOpen]);

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination || !isOwner) return;
    const { source, destination, draggableId, type } = result;

    // Skip if dropped in the same spot
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

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
    const srcCatId = source.droppableId.replace('cat-', '');
    const dstCatId = destination.droppableId.replace('cat-', '');
    const chId = draggableId;

    // Build the destination channel list in new order
    const dstChannels = (channels || [])
      .filter(ch => {
        const catId = ch.category_id || 'uncategorized';
        return catId === dstCatId;
      })
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // If moving within the same category, remove from current position first
    if (srcCatId === dstCatId) {
      const oldIdx = dstChannels.findIndex(ch => ch.id === chId);
      if (oldIdx !== -1) dstChannels.splice(oldIdx, 1);
    } else {
      // Remove from source list — update source positions
      const srcChannels = (channels || [])
        .filter(ch => {
          const catId = ch.category_id || 'uncategorized';
          return catId === srcCatId && ch.id !== chId;
        })
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      const srcUpdates = srcChannels.map((ch, i) =>
        base44.entities.Channel.update(ch.id, { position: i })
      );
      await Promise.all(srcUpdates);
    }

    // Insert at destination index
    const movedChannel = (channels || []).find(ch => ch.id === chId);
    if (movedChannel) {
      dstChannels.splice(destination.index, 0, movedChannel);
    }

    // Update all positions in destination + category assignment for moved channel
    const dstUpdates = dstChannels.map((ch, i) => {
      const data = { position: i };
      if (ch.id === chId) {
        data.category_id = dstCatId === 'uncategorized' ? '' : dstCatId;
      }
      return base44.entities.Channel.update(ch.id, data);
    });
    await Promise.all(dstUpdates);
  }, [isOwner, sorted, channels]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header with click dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-12 px-4 w-full flex items-center justify-between flex-shrink-0"
          style={{
            borderBottom: `1px solid ${colors.border.default}`,
            background: dropdownOpen ? colors.bg.elevated : 'transparent',
            transition: 'background 150ms cubic-bezier(0.4,0,0.2,1)',
          }}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {server?.icon_url && <img src={server.icon_url} className="w-5 h-5 rounded-md object-cover flex-shrink-0" alt="" />}
            <span className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }} title={server?.name}>{server?.name}</span>
          </div>
          {dropdownOpen
            ? <X className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.muted }} />
            : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.muted }} />}
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 right-0 z-50 p-1.5 k-fade-in"
            style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, borderRadius: '0 0 12px 12px', boxShadow: shadows.strong }}>
            <button onClick={() => { onInvite(); setDropdownOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              style={{ color: colors.accent.primary }}>
              <UserPlus className="w-4 h-4 opacity-70" /> Invite People
            </button>
            {isOwner && <>
              <div className="my-1 h-px" style={{ background: colors.border.light }} />
              <button onClick={() => { onSettings(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: colors.text.secondary }}>
                <Settings className="w-4 h-4 opacity-50" /> Server Settings
              </button>
              <button onClick={() => { onAnalytics(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: colors.text.secondary }}>
                <BarChart3 className="w-4 h-4 opacity-50" /> Analytics
              </button>
              <button onClick={() => { onModPanel(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: colors.text.secondary }}>
                <Shield className="w-4 h-4 opacity-50" /> Mod Panel
              </button>
              <button onClick={() => { onBackups?.(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: colors.text.secondary }}>
                <History className="w-4 h-4 opacity-50" /> Backups
              </button>
              <div className="my-1 h-px" style={{ background: colors.border.light }} />
              <button onClick={() => { onAdd(sorted[0]?.id); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: colors.text.secondary }}>
                <Plus className="w-4 h-4 opacity-50" /> Create Channel
              </button>
            </>}
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2">
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
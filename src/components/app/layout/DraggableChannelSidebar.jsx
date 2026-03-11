import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, Lock, ChevronDown, ChevronRight, Plus, Settings, UserPlus, Shield, BarChart3, GripVertical } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors, radius, shadows } from '@/components/app/design/tokens';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare };

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
                  background: snapshot.isDragging ? colors.bg.overlay : active ? colors.accent.subtle : 'transparent',
                  color: active ? colors.text.primary : colors.text.muted,
                  fontWeight: active ? 500 : 400,
                  transition: 'background 0.15s, color 0.15s',
                }}>
                {isOwner && <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-30 flex-shrink-0" />}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? colors.accent.primary : colors.text.disabled, transition: 'color 0.15s' }} />
                <span className="truncate flex-1 text-left">{channel.name}</span>
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
              {open ? <ChevronDown className="w-3 h-3" style={{ color: colors.text.disabled }} /> : <ChevronRight className="w-3 h-3" style={{ color: colors.text.disabled }} />}
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] flex-1 text-left truncate" style={{ color: colors.text.muted }}>{category.name}</span>
              {isOwner && <Plus onClick={e => { e.stopPropagation(); onAdd(category.id); }} className="w-[14px] h-[14px] opacity-0 group-hover:opacity-60 hover:opacity-100 cursor-pointer transition-opacity" style={{ color: colors.text.muted }} />}
            </button>
          </div>
          {open && (
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
          )}
        </div>
      )}
    </Draggable>
  );
}

export default function DraggableChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onSettings, onInvite, onModPanel, onAnalytics, onChannelSettings, isOwner }) {
  const sorted = [...(categories || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination || !isOwner) return;
    const { destination } = result;
    const dstCat = destination.droppableId.replace('cat-', '');
    const chId = result.draggableId;
    await base44.entities.Channel.update(chId, {
      category_id: dstCat === 'uncategorized' ? '' : dstCat,
      position: destination.index,
    });
  }, [isOwner]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header */}
      <ContextMenu>
        <ContextMenuTrigger>
          <button className="h-12 px-4 w-full flex items-center justify-between flex-shrink-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            style={{ borderBottom: `1px solid ${colors.border.default}`, background: colors.bg.surface }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {server?.icon_url && <img src={server.icon_url} className="w-5 h-5 rounded-md object-cover flex-shrink-0" alt="" />}
              <span className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }} title={server?.name}>{server?.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.muted }} />
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
          <ContextMenuItem onClick={onInvite} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.accent.primary }}>
            <UserPlus className="w-4 h-4 opacity-70" /> Invite People
          </ContextMenuItem>
          {isOwner && <>
            <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
            <ContextMenuItem onClick={onSettings} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <Settings className="w-4 h-4 opacity-50" /> Server Settings
            </ContextMenuItem>
            <ContextMenuItem onClick={onAnalytics} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <BarChart3 className="w-4 h-4 opacity-50" /> Analytics
            </ContextMenuItem>
            <ContextMenuItem onClick={onModPanel} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <Shield className="w-4 h-4 opacity-50" /> Mod Panel
            </ContextMenuItem>
            <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onAdd(sorted[0]?.id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <Plus className="w-4 h-4 opacity-50" /> Create Channel
            </ContextMenuItem>
          </>}
        </ContextMenuContent>
      </ContextMenu>

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
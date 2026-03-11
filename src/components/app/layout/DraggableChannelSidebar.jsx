import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Lock, ListChecks, BookOpen, Ticket, Calendar, Bell, ChevronDown, ChevronRight, Plus, Settings, UserPlus, Shield, Crown, BarChart3, GripVertical } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, rules: BookOpen, tickets: Ticket, events: Calendar, polls: ListChecks, faq: HelpCircle, alerts: Bell, private: Lock };

function ChannelItem({ channel, active, onClick, onSettings, onEdit, isOwner, index }) {
  const Icon = typeIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';

  const inner = (
    <div className="flex items-center gap-2">
      {isOwner && <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0 cursor-grab" style={{ color: 'var(--text-muted)' }} />}
      <Icon className="w-4 h-4 flex-shrink-0 opacity-50" />
      <span className="truncate flex-1 text-left">{channel.name}</span>
      {channel.is_nsfw && <span className="text-[7px] px-1 rounded" style={{ background: 'rgba(201,123,123,0.15)', color: 'var(--accent-red)' }}>18+</span>}
      {channel.is_private && <Lock className="w-2.5 h-2.5 opacity-30" />}
      {channel.slow_mode_seconds > 0 && <span className="text-[7px] px-1 rounded" style={{ background: 'rgba(201,180,123,0.12)', color: 'var(--accent-amber)' }}>SLOW</span>}
      {isOwner && (
        <button onClick={e => { e.stopPropagation(); onSettings?.(channel); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-glass-hover)]">
          <Settings className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
        </button>
      )}
    </div>
  );

  return (
    <Draggable draggableId={channel.id} index={index} isDragDisabled={!isOwner}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <ContextMenu>
            <ContextMenuTrigger>
              <button onClick={() => onClick(channel)}
                className="w-full px-2 py-1.5 rounded-lg text-[13px] transition-all duration-150 group"
                style={{
                  background: snapshot.isDragging ? 'var(--bg-glass-strong)' : active ? 'var(--bg-glass-active)' : 'transparent',
                  color: active ? 'var(--text-cream)' : 'var(--text-secondary)',
                  boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : 'none',
                }}>
                {inner}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
              <ContextMenuItem onClick={() => onEdit?.(channel)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Hash className="w-3.5 h-3.5 opacity-50" /> Mark as Read
              </ContextMenuItem>
              <ContextMenuItem onClick={() => navigator.clipboard.writeText(channel.id)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Hash className="w-3.5 h-3.5 opacity-50" /> Copy Channel ID
              </ContextMenuItem>
              {isOwner && <>
                <ContextMenuSeparator style={{ background: 'var(--border)' }} />
                <ContextMenuItem onClick={() => onSettings?.(channel)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Settings className="w-3.5 h-3.5 opacity-50" /> Edit Channel
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
          <ContextMenu>
            <ContextMenuTrigger>
              <div {...provided.dragHandleProps}>
                <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1 px-1 py-1 group">
                  {open ? <ChevronDown className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] flex-1 text-left truncate" style={{ color: 'var(--text-muted)' }}>{category.name}</span>
                  {isOwner && <Plus onClick={e => { e.stopPropagation(); onAdd(category.id); }} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
              {isOwner && (
                <ContextMenuItem onClick={() => onAdd(category.id)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Plus className="w-3.5 h-3.5 opacity-50" /> Create Channel
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => navigator.clipboard.writeText(category.id)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Hash className="w-3.5 h-3.5 opacity-50" /> Copy Category ID
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          {open && (
            <Droppable droppableId={`cat-${category.id}`} type="channel">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="ml-1 space-y-px min-h-[2px]">
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
    const { source, destination, type } = result;
    if (type === 'channel') {
      const srcCat = source.droppableId.replace('cat-', '');
      const dstCat = destination.droppableId.replace('cat-', '');
      const chId = result.draggableId;
      await base44.entities.Channel.update(chId, {
        category_id: dstCat === 'uncategorized' ? '' : dstCat,
        position: destination.index,
      });
    }
  }, [isOwner]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {server?.icon_url && <img src={server.icon_url} className="w-5 h-5 rounded-md object-cover flex-shrink-0" />}
              <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{server?.name}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {isOwner && (
                <>
                  <button onClick={onAnalytics} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]" title="Analytics">
                    <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                  </button>
                  <button onClick={onModPanel} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]" title="Mod Panel">
                    <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
                  </button>
                  <button onClick={onInvite} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
                    <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={onSettings} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
                    <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
          <ContextMenuItem onClick={onInvite} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
            <UserPlus className="w-3.5 h-3.5 opacity-50" /> Invite People
          </ContextMenuItem>
          {isOwner && <>
            <ContextMenuItem onClick={onSettings} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Settings className="w-3.5 h-3.5 opacity-50" /> Server Settings
            </ContextMenuItem>
            <ContextMenuItem onClick={onAnalytics} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              <BarChart3 className="w-3.5 h-3.5 opacity-50" /> Analytics
            </ContextMenuItem>
            <ContextMenuSeparator style={{ background: 'var(--border)' }} />
            <ContextMenuItem onClick={() => onAdd(sorted[0]?.id)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Plus className="w-3.5 h-3.5 opacity-50" /> Create Channel
            </ContextMenuItem>
          </>}
        </ContextMenuContent>
      </ContextMenu>

      {server?.features?.includes('boost_progress') && (
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(164,123,201,0.04)', borderBottom: '1px solid var(--border)' }}>
          <Crown className="w-3 h-3" style={{ color: 'var(--accent-purple)' }} />
          <span className="text-[10px]" style={{ color: 'var(--accent-purple)' }}>Level 1 · 2 Boosts</span>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-0.5">
              {uncategorized.length > 0 && (
                <Droppable droppableId="cat-uncategorized" type="channel">
                  {(dropP) => (
                    <div ref={dropP.innerRef} {...dropP.droppableProps} className="space-y-px mb-1">
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
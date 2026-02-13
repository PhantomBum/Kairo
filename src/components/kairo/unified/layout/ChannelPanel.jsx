import React, { useState } from 'react';
import { Hash, Volume2, ChevronDown, Megaphone, MessagesSquare, Settings, Plus, Shield, UserPlus, Sparkles, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const iconMap = { text: Hash, voice: Volume2, announcement: Megaphone, forum: MessagesSquare, stage: Volume2 };

function ChannelItem({ ch, index, activeChannelId, onChannelClick }) {
  const Icon = iconMap[ch.type] || Hash;
  const active = ch.id === activeChannelId;
  return (
    <Draggable draggableId={`ch-${ch.id}`} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}
          style={{ ...provided.draggableProps.style }}>
          <button onClick={() => onChannelClick(ch)}
            className="w-full flex items-center gap-1.5 px-2 py-[7px] rounded-md text-[13px] transition-all duration-100 group/ch"
            style={{
              background: snapshot.isDragging ? 'rgba(99,102,241,0.15)' : active ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: active ? '#fff' : '#888',
              marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)',
              boxShadow: snapshot.isDragging ? '0 4px 16px rgba(0,0,0,0.4)' : 'none',
              border: snapshot.isDragging ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            }}>
            <div {...provided.dragHandleProps} className="opacity-0 group-hover/ch:opacity-40 hover:!opacity-100 flex-shrink-0 cursor-grab active:cursor-grabbing -ml-0.5">
              <GripVertical className="w-3 h-3" />
            </div>
            <Icon className="w-[18px] h-[18px] flex-shrink-0 opacity-60" />
            <span className="truncate flex-1 text-left">{ch.name}</span>
            {ch.is_nsfw && <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-1 py-0.5 rounded">18+</span>}
            {ch.type === 'voice' && <span className="text-[9px] text-zinc-600 opacity-0 group-hover/ch:opacity-100 transition-opacity">0</span>}
          </button>
        </div>
      )}
    </Draggable>
  );
}

function CategoryGroup({ category, channels, activeChannelId, onChannelClick, onCreateChannel, catIndex }) {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={`cat-${category.id}`} index={catIndex}>
      {(catProvided, catSnapshot) => (
        <div ref={catProvided.innerRef} {...catProvided.draggableProps}
          className="mb-0.5"
          style={{
            ...catProvided.draggableProps.style,
            background: catSnapshot.isDragging ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderRadius: 8,
            border: catSnapshot.isDragging ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          }}>
          <div className="flex items-center group px-0.5">
            <div {...catProvided.dragHandleProps} className="opacity-0 group-hover:opacity-30 hover:!opacity-100 cursor-grab active:cursor-grabbing px-0.5">
              <GripVertical className="w-3 h-3 text-zinc-500" />
            </div>
            <button onClick={() => setOpen(!open)}
              className="flex-1 flex items-center gap-0.5 px-1 py-[6px] text-[11px] font-semibold uppercase tracking-[0.05em] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? '' : '-rotate-90'}`} />
              {category.name}
            </button>
            {onCreateChannel && (
              <button onClick={() => onCreateChannel(category.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all">
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          {open && (
            <Droppable droppableId={`channels-${category.id}`} type="CHANNEL">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="min-h-[4px] transition-colors rounded"
                  style={{ background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                  {channels.map((ch, i) => (
                    <ChannelItem key={ch.id} ch={ch} index={i} activeChannelId={activeChannelId} onChannelClick={onChannelClick} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}

function HeaderBtn({ label, onClick, children }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all">
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs border-0 px-2 py-1" style={{ background: '#111', color: '#fff' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChannelPanel({ server, categories, channels, activeChannelId, onChannelClick, onCreateChannel, onServerSettings, onModeration, onInvite, isOwner, onReorderChannels, onReorderCategories }) {
  const grouped = {};
  const uncategorized = [];
  channels.forEach(ch => {
    if (ch.category_id) { if (!grouped[ch.category_id]) grouped[ch.category_id] = []; grouped[ch.category_id].push(ch); }
    else uncategorized.push(ch);
  });

  const sortedCats = [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
  Object.keys(grouped).forEach(catId => {
    grouped[catId].sort((a, b) => (a.position || 0) - (b.position || 0));
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'CATEGORY') {
      onReorderCategories?.(source.index, destination.index);
    } else if (type === 'CHANNEL') {
      onReorderChannels?.(result.draggableId.replace('ch-', ''), source.droppableId, source.index, destination.droppableId, destination.index);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-12 px-3 flex items-center justify-between flex-shrink-0 group/header cursor-pointer hover:bg-white/[0.02] transition-colors"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {server?.icon_url && <img src={server.icon_url} className="w-5 h-5 rounded-md object-cover" />}
          <span className="text-[14px] font-semibold text-white truncate">{server?.name}</span>
          {server?.features?.includes('verified') && <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-0.5">
          {isOwner && (
            <>
              <HeaderBtn label="Moderation" onClick={onModeration}><Shield className="w-3.5 h-3.5" /></HeaderBtn>
              <HeaderBtn label="Settings" onClick={onServerSettings}><Settings className="w-3.5 h-3.5" /></HeaderBtn>
            </>
          )}
          <HeaderBtn label="Invite People" onClick={onInvite}><UserPlus className="w-3.5 h-3.5" /></HeaderBtn>
        </div>
      </div>

      {server?.features?.includes('boost') && (
        <div className="mx-2 mt-2 px-3 py-2 rounded-lg text-[11px] text-purple-300 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <Sparkles className="w-3 h-3" /> Level 1 Boost
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-2 pb-1 scrollbar-thin">
        {uncategorized.length > 0 && (
          <div className="space-y-[1px] mb-1">
            {uncategorized.map(ch => {
              const Icon = iconMap[ch.type] || Hash;
              const active = ch.id === activeChannelId;
              return (
                <button key={ch.id} onClick={() => onChannelClick(ch)}
                  className="w-full flex items-center gap-1.5 px-2 py-[7px] rounded-md text-[13px] transition-all duration-100"
                  style={{
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: active ? '#fff' : '#888',
                    marginLeft: 4, marginRight: 4, width: 'calc(100% - 8px)',
                  }}>
                  <Icon className="w-[18px] h-[18px] flex-shrink-0 opacity-60" /><span className="truncate">{ch.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories-list" type="CATEGORY">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {sortedCats.map((cat, catIdx) => (
                  <CategoryGroup
                    key={cat.id}
                    category={cat}
                    catIndex={catIdx}
                    channels={grouped[cat.id] || []}
                    activeChannelId={activeChannelId}
                    onChannelClick={onChannelClick}
                    onCreateChannel={onCreateChannel}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
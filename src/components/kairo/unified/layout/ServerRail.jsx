import React from 'react';
import { Home, Plus, Compass } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Pill({ active, hover }) {
  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-200"
      style={{
        width: active ? 4 : 3,
        height: active ? 36 : hover ? 20 : 0,
        opacity: active || hover ? 1 : 0,
        background: active ? '#fff' : 'rgba(255,255,255,0.6)',
      }} />
  );
}

function RailIcon({ label, active, onClick, children, badge, color, isDragging }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center py-[2px]"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Pill active={active} hover={hovered} />
            <button onClick={onClick}
              className="relative w-[48px] h-[48px] flex items-center justify-center transition-all duration-200 overflow-hidden"
              style={{
                borderRadius: active || hovered || isDragging ? 16 : 24,
                background: active ? (color || '#fff') : hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                color: active ? (color ? '#fff' : '#000') : hovered ? '#fff' : '#666',
                boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.6)' : active ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                transform: isDragging ? 'scale(1.08)' : 'scale(1)',
              }}>
              {children}
              {badge > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#ef4444', border: '2px solid #0a0a0a' }}>
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs border-0 px-3 py-1.5 font-medium shadow-xl"
          style={{ background: '#111', color: '#fff' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ServerRail({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, isHome, pendingRequests, onReorderServers }) {

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    onReorderServers?.(from, to);
  };

  return (
    <div className="w-[72px] h-full flex flex-col items-center py-3 gap-0.5 flex-shrink-0 overflow-y-auto scrollbar-none"
      style={{ background: '#0a0a0a' }}>
      
      <RailIcon label="Home" active={isHome} onClick={onHomeClick} badge={pendingRequests}>
        <Home className="w-[22px] h-[22px]" />
      </RailIcon>

      <div className="w-8 h-[2px] rounded-full my-1.5" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="server-rail" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col items-center gap-0.5">
              {servers.map((server, index) => (
                <Draggable key={server.id} draggableId={server.id} index={index}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style }}>
                      <RailIcon
                        label={server.name}
                        active={activeServerId === server.id}
                        onClick={() => onServerSelect(server)}
                        isDragging={snapshot.isDragging}>
                        {server.icon_url ? (
                          <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[15px] font-bold" style={{ color: activeServerId === server.id ? '#000' : '#999' }}>
                            {server.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </RailIcon>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="w-8 h-[2px] rounded-full my-1.5" style={{ background: 'rgba(255,255,255,0.06)' }} />

      <RailIcon label="Add a Server" onClick={onCreateServer} color="#22c55e">
        <Plus className="w-5 h-5" />
      </RailIcon>
      <RailIcon label="Explore Servers" onClick={onDiscover} color="#6366f1">
        <Compass className="w-5 h-5" />
      </RailIcon>
    </div>
  );
}
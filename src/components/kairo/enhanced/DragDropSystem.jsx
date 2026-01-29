import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DraggableChannel({ channel, index, onClick, isActive }) {
  return (
    <Draggable draggableId={channel.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group relative",
            snapshot.isDragging && "opacity-50"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer",
              isActive ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
            onClick={onClick}
          >
            <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="flex-1 text-sm truncate">{channel.name}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function DroppableChannelList({ channels, onReorder, activeChannelId, onChannelClick }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder?.(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="channels">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {channels.map((channel, index) => (
              <DraggableChannel
                key={channel.id}
                channel={channel}
                index={index}
                isActive={channel.id === activeChannelId}
                onClick={() => onChannelClick(channel)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { BADGE_CONFIG, RARITY, getOrderedBadges } from './badgeConfig';
import { colors } from '@/components/app/design/tokens';

export default function BadgeOrderSettings({ badges = [], badgeOrder = [], onSave }) {
  const [order, setOrder] = useState(() => getOrderedBadges(badges, badgeOrder));

  useEffect(() => {
    setOrder(getOrderedBadges(badges, badgeOrder));
  }, [badges, badgeOrder]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(order);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrder(items);
    onSave(items);
  };

  if (!badges.length) {
    return (
      <div className="text-center py-6">
        <p className="text-[13px]" style={{ color: colors.text.muted }}>No badges earned yet</p>
        <p className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>Badges are earned by using Kairo — keep chatting!</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>
        Badge Display Order
      </p>
      <p className="text-[11px] mb-3" style={{ color: colors.text.disabled }}>
        Drag to reorder. First 6 badges show on hover cards.
      </p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="badges">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {order.map((badge, index) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                const Icon = cfg.icon;
                const rarity = RARITY[cfg.rarity];
                return (
                  <Draggable key={badge} draggableId={badge} index={index}>
                    {(prov, snap) => (
                      <div ref={prov.innerRef} {...prov.draggableProps}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          ...prov.draggableProps.style,
                          background: snap.isDragging ? 'rgba(255,255,255,0.06)' : colors.bg.base,
                          border: `1px solid ${snap.isDragging ? colors.border.strong : colors.border.default}`,
                        }}>
                        <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                        </div>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>{cfg.label}</p>
                          <p className="text-[10px]" style={{ color: colors.text.muted }}>{cfg.desc}</p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${rarity.color}18`, color: rarity.color }}>
                          {rarity.label}
                        </span>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
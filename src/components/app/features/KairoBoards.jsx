import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X, GripVertical, Calendar, Tag, User, CheckSquare, Square } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { colors, shadows } from '@/components/app/design/tokens';

const LABEL_COLORS = ['#f87171', '#fbbf24', '#34d399', '#2dd4bf', '#eb459e', '#7c5cbf', '#60a5fa'];

function CardModal({ card, onClose, onUpdate, onDelete, members }) {
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description || '');
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newCheck, setNewCheck] = useState('');

  const save = () => { onUpdate(card.id, { title, description: desc, checklist }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-[480px] rounded-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} className="text-[18px] font-bold bg-transparent outline-none flex-1" style={{ color: colors.text.primary }} />
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: colors.text.muted }} /></button>
        </div>
        {card.labels?.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {card.labels.map((l, i) => <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium text-white" style={{ background: l.color }}>{l.name}</span>)}
          </div>
        )}
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add a description..." rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-none mb-4" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        {/* Checklist */}
        <div className="mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Checklist</p>
          <div className="space-y-1">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => setChecklist(p => p.map((c, j) => j === i ? { ...c, done: !c.done } : c))}>
                  {item.done ? <CheckSquare className="w-4 h-4" style={{ color: colors.success }} /> : <Square className="w-4 h-4" style={{ color: colors.text.muted }} />}
                </button>
                <span className="text-[13px] flex-1" style={{ color: item.done ? colors.text.disabled : colors.text.primary, textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                <button onClick={() => setChecklist(p => p.filter((_, j) => j !== i))}><X className="w-3 h-3" style={{ color: colors.text.disabled }} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newCheck} onChange={e => setNewCheck(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCheck.trim()) { setChecklist(p => [...p, { text: newCheck.trim(), done: false }]); setNewCheck(''); } }}
              placeholder="Add item..." className="flex-1 px-2 py-1.5 rounded text-[13px] bg-transparent outline-none" style={{ color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          <button onClick={() => { onDelete(card.id); onClose(); }} className="px-3 py-2 rounded-lg text-[13px]" style={{ color: colors.danger }}>Delete Card</button>
          <button onClick={save} className="px-5 py-2 rounded-lg text-[14px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function KairoBoards({ channel, serverId }) {
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [editCard, setEditCard] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [addingCard, setAddingCard] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    let boards = await base44.entities.Board.filter({ channel_id: channel.id });
    let b = boards[0];
    if (!b) {
      b = await base44.entities.Board.create({
        channel_id: channel.id, server_id: serverId,
        columns: [
          { id: 'todo', name: 'To Do', color: '#2dd4bf', position: 0 },
          { id: 'progress', name: 'In Progress', color: '#f0b232', position: 1 },
          { id: 'done', name: 'Done', color: '#23a55a', position: 2 },
        ]
      });
    }
    setBoard(b);
    const c = await base44.entities.BoardCard.filter({ board_id: b.id });
    setCards(c); setLoading(false);
  };

  useEffect(() => { load(); }, [channel.id]);

  const addColumn = async () => {
    if (!newColName.trim() || !board) return;
    const cols = [...(board.columns || []), { id: Date.now().toString(), name: newColName.trim(), color: LABEL_COLORS[board.columns.length % LABEL_COLORS.length], position: board.columns.length }];
    await base44.entities.Board.update(board.id, { columns: cols });
    setBoard({ ...board, columns: cols }); setNewColName(''); setAddingCol(false);
  };

  const addCard = async (colId) => {
    if (!newCardTitle.trim() || !board) return;
    await base44.entities.BoardCard.create({ board_id: board.id, column_id: colId, title: newCardTitle.trim(), position: cards.filter(c => c.column_id === colId).length });
    setNewCardTitle(''); setAddingCard(null); load();
  };

  const updateCard = async (id, data) => { await base44.entities.BoardCard.update(id, data); load(); };
  const deleteCard = async (id) => { await base44.entities.BoardCard.delete(id); load(); };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const cardId = result.draggableId;
    const newColId = result.destination.droppableId;
    const newPos = result.destination.index;
    // Optimistic update — preserve ALL card data, only change column_id and position
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column_id: newColId, position: newPos } : c));
    // Only update the fields that changed to preserve assignees, labels, etc.
    await base44.entities.BoardCard.update(cardId, { column_id: newColId, position: newPos });
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-3 p-4 overflow-x-auto scrollbar-none">
          {(board?.columns || []).map(col => {
            const colCards = cards.filter(c => c.column_id === col.id).sort((a, b) => (a.position || 0) - (b.position || 0));
            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="w-[280px] flex-shrink-0 flex flex-col rounded-xl p-3" style={{ background: colors.bg.surface }}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-3 h-3 rounded-full" style={{ background: col.color }} />
                      <span className="text-[13px] font-semibold flex-1" style={{ color: colors.text.primary }}>{col.name}</span>
                      <span className="text-[11px]" style={{ color: colors.text.disabled }}>{colCards.length}</span>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none min-h-[100px]">
                      {colCards.map((card, i) => (
                        <Draggable key={card.id} draggableId={card.id} index={i}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                              onClick={() => setEditCard(card)}
                              className="p-3 rounded-lg cursor-pointer transition-colors hover:brightness-110"
                              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                              {card.labels?.length > 0 && (
                                <div className="flex gap-1 mb-1.5">{card.labels.map((l, j) => <span key={j} className="w-8 h-1.5 rounded-full" style={{ background: l.color }} />)}</div>
                              )}
                              <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{card.title}</p>
                              {(card.due_date || card.checklist?.length > 0) && (
                                <div className="flex items-center gap-2 mt-2">
                                  {card.due_date && <span className="flex items-center gap-1 text-[11px]" style={{ color: colors.text.muted }}><Calendar className="w-3 h-3" />{new Date(card.due_date).toLocaleDateString()}</span>}
                                  {card.checklist?.length > 0 && <span className="flex items-center gap-1 text-[11px]" style={{ color: colors.text.muted }}><CheckSquare className="w-3 h-3" />{card.checklist.filter(c=>c.done).length}/{card.checklist.length}</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                    {addingCard === col.id ? (
                      <div className="mt-2">
                        <input value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addCard(col.id); if (e.key === 'Escape') setAddingCard(null); }}
                          placeholder="Card title..." autoFocus className="w-full px-2.5 py-2 rounded-lg text-[13px] outline-none mb-1"
                          style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
                        <div className="flex gap-1"><button onClick={() => addCard(col.id)} className="px-3 py-1.5 rounded text-[12px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>Add</button>
                        <button onClick={() => setAddingCard(null)}><X className="w-4 h-4" style={{ color: colors.text.muted }} /></button></div>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingCard(col.id); setNewCardTitle(''); }} className="flex items-center gap-1.5 w-full px-2 py-2 mt-2 rounded-lg text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                        style={{ color: colors.text.muted }}><Plus className="w-3.5 h-3.5" /> Add card</button>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
          {/* Add column */}
          {addingCol ? (
            <div className="w-[280px] flex-shrink-0 p-3 rounded-xl" style={{ background: colors.bg.surface }}>
              <input value={newColName} onChange={e => setNewColName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addColumn(); if (e.key === 'Escape') setAddingCol(false); }}
                placeholder="Column name..." autoFocus className="w-full px-2.5 py-2 rounded-lg text-[13px] outline-none mb-2"
                style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
              <div className="flex gap-1">
                <button onClick={addColumn} className="px-3 py-1.5 rounded text-[12px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>Add</button>
                <button onClick={() => setAddingCol(false)}><X className="w-4 h-4" style={{ color: colors.text.muted }} /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCol(true)} className="w-[280px] flex-shrink-0 flex items-center justify-center gap-2 py-4 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ background: colors.bg.surface, color: colors.text.muted, border: `2px dashed ${colors.border.default}` }}>
              <Plus className="w-4 h-4" /> Add Column
            </button>
          )}
        </div>
      </DragDropContext>
      {editCard && <CardModal card={editCard} onClose={() => setEditCard(null)} onUpdate={updateCard} onDelete={deleteCard} members={[]} />}
    </div>
  );
}
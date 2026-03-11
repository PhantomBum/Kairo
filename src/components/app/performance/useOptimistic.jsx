import { useState, useCallback, useRef } from 'react';

// Rate limiter: max N actions per T ms
function useRateLimit(maxActions, windowMs) {
  const actions = useRef([]);
  return useCallback(() => {
    const now = Date.now();
    actions.current = actions.current.filter(t => now - t < windowMs);
    if (actions.current.length >= maxActions) return false;
    actions.current.push(now);
    return true;
  }, [maxActions, windowMs]);
}

export function useOptimisticMessages() {
  const [optimisticMsgs, setOptimisticMsgs] = useState([]);
  const [optimisticIds, setOptimisticIds] = useState(new Set());
  const checkRate = useRateLimit(5, 5000); // 5 msgs per 5 seconds

  const addOptimistic = useCallback((msg) => {
    if (!checkRate()) return { allowed: false };
    const tempId = `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const optimisticMsg = { ...msg, id: tempId, created_date: new Date().toISOString() };
    setOptimisticMsgs(prev => [...prev, optimisticMsg]);
    setOptimisticIds(prev => new Set([...prev, tempId]));
    // Auto-expire optimistic messages after 15s to prevent ghosts
    setTimeout(() => {
      setOptimisticMsgs(prev => prev.filter(m => m.id !== tempId));
      setOptimisticIds(prev => { const next = new Set(prev); next.delete(tempId); return next; });
    }, 15000);
    return { allowed: true, tempId };
  }, [checkRate]);

  const confirmOptimistic = useCallback((tempId) => {
    setOptimisticMsgs(prev => prev.filter(m => m.id !== tempId));
    setOptimisticIds(prev => { const next = new Set(prev); next.delete(tempId); return next; });
  }, []);

  const revertOptimistic = useCallback((tempId) => {
    setOptimisticMsgs(prev => prev.filter(m => m.id !== tempId));
    setOptimisticIds(prev => { const next = new Set(prev); next.delete(tempId); return next; });
  }, []);

  return { optimisticMsgs, optimisticIds, addOptimistic, confirmOptimistic, revertOptimistic };
}

export function useOptimisticReaction() {
  const [pendingReactions, setPendingReactions] = useState(new Map());

  const addOptimisticReaction = useCallback((msgId, emoji, userId, currentReactions) => {
    const reactions = [...(currentReactions || [])];
    const existing = reactions.find(r => r.emoji === emoji);
    let updated;
    if (existing) {
      const has = existing.users?.includes(userId);
      if (has) {
        updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== userId) } : r).filter(r => r.count > 0);
      } else {
        updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), userId] } : r);
      }
    } else {
      updated = [...reactions, { emoji, count: 1, users: [userId] }];
    }
    setPendingReactions(prev => new Map(prev).set(msgId, updated));
    return updated;
  }, []);

  const clearReaction = useCallback((msgId) => {
    setPendingReactions(prev => { const next = new Map(prev); next.delete(msgId); return next; });
  }, []);

  return { pendingReactions, addOptimisticReaction, clearReaction };
}
import { useRef, useCallback, useState } from 'react';

const SNAP_DURATION = 250;
const EDGE_ZONE = 28;
const VELOCITY_THRESHOLD = 0.3;
const DRAG_THRESHOLD = 15;

export function useSwipePanels() {
  const [panel, setPanel] = useState('center');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, time: 0 });
  const lockRef = useRef(null);
  const panelRef = useRef('center');
  panelRef.current = panel;

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    lockRef.current = null;
  }, []);

  const onTouchMove = useCallback((e) => {
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;

    if (lockRef.current === null) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      lockRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockRef.current !== 'x') return;

    const fromEdge = startRef.current.x < EDGE_ZONE || startRef.current.x > window.innerWidth - EDGE_ZONE;
    const cur = panelRef.current;

    if (cur === 'center' && dx > 0 && !fromEdge && startRef.current.x > EDGE_ZONE * 2) return;
    if (cur === 'center' && dx < 0 && !fromEdge && startRef.current.x < window.innerWidth - EDGE_ZONE * 2) return;

    setIsDragging(true);
    let offset = dx;
    if (cur === 'left') offset = dx + window.innerWidth * 0.82;
    if (cur === 'right') offset = dx - window.innerWidth * 0.82;

    const maxLeft = window.innerWidth * 0.82;
    const maxRight = -window.innerWidth * 0.82;
    offset = Math.max(maxRight, Math.min(maxLeft, offset));

    setDragOffset(offset);
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!isDragging) { lockRef.current = null; return; }
    const dx = e.changedTouches[0].clientX - startRef.current.x;
    const elapsed = Date.now() - startRef.current.time;
    const velocity = Math.abs(dx) / Math.max(1, elapsed);

    const vw = window.innerWidth * 0.82;
    let target = 'center';

    if (velocity > VELOCITY_THRESHOLD) {
      if (dx > 0) target = 'left';
      else target = 'right';
    } else {
      if (dragOffset > vw * 0.4) target = 'left';
      else if (dragOffset < -vw * 0.4) target = 'right';
    }

    setIsDragging(false);
    setDragOffset(0);
    setPanel(target);
    lockRef.current = null;
  }, [isDragging, dragOffset]);

  const openLeft = useCallback(() => setPanel('left'), []);
  const openRight = useCallback(() => setPanel('right'), []);
  const goCenter = useCallback(() => setPanel('center'), []);

  return {
    panel, dragOffset, isDragging,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    openLeft, openRight, goCenter, setPanel,
  };
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold = 60 }) {
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = true;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!swiping.current) return;
    swiping.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) onSwipeRight?.();
    else onSwipeLeft?.();
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}

import { useRef, useCallback } from 'react';

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
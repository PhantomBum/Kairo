import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// High-performance virtualized list for large message lists
export default function VirtualizedList({
  items,
  renderItem,
  itemHeight = 'auto', // Fixed height or 'auto'
  estimatedItemHeight = 80,
  overscan = 5,
  className,
  onScroll,
  autoScrollToBottom = true,
  stickyHeader,
  loadMore,
  hasMore = false,
  isLoading = false,
  emptyState
}) {
  const containerRef = useRef(null);
  const measureRef = useRef({});
  
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [itemHeights, setItemHeights] = useState({});

  // Calculate total height and visible range
  const { totalHeight, visibleItems, startIndex } = useMemo(() => {
    if (itemHeight !== 'auto') {
      // Fixed height mode - simple calculation
      const totalH = items.length * itemHeight;
      const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIdx = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
      
      return {
        totalHeight: totalH,
        visibleItems: items.slice(startIdx, endIdx).map((item, i) => ({
          item,
          index: startIdx + i,
          offset: (startIdx + i) * itemHeight
        })),
        startIndex: startIdx
      };
    }

    // Auto height mode - use measured or estimated heights
    let runningHeight = 0;
    const itemOffsets = [];
    
    items.forEach((item, i) => {
      const height = itemHeights[item.id] || estimatedItemHeight;
      itemOffsets.push({ offset: runningHeight, height });
      runningHeight += height;
    });

    // Find visible range
    let startIdx = 0;
    let endIdx = items.length;
    
    for (let i = 0; i < itemOffsets.length; i++) {
      if (itemOffsets[i].offset + itemOffsets[i].height >= scrollTop - overscan * estimatedItemHeight) {
        startIdx = i;
        break;
      }
    }
    
    for (let i = startIdx; i < itemOffsets.length; i++) {
      if (itemOffsets[i].offset > scrollTop + containerHeight + overscan * estimatedItemHeight) {
        endIdx = i;
        break;
      }
    }

    return {
      totalHeight: runningHeight,
      visibleItems: items.slice(startIdx, endIdx).map((item, i) => ({
        item,
        index: startIdx + i,
        offset: itemOffsets[startIdx + i].offset
      })),
      startIndex: startIdx
    };
  }, [items, itemHeight, itemHeights, scrollTop, containerHeight, overscan, estimatedItemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop: st, scrollHeight, clientHeight } = e.target;
    setScrollTop(st);
    
    const atBottom = scrollHeight - st - clientHeight < 50;
    setIsAtBottom(atBottom);
    
    // Load more when near top (for chat-style loading)
    if (st < 100 && hasMore && !isLoading && loadMore) {
      loadMore();
    }
    
    onScroll?.(e);
  }, [hasMore, isLoading, loadMore, onScroll]);

  // Measure container height
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScrollToBottom && isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items.length, autoScrollToBottom, isAtBottom]);

  // Measure item heights for auto-height mode
  const measureItem = useCallback((id, height) => {
    setItemHeights(prev => {
      if (prev[id] === height) return prev;
      return { ...prev, [id]: height };
    });
  }, []);

  // Scroll to bottom method
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  }, []);

  // Scroll to item method
  const scrollToItem = useCallback((index) => {
    if (!containerRef.current) return;
    
    let offset = 0;
    if (itemHeight !== 'auto') {
      offset = index * itemHeight;
    } else {
      for (let i = 0; i < index && i < items.length; i++) {
        offset += itemHeights[items[i].id] || estimatedItemHeight;
      }
    }
    
    containerRef.current.scrollTop = offset;
  }, [items, itemHeight, itemHeights, estimatedItemHeight]);

  if (items.length === 0 && emptyState) {
    return (
      <div ref={containerRef} className={cn("flex-1 overflow-y-auto", className)}>
        {emptyState}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 overflow-y-auto scrollbar-thin", className)}
      onScroll={handleScroll}
    >
      {/* Loading indicator at top */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Sticky header */}
      {stickyHeader}

      {/* Virtual container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offset }) => (
          <VirtualizedItem
            key={item.id}
            item={item}
            index={index}
            offset={offset}
            renderItem={renderItem}
            measureItem={itemHeight === 'auto' ? measureItem : null}
          />
        ))}
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 p-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Individual virtualized item with height measurement
function VirtualizedItem({ item, index, offset, renderItem, measureItem }) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (!ref.current || !measureItem) return;
    
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        measureItem(item.id, entry.contentRect.height);
      }
    });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [item.id, measureItem]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        transform: `translateY(${offset}px)`
      }}
    >
      {renderItem(item, index)}
    </div>
  );
}
import { useEffect, useCallback, useRef } from 'react';

const DRAFTS_KEY = 'kairo_message_drafts';
const SAVE_DELAY = 500; // ms

// Simple draft manager for auto-saving message drafts
export function useDraftManager(channelId, initialValue = '') {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(initialValue);

  // Load draft on mount
  const loadDraft = useCallback(() => {
    if (!channelId) return '';
    try {
      const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
      return drafts[channelId] || '';
    } catch {
      return '';
    }
  }, [channelId]);

  // Save draft
  const saveDraft = useCallback((content) => {
    if (!channelId) return;
    
    // Clear pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save
    timeoutRef.current = setTimeout(() => {
      try {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
        
        if (content.trim()) {
          drafts[channelId] = content;
        } else {
          delete drafts[channelId];
        }
        
        // Limit stored drafts to prevent localStorage bloat
        const keys = Object.keys(drafts);
        if (keys.length > 50) {
          const toRemove = keys.slice(0, keys.length - 50);
          toRemove.forEach(k => delete drafts[k]);
        }
        
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
        lastSavedRef.current = content;
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    }, SAVE_DELAY);
  }, [channelId]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (!channelId) return;
    try {
      const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
      delete drafts[channelId];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      lastSavedRef.current = '';
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  }, [channelId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    clearDraft
  };
}

// Get all drafts with channel info
export function getAllDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Check if channel has a draft
export function hasDraft(channelId) {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
    return !!drafts[channelId]?.trim();
  } catch {
    return false;
  }
}

// Clear all drafts
export function clearAllDrafts() {
  try {
    localStorage.removeItem(DRAFTS_KEY);
  } catch (e) {
    console.error('Failed to clear all drafts:', e);
  }
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

const DEFAULT_SETTINGS = {
  // Motion
  reducedMotion: false,
  
  // Visual
  highContrast: false,
  largeText: false,
  
  // Audio
  screenReaderMode: false,
  
  // Interaction
  focusIndicators: true,
  keyboardNavigation: true,
  
  // Content
  showAltText: false,
  
  // Reading
  dyslexiaFont: false,
  lineSpacing: 'normal', // normal, relaxed, loose
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('kairo_accessibility');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (settings.largeText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '';
    }
    
    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
    
    // Line spacing
    root.classList.remove('line-spacing-relaxed', 'line-spacing-loose');
    if (settings.lineSpacing === 'relaxed') {
      root.classList.add('line-spacing-relaxed');
    } else if (settings.lineSpacing === 'loose') {
      root.classList.add('line-spacing-loose');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('show-focus');
    } else {
      root.classList.remove('show-focus');
    }
    
    // Save to localStorage
    localStorage.setItem('kairo_accessibility', JSON.stringify(settings));
  }, [settings]);

  // Detect system preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleMotionChange = (e) => {
      if (e.matches && !settings.reducedMotion) {
        updateSetting('reducedMotion', true);
      }
    };
    
    const handleContrastChange = (e) => {
      if (e.matches && !settings.highContrast) {
        updateSetting('highContrast', true);
      }
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Initial check
    if (motionQuery.matches) updateSetting('reducedMotion', true);
    if (contrastQuery.matches) updateSetting('highContrast', true);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Announce to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      announce
    }}>
      {/* Accessibility CSS */}
      <style>{`
        /* Reduced motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        /* High contrast */
        .high-contrast {
          --border-opacity: 0.3;
          filter: contrast(1.2);
        }
        
        .high-contrast * {
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        
        /* Dyslexia friendly font */
        .dyslexia-font {
          font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
          letter-spacing: 0.05em;
          word-spacing: 0.1em;
        }
        
        /* Line spacing */
        .line-spacing-relaxed {
          line-height: 1.75 !important;
        }
        
        .line-spacing-loose {
          line-height: 2 !important;
        }
        
        /* Focus indicators */
        .show-focus *:focus-visible {
          outline: 2px solid #6366f1 !important;
          outline-offset: 2px !important;
        }
        
        /* Screen reader only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Skip link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #6366f1;
          color: white;
          padding: 8px 16px;
          z-index: 100;
          transition: top 0.2s;
        }
        
        .skip-link:focus {
          top: 0;
        }
      `}</style>
      
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Helper hook for keyboard navigation
export function useKeyboardNav(items, onSelect, options = {}) {
  const { loop = true, orientation = 'vertical' } = options;
  const [focusIndex, setFocusIndex] = useState(0);

  const handleKeyDown = useCallback((e) => {
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    
    switch (e.key) {
      case prevKey:
        e.preventDefault();
        setFocusIndex(i => {
          const newIndex = i - 1;
          if (newIndex < 0) return loop ? items.length - 1 : 0;
          return newIndex;
        });
        break;
      case nextKey:
        e.preventDefault();
        setFocusIndex(i => {
          const newIndex = i + 1;
          if (newIndex >= items.length) return loop ? 0 : items.length - 1;
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(items[focusIndex], focusIndex);
        break;
      case 'Home':
        e.preventDefault();
        setFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIndex(items.length - 1);
        break;
    }
  }, [items, focusIndex, loop, orientation, onSelect]);

  return {
    focusIndex,
    setFocusIndex,
    handleKeyDown,
    getItemProps: (index) => ({
      tabIndex: index === focusIndex ? 0 : -1,
      'aria-selected': index === focusIndex,
      onFocus: () => setFocusIndex(index)
    })
  };
}
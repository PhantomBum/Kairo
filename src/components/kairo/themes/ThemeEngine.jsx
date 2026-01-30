import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Moon, Sun, Sparkles, Zap, Flame, Leaf, Waves, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Built-in themes
export const THEMES = {
  midnight: {
    name: 'Midnight',
    icon: Moon,
    colors: {
      '--bg-primary': '#0a0a0b',
      '--bg-secondary': '#121214',
      '--bg-tertiary': '#18181b',
      '--accent': '#8B5CF6',
      '--accent-hover': '#7C3AED',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a1a1aa',
      '--text-muted': '#71717a',
      '--border': '#27272a',
    }
  },
  amoled: {
    name: 'AMOLED Dark',
    icon: Zap,
    colors: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#0a0a0a',
      '--bg-tertiary': '#111111',
      '--accent': '#8B5CF6',
      '--accent-hover': '#7C3AED',
      '--text-primary': '#ffffff',
      '--text-secondary': '#888888',
      '--text-muted': '#555555',
      '--border': '#222222',
    }
  },
  sunset: {
    name: 'Sunset',
    icon: Sun,
    colors: {
      '--bg-primary': '#1a1520',
      '--bg-secondary': '#251d2b',
      '--bg-tertiary': '#2f2538',
      '--accent': '#F97316',
      '--accent-hover': '#EA580C',
      '--text-primary': '#fff5eb',
      '--text-secondary': '#c9b8a8',
      '--text-muted': '#8a7a6a',
      '--border': '#3d3147',
    }
  },
  ocean: {
    name: 'Ocean',
    icon: Waves,
    colors: {
      '--bg-primary': '#0c1929',
      '--bg-secondary': '#0f2137',
      '--bg-tertiary': '#142846',
      '--accent': '#06B6D4',
      '--accent-hover': '#0891B2',
      '--text-primary': '#e0f2fe',
      '--text-secondary': '#7dd3fc',
      '--text-muted': '#38bdf8',
      '--border': '#1e3a5f',
    }
  },
  forest: {
    name: 'Forest',
    icon: Leaf,
    colors: {
      '--bg-primary': '#0d1a0d',
      '--bg-secondary': '#142114',
      '--bg-tertiary': '#1a2a1a',
      '--accent': '#22C55E',
      '--accent-hover': '#16A34A',
      '--text-primary': '#ecfdf5',
      '--text-secondary': '#86efac',
      '--text-muted': '#4ade80',
      '--border': '#1f3a1f',
    }
  },
  sakura: {
    name: 'Sakura',
    icon: Sparkles,
    colors: {
      '--bg-primary': '#1a1218',
      '--bg-secondary': '#241820',
      '--bg-tertiary': '#2e1e28',
      '--accent': '#EC4899',
      '--accent-hover': '#DB2777',
      '--text-primary': '#fdf2f8',
      '--text-secondary': '#f9a8d4',
      '--text-muted': '#f472b6',
      '--border': '#3d2838',
    }
  },
  golden: {
    name: 'Golden',
    icon: Star,
    colors: {
      '--bg-primary': '#18150d',
      '--bg-secondary': '#211c11',
      '--bg-tertiary': '#2a2315',
      '--accent': '#EAB308',
      '--accent-hover': '#CA8A04',
      '--text-primary': '#fefce8',
      '--text-secondary': '#fde047',
      '--text-muted': '#facc15',
      '--border': '#3d3520',
    }
  },
  crimson: {
    name: 'Crimson',
    icon: Flame,
    colors: {
      '--bg-primary': '#1a0d0d',
      '--bg-secondary': '#241414',
      '--bg-tertiary': '#2e1a1a',
      '--accent': '#EF4444',
      '--accent-hover': '#DC2626',
      '--text-primary': '#fef2f2',
      '--text-secondary': '#fca5a5',
      '--text-muted': '#f87171',
      '--border': '#3d2020',
    }
  },
};

const ThemeContext = createContext({
  theme: 'midnight',
  setTheme: () => {},
  colors: THEMES.midnight.colors,
});

export function ThemeProvider({ children, defaultTheme = 'midnight' }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kairo-theme') || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('kairo-theme', theme);
    
    // Apply CSS variables
    const colors = THEMES[theme]?.colors || THEMES.midnight.colors;
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme]?.colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Theme picker component
export function ThemePicker({ onSelect, currentTheme }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Object.entries(THEMES).map(([id, themeData]) => {
        const Icon = themeData.icon;
        const isActive = currentTheme === id;
        
        return (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(id)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              isActive
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
            )}
          >
            {/* Color preview */}
            <div className="flex gap-1 mb-3">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ background: themeData.colors['--bg-primary'] }}
              />
              <div 
                className="w-6 h-6 rounded-full"
                style={{ background: themeData.colors['--accent'] }}
              />
              <div 
                className="w-6 h-6 rounded-full"
                style={{ background: themeData.colors['--bg-secondary'] }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: themeData.colors['--accent'] }} />
              <span className="font-medium text-white">{themeData.name}</span>
            </div>

            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default ThemeProvider;
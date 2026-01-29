import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export const WORKSPACE_MODES = {
  MINIMAL: 'minimal',      // Hide sidebars, compact UI
  FOCUSED: 'focused',      // Dim non-essential elements
  EXPANDED: 'expanded',    // Normal view with all panels
  IMMERSIVE: 'immersive'   // Fullscreen chat/voice
};

export const PANEL_TYPES = {
  CHAT: 'chat',
  MEMBERS: 'members',
  VOICE: 'voice',
  SETTINGS: 'settings',
  THREADS: 'threads',
  SEARCH: 'search'
};

const defaultPanelConfig = {
  [PANEL_TYPES.MEMBERS]: { visible: true, pinned: false, docked: 'right', width: 240 },
  [PANEL_TYPES.THREADS]: { visible: false, pinned: false, docked: 'right', width: 320 },
  [PANEL_TYPES.SEARCH]: { visible: false, pinned: false, docked: 'overlay', width: 400 },
  [PANEL_TYPES.VOICE]: { visible: false, pinned: false, docked: 'bottom', height: 200 }
};

const defaultSettings = {
  mode: WORKSPACE_MODES.EXPANDED,
  sidebarCollapsed: false,
  channelSidebarCollapsed: false,
  animationIntensity: 1, // 0 = none, 0.5 = reduced, 1 = full
  compactMode: false,
  showTimestamps: true,
  use24HourTime: false,
  fontSize: 'medium', // small, medium, large
  messageGrouping: true,
  showAvatars: true
};

export function WorkspaceProvider({ children }) {
  const [mode, setMode] = useState(WORKSPACE_MODES.EXPANDED);
  const [panels, setPanels] = useState(defaultPanelConfig);
  const [settings, setSettings] = useState(defaultSettings);
  const [detachedPanels, setDetachedPanels] = useState([]); // Floating panels
  const [savedLayouts, setSavedLayouts] = useState([]);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kairo_workspace');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.mode) setMode(parsed.mode);
      if (parsed.panels) setPanels({ ...defaultPanelConfig, ...parsed.panels });
      if (parsed.settings) setSettings({ ...defaultSettings, ...parsed.settings });
      if (parsed.savedLayouts) setSavedLayouts(parsed.savedLayouts);
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(() => {
    localStorage.setItem('kairo_workspace', JSON.stringify({
      mode, panels, settings, savedLayouts
    }));
  }, [mode, panels, settings, savedLayouts]);

  useEffect(() => {
    saveSettings();
  }, [mode, panels, settings, savedLayouts, saveSettings]);

  // Panel management
  const togglePanel = useCallback((panelType) => {
    setPanels(prev => ({
      ...prev,
      [panelType]: { ...prev[panelType], visible: !prev[panelType]?.visible }
    }));
  }, []);

  const setPanelVisibility = useCallback((panelType, visible) => {
    setPanels(prev => ({
      ...prev,
      [panelType]: { ...prev[panelType], visible }
    }));
  }, []);

  const pinPanel = useCallback((panelType) => {
    setPanels(prev => ({
      ...prev,
      [panelType]: { ...prev[panelType], pinned: !prev[panelType]?.pinned }
    }));
  }, []);

  const detachPanel = useCallback((panelType) => {
    setDetachedPanels(prev => [...prev, { type: panelType, x: 100, y: 100 }]);
    setPanelVisibility(panelType, false);
  }, [setPanelVisibility]);

  const dockPanel = useCallback((panelType) => {
    setDetachedPanels(prev => prev.filter(p => p.type !== panelType));
    setPanelVisibility(panelType, true);
  }, [setPanelVisibility]);

  // Layout presets
  const applyPreset = useCallback((preset) => {
    switch (preset) {
      case 'compact':
        setMode(WORKSPACE_MODES.MINIMAL);
        setSettings(prev => ({ ...prev, compactMode: true, showAvatars: false }));
        break;
      case 'default':
        setMode(WORKSPACE_MODES.EXPANDED);
        setSettings(prev => ({ ...prev, compactMode: false, showAvatars: true }));
        setPanels(defaultPanelConfig);
        break;
      case 'focus':
        setMode(WORKSPACE_MODES.FOCUSED);
        setPanels(prev => ({
          ...prev,
          [PANEL_TYPES.MEMBERS]: { ...prev[PANEL_TYPES.MEMBERS], visible: false }
        }));
        break;
      case 'stream':
        setMode(WORKSPACE_MODES.IMMERSIVE);
        break;
      default:
        break;
    }
  }, []);

  const saveLayout = useCallback((name) => {
    setSavedLayouts(prev => [...prev, {
      id: Date.now().toString(),
      name,
      mode,
      panels,
      settings
    }]);
  }, [mode, panels, settings]);

  const loadLayout = useCallback((layoutId) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout) {
      setMode(layout.mode);
      setPanels(layout.panels);
      setSettings(layout.settings);
    }
  }, [savedLayouts]);

  const resetWorkspace = useCallback(() => {
    setMode(WORKSPACE_MODES.EXPANDED);
    setPanels(defaultPanelConfig);
    setSettings(defaultSettings);
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      mode,
      setMode,
      panels,
      togglePanel,
      setPanelVisibility,
      pinPanel,
      detachPanel,
      dockPanel,
      detachedPanels,
      settings,
      updateSettings,
      applyPreset,
      saveLayout,
      loadLayout,
      savedLayouts,
      resetWorkspace,
      WORKSPACE_MODES,
      PANEL_TYPES
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}

export default WorkspaceProvider;
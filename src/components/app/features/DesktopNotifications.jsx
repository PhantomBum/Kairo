import { useEffect, useRef } from 'react';
import { playNotificationSound } from './NotificationSounds';

export function useDesktopNotifications({ enabled, soundEnabled, soundName, currentUserId, ghostMode }) {
  const permRef = useRef(false);

  useEffect(() => {
    if (!enabled || ghostMode) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => { permRef.current = p === 'granted'; });
    } else if ('Notification' in window) {
      permRef.current = Notification.permission === 'granted';
    }
  }, [enabled, ghostMode]);

  const notify = (title, body, icon) => {
    if (ghostMode) return;
    if (soundEnabled !== false) {
      playNotificationSound(soundName || 'default');
    }
    if (!enabled || !permRef.current) return;
    if (document.hasFocus()) return; // Don't show if app is focused
    try {
      new Notification(title, { body, icon, silent: true });
    } catch {}
  };

  return { notify };
}
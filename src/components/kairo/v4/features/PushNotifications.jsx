import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show browser notification
export function showNotification(title, options = {}) {
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/kairo-icon.png',
    badge: '/kairo-badge.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    options.onClick?.();
  };

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);
}

// Hook for push notifications
export function usePushNotifications(currentUserId, enabled = true) {
  useEffect(() => {
    if (!enabled || !currentUserId) return;

    // Request permission on first use
    requestNotificationPermission();

    // Subscribe to new messages when not focused
    const handleNewMessage = (event) => {
      if (document.hasFocus()) return;
      
      const { data } = event;
      
      // Don't notify for own messages
      if (data?.author_id === currentUserId) return;

      showNotification(
        data.author_name || 'New Message',
        {
          body: data.content?.slice(0, 100) || 'Sent a message',
          tag: `message-${data.id}`,
        }
      );
    };

    // Subscribe to mentions
    const handleMention = (event) => {
      if (document.hasFocus()) return;
      
      const { data } = event;
      
      showNotification(
        `${data.author_name} mentioned you`,
        {
          body: data.content?.slice(0, 100),
          tag: `mention-${data.id}`,
        }
      );
    };

    // Subscribe to friend requests
    const handleFriendRequest = (event) => {
      const { data } = event;
      
      if (data?.friend_id === currentUserId) {
        showNotification(
          'New Friend Request',
          {
            body: `${data.friend_name} sent you a friend request`,
            tag: `friend-${data.id}`,
          }
        );
      }
    };

    // Listen to entity subscriptions
    const unsubMessages = base44.entities.Message?.subscribe?.(handleNewMessage);
    const unsubFriends = base44.entities.Friendship?.subscribe?.(handleFriendRequest);

    return () => {
      unsubMessages?.();
      unsubFriends?.();
    };
  }, [currentUserId, enabled]);
}

// Notification settings component
export function NotificationSettings({ settings, onUpdate }) {
  const handleToggle = (key) => {
    onUpdate({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg cursor-pointer hover:bg-white/[0.04]">
        <div>
          <p className="text-sm text-white font-medium">Desktop Notifications</p>
          <p className="text-xs text-zinc-500">Get notifications on your desktop</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.desktop_enabled}
          onChange={() => handleToggle('desktop_enabled')}
          className="w-5 h-5 rounded"
        />
      </label>
      
      <label className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg cursor-pointer hover:bg-white/[0.04]">
        <div>
          <p className="text-sm text-white font-medium">Notification Sounds</p>
          <p className="text-xs text-zinc-500">Play a sound for notifications</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.sounds_enabled}
          onChange={() => handleToggle('sounds_enabled')}
          className="w-5 h-5 rounded"
        />
      </label>
      
      <label className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg cursor-pointer hover:bg-white/[0.04]">
        <div>
          <p className="text-sm text-white font-medium">Mention Notifications</p>
          <p className="text-xs text-zinc-500">Get notified when mentioned</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.mention_notifications}
          onChange={() => handleToggle('mention_notifications')}
          className="w-5 h-5 rounded"
        />
      </label>
      
      <label className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg cursor-pointer hover:bg-white/[0.04]">
        <div>
          <p className="text-sm text-white font-medium">DM Notifications</p>
          <p className="text-xs text-zinc-500">Get notified for direct messages</p>
        </div>
        <input
          type="checkbox"
          checked={settings?.dm_notifications}
          onChange={() => handleToggle('dm_notifications')}
          className="w-5 h-5 rounded"
        />
      </label>
    </div>
  );
}

// Play notification sound
export function playNotificationSound(type = 'message') {
  const sounds = {
    message: 'https://cdn.discordapp.com/attachments/1234/message.mp3',
    mention: 'https://cdn.discordapp.com/attachments/1234/mention.mp3',
    call: 'https://cdn.discordapp.com/attachments/1234/call.mp3',
  };

  try {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // Ignore errors
  }
}
import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function useBadgeCheck(userId, profileId) {
  const [newBadges, setNewBadges] = useState([]);
  const [effectDeactivated, setEffectDeactivated] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!userId || checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      try {
        const res = await base44.functions.invoke('checkBadges', { user_id: userId });
        if (res.data?.newBadges?.length > 0) {
          setNewBadges(res.data.newBadges);
        }
        if (res.data?.effectDeactivated) {
          setEffectDeactivated(true);
        }
      } catch (err) {
        console.warn('Badge check failed:', err);
      }
    };

    // Delay badge check to not interfere with initial load
    const timer = setTimeout(check, 3000);
    return () => clearTimeout(timer);
  }, [userId]);

  const dismissBadge = (badge) => {
    setNewBadges(prev => prev.filter(b => b !== badge));
  };

  return { newBadges, effectDeactivated, dismissBadge };
}
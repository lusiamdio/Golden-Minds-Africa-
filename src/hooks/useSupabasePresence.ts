import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  x?: number;
  y?: number;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
}

export function useSupabasePresence(roomId: string) {
  const { user, profile } = useAuth();
  const [activeFellows, setActiveFellows] = useState<Record<string, PresenceUser>>({});

  useEffect(() => {
    if (!user || !roomId) return;

    // Join a Realtime Channel with Presence and Broadcast capability
    const channel = supabase.channel(`presence-room-${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track state of other fellows
    const handleSync = () => {
      const state = channel.presenceState();
      const fellows: Record<string, PresenceUser> = {};
      
      Object.keys(state).forEach((key) => {
        const userPresences = state[key] as any[];
        if (userPresences && userPresences.length > 0) {
          const mainPresence = userPresences[userPresences.length - 1];
          fellows[key] = {
            userId: key,
            name: mainPresence.name || 'Anonymous Fellow',
            email: mainPresence.email || '',
            x: mainPresence.x || 0,
            y: mainPresence.y || 0,
            isMuted: mainPresence.isMuted ?? false,
            isVideoOff: mainPresence.isVideoOff ?? false,
            isHandRaised: mainPresence.isHandRaised ?? false,
          };
        }
      });
      setActiveFellows(fellows);
    };

    // Listen to changes
    channel
      .on('presence', { event: 'sync' }, handleSync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Untrack yourself on mount to guarantee fresh info, then track yourself
          await channel.track({
            userId: user.id,
            name: profile?.name || user.email || 'Fellow Student',
            email: user.email || '',
            x: 0,
            y: 0,
            isMuted: false,
            isVideoOff: false,
            isHandRaised: false,
          });
        }
      });

    // Listener for Broadcast events (Collaborative cursors update)
    let lastX = 0;
    let lastY = 0;

    const cursorListener = (payload: any) => {
      const { userId, x, y } = payload;
      if (userId && userId !== user.id) {
        setActiveFellows((prev) => {
          if (!prev[userId]) return prev;
          return {
            ...prev,
            [userId]: {
              ...prev[userId],
              x,
              y,
            },
          };
        });
      }
    };

    // Listen to mouse moving broadcasts
    const subId = channel.on('broadcast', { event: 'cursor-move' }, cursorListener);

    // Track mouse move to broadcast position
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalised positions relative to window dimensions
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);

      // Throttling updates slightly to avoid network flooding
      if (Math.abs(x - lastX) > 1 || Math.abs(y - lastY) > 1) {
        lastX = x;
        lastY = y;
        channel.send({
          type: 'broadcast',
          event: 'cursor-move',
          payload: { userId: user.id, x, y },
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Clean up channel and mouse listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      channel.unsubscribe();
    };
  }, [user, profile, roomId]);

  return { activeFellows };
}

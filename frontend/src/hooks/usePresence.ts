import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSocket } from '@/lib/socket';

const HEARTBEAT_INTERVAL = 10_000; // 10 seconds
const ONLINE_THRESHOLD = 15_000; // Consider online if last seen within 15 seconds

interface PresenceStatus {
  isOnline: boolean;
  lastSeen: Date | null;
}

/**
 * Hook to track presence/online status of another user
 * @param memberId - The user ID to track
 * @param enabled - Whether to enable tracking
 */
export const usePresence = (memberId: string | null, enabled = true): PresenceStatus => {
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time periodically to recalculate online status
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate if user is online based on last seen timestamp
  const isOnline = useMemo(() => {
    if (!lastSeenTimestamp) return false;
    return currentTime - lastSeenTimestamp < ONLINE_THRESHOLD;
  }, [lastSeenTimestamp, currentTime]);

  const lastSeen = useMemo(() => {
    return lastSeenTimestamp ? new Date(lastSeenTimestamp) : null;
  }, [lastSeenTimestamp]);

  // Send heartbeat and request other user's status
  const sendHeartbeat = useCallback(() => {
    const socket = getSocket();
    if (!socket?.connected || !memberId) {
      console.log('[Presence] Cannot send heartbeat:', { 
        socketExists: !!socket, 
        connected: socket?.connected, 
        memberId 
      });
      return;
    }

    console.log('[Presence] Sending heartbeat for member:', memberId);
    socket.emit('user.heartbeat', JSON.stringify({ memberId }));
  }, [memberId]);

  useEffect(() => {
    if (!enabled || !memberId) return;

    const socket = getSocket();
    if (!socket) return;

    // Handle status response from server
    const handleUserStatus = (data: { userId: string; status: number | undefined }) => {
      console.log('[Presence] Received user.status:', data);
      if (data.userId === memberId) {
        // status can be a timestamp number or undefined
        if (typeof data.status === 'number') {
          setLastSeenTimestamp(data.status);
        }
      }
    };

    socket.on('user.status', handleUserStatus);

    // Send initial heartbeat after a short delay to ensure socket is ready
    const initialTimeout = setTimeout(sendHeartbeat, 500);

    // Set up periodic heartbeat
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      socket.off('user.status', handleUserStatus);
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [memberId, enabled, sendHeartbeat]);

  return { isOnline, lastSeen };
};

/**
 * Format last seen time to human-readable string
 */
export const formatLastSeen = (lastSeen: Date | null): string => {
  if (!lastSeen) return '';

  const now = new Date();
  const diff = now.getTime() - lastSeen.getTime();

  // Less than a minute
  if (diff < 60_000) {
    return 'just now';
  }

  // Less than an hour
  if (diff < 3600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diff < 86400_000) {
    const hours = Math.floor(diff / 3600_000);
    return `${hours}h ago`;
  }

  // More than a day - show date
  return lastSeen.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};


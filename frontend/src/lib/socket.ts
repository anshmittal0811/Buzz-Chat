import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
const GLOBAL_HEARTBEAT_INTERVAL = 10_000; // 10 seconds

let socket: Socket | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export const getSocket = (): Socket | null => socket;

// Send a heartbeat to update own lastSeen in Redis
const sendGlobalHeartbeat = () => {
  if (socket?.connected) {
    // Send heartbeat without memberId - just updates our own lastSeen
    socket.emit('user.heartbeat', JSON.stringify({}));
  }
};

export const connectSocket = (token: string): Socket => {
  console.log('connectSocket called, existing socket:', !!socket, 'connected:', socket?.connected);
  
  if (socket?.connected) {
    console.log('Socket already connected, returning existing socket');
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Clear any existing heartbeat interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  console.log('Creating new socket connection to:', SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], // Allow fallback to polling
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
    
    // Start sending global heartbeats to keep our lastSeen updated
    sendGlobalHeartbeat(); // Send immediately on connect
    heartbeatInterval = setInterval(sendGlobalHeartbeat, GLOBAL_HEARTBEAT_INTERVAL);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    
    // Stop heartbeats on disconnect
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  // Listen for all events for debugging
  socket.onAny((event, ...args) => {
    console.log('📨 Socket event received:', event, args);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};


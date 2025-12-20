import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

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
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
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
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};


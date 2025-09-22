'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const initializeSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // For development, we'll simulate socket connection
        // In production, you would connect to an external WebSocket service
        console.log('Socket connection disabled in development mode');
        console.log('Real-time features will be simulated');
        
        // Simulate connection after a delay
        setTimeout(() => {
          setIsConnected(true);
          console.log('Simulated socket connection established');
        }, 1000);

        // Uncomment below for real Socket.io connection when deploying to a service that supports WebSockets
        /*
        const socketInstance = io(process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL! 
          : 'http://localhost:3000', {
          path: '/api/socket/io',
          addTrailingSlash: false,
          transports: ['polling', 'websocket'], // Fallback to polling
          auth: {
            token,
          },
        });

        socketInstance.on('connect', () => {
          console.log('Connected to socket server');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        setSocket(socketInstance);
        */

        return () => {
          // socketInstance?.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isLoaded, user, getToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

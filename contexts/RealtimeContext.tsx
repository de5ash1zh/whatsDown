'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

interface RealtimeContextType {
  isConnected: boolean;
  sendMessage: (chatId: string, receiverClerkId: string, message: any) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  onNewMessage: (callback: (data: any) => void) => () => void;
  onChatUpdate: (callback: (data: any) => void) => () => void;
  onUserStatusChange: (callback: (data: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  sendMessage: () => {},
  joinChat: () => {},
  leaveChat: () => {},
  onNewMessage: () => () => {},
  onChatUpdate: () => () => {},
  onUserStatusChange: () => () => {},
});

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeChats, setActiveChats] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString());
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  // Event callbacks
  const [messageCallbacks, setMessageCallbacks] = useState<((data: any) => void)[]>([]);
  const [chatCallbacks, setChatCallbacks] = useState<((data: any) => void)[]>([]);
  const [statusCallbacks, setStatusCallbacks] = useState<((data: any) => void)[]>([]);

  // Polling for new messages and updates
  const pollForUpdates = useCallback(async () => {
    if (!isLoaded || !user || activeChats.length === 0) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/messages/sync?lastSync=${lastSync}&chatIds=${activeChats.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Process new messages
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((message: any) => {
            messageCallbacks.forEach(callback => {
              callback({
                chatId: message.chatId,
                message,
                senderClerkId: message.senderId.clerkId,
              });
            });
          });
        }

        // Process chat updates
        if (data.chats && data.chats.length > 0) {
          data.chats.forEach((chat: any) => {
            chatCallbacks.forEach(callback => {
              callback({
                chatId: chat._id,
                chat,
              });
            });
          });
        }

        setLastSync(data.timestamp);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  }, [isLoaded, user, activeChats, lastSync, getToken, messageCallbacks, chatCallbacks]);

  // Set up polling interval
  useEffect(() => {
    if (!isLoaded || !user) return;

    setIsConnected(true);
    console.log('Realtime polling started');

    const interval = setInterval(pollForUpdates, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [isLoaded, user, pollForUpdates]);

  const sendMessage = useCallback((chatId: string, receiverClerkId: string, message: any) => {
    // Message sending is handled by the API, this is just for interface compatibility
    console.log('Message sent via API:', { chatId, receiverClerkId, message });
  }, []);

  const joinChat = useCallback((chatId: string) => {
    setActiveChats(prev => {
      if (!prev.includes(chatId)) {
        console.log('Joined chat:', chatId);
        return [...prev, chatId];
      }
      return prev;
    });
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    setActiveChats(prev => {
      const filtered = prev.filter(id => id !== chatId);
      console.log('Left chat:', chatId);
      return filtered;
    });
  }, []);

  const onNewMessage = useCallback((callback: (data: any) => void) => {
    setMessageCallbacks(prev => {
      // Avoid duplicate callbacks
      if (prev.includes(callback)) return prev;
      return [...prev, callback];
    });
    
    // Return cleanup function
    return () => {
      setMessageCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  const onChatUpdate = useCallback((callback: (data: any) => void) => {
    setChatCallbacks(prev => {
      if (prev.includes(callback)) return prev;
      return [...prev, callback];
    });
    
    return () => {
      setChatCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  const onUserStatusChange = useCallback((callback: (data: any) => void) => {
    setStatusCallbacks(prev => {
      if (prev.includes(callback)) return prev;
      return [...prev, callback];
    });
    
    return () => {
      setStatusCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      sendMessage,
      joinChat,
      leaveChat,
      onNewMessage,
      onChatUpdate,
      onUserStatusChange,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

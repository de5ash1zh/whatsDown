'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import UserSearch from '@/components/UserSearch';

interface Chat {
  _id: string;
  participants: Array<{
    _id: string;
    clerkId: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
  }>;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderName: string;
  };
  updatedAt: Date;
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Create or update user profile
    createUserProfile();
    fetchChats();
  }, [isLoaded, user, router]);

  const createUserProfile = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user.username || user.firstName || 'User',
          email: user.emailAddresses[0]?.emailAddress,
          avatar: user.imageUrl,
        }),
      });

      if (!response.ok) {
        console.error('Failed to create/update user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (socket) {
      socket.emit('chat:join', chat._id);
    }
  };

  const handleNewChat = async (recipientClerkId: string) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientClerkId }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
        setShowUserSearch(false);
        
        if (socket) {
          socket.emit('chat:join', newChat._id);
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chats</h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              New Chat
            </button>
          </div>
          <div className="flex items-center mt-2">
            <img
              src={user.imageUrl}
              alt={user.username || 'User'}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <div className="font-medium">{user.username || user.firstName}</div>
              <div className="text-xs text-gray-500 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>

        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          currentUserClerkId={user.id}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUser={user}
            socket={socket}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <div className="text-lg">Select a chat to start messaging</div>
              <div className="text-sm mt-2">or create a new chat to get started</div>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onSelectUser={handleNewChat}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRealtime } from '@/contexts/RealtimeContext';
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
  const { isConnected, joinChat, leaveChat, onNewMessage, onChatUpdate } = useRealtime();
  
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

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      const { chatId, message } = data;
      
      // Update chat list with new last message
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { 
              ...chat, 
              lastMessage: {
                content: message.content,
                timestamp: message.timestamp,
                senderName: message.senderId.username
              },
              updatedAt: new Date()
            }
          : chat
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    // Listen for chat updates
    const handleChatUpdate = (data: any) => {
      const { chatId, lastMessage } = data;
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { ...chat, lastMessage, updatedAt: new Date() }
          : chat
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    // Set up listeners
    const unsubscribeMessage = onNewMessage(handleNewMessage);
    const unsubscribeChat = onChatUpdate(handleChatUpdate);

    return () => {
      unsubscribeMessage();
      unsubscribeChat();
    };
  }, [user, onNewMessage, onChatUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Quick search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowUserSearch(true);
      }
      
      // Escape - Close modals
      if (e.key === 'Escape') {
        setShowUserSearch(false);
      }
      
      // Arrow keys for chat navigation
      if (chats.length > 0 && !showUserSearch) {
        const currentIndex = selectedChat ? chats.findIndex(c => c._id === selectedChat._id) : -1;
        
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          handleChatSelect(chats[currentIndex - 1]);
        } else if (e.key === 'ArrowDown' && currentIndex < chats.length - 1) {
          e.preventDefault();
          handleChatSelect(chats[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chats, selectedChat, showUserSearch]);

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
    joinChat(chat._id);
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
        
        joinChat(newChat._id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading WhatsDown</h2>
          <p className="text-gray-600">Setting up your conversations...</p>
        </div>
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
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 flex items-center space-x-2"
              title="Keyboard shortcut: Cmd/Ctrl + K"
            >
              <span>New Chat</span>
              <kbd className="bg-blue-600 text-xs px-1 py-0.5 rounded">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
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
            <div className="flex items-center space-x-2">
              <Link
                href="/profile"
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                title="Profile Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
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
            currentUser={{
              id: user.id,
              username: user.username || undefined,
              firstName: user.firstName || undefined,
              imageUrl: user.imageUrl
            }}
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

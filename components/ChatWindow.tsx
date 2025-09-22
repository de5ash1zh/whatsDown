'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import MessageInput from '@/components/MessageInput';
import { useRealtime } from '@/contexts/RealtimeContext';

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    clerkId: string;
    username: string;
    avatar?: string;
  };
  receiverId: {
    _id: string;
    clerkId: string;
    username: string;
    avatar?: string;
  };
  status: 'sent' | 'delivered' | 'seen';
  timestamp: Date;
}

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
}

interface User {
  id: string;
  username?: string;
  firstName?: string;
  imageUrl: string;
}

interface ChatWindowProps {
  chat: Chat;
  currentUser: User;
  onMessageSent?: (chatId: string, message: Message) => void;
}

export default function ChatWindow({ chat, currentUser, onMessageSent }: ChatWindowProps) {
  const { getToken } = useAuth();
  const { joinChat, leaveChat, onNewMessage, sendMessage } = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = chat.participants.find(p => p.clerkId !== currentUser.id);

  // Helpers
  const dedupeAndSort = (list: Message[]) => {
    const map = new Map<string, Message>();
    for (const m of list) map.set(m._id, m);
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  useEffect(() => {
    if (chat._id) {
      fetchMessages();
    }
  }, [chat._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join/leave chat room and subscribe to realtime new messages (polling-based)
  useEffect(() => {
    if (!chat._id) return;
    joinChat(chat._id);

    const unsubscribe = onNewMessage((data: any) => {
      if (data.chatId === chat._id && data.message) {
        setMessages(prev => dedupeAndSort([...prev, data.message]));
      }
    });

    return () => {
      unsubscribe();
      leaveChat(chat._id);
    };
  }, [chat._id, joinChat, leaveChat, onNewMessage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`/api/messages?chatId=${chat._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(dedupeAndSort(data.messages || []));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!otherParticipant || !content.trim()) return;

    try {
      const token = await getToken();
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: chat._id,
          content: content.trim(),
          receiverClerkId: otherParticipant.clerkId,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => dedupeAndSort([...prev, newMessage]));

        // Call the callback to update parent component
        if (onMessageSent) {
          onMessageSent(chat._id, newMessage);
        }
        // Notify realtime layer (no-op in polling mode, safe to call)
        sendMessage(chat._id, otherParticipant.clerkId, newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (_isTyping: boolean) => {
    // Typing indicators are not propagated in polling mode.
    // Kept for UI responsiveness, but no backend call.
    return;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    return format(new Date(date), 'HH:mm');
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId.clerkId !== currentUser.id) return null;
    
    switch (message.status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'seen':
        return '✓✓';
      default:
        return '';
    }
  };

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Chat not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={otherParticipant.avatar || '/default-avatar.png'}
              alt={otherParticipant.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold">{otherParticipant.username}</h2>
            <p className="text-sm text-gray-500">
              {otherParticipant.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">👋</div>
              <div>No messages yet</div>
              <div className="text-sm">Send a message to start the conversation</div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.senderId.clerkId === currentUser.id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isOwn && (
                        <span className={message.status === 'seen' ? 'text-blue-200' : ''}>
                          {getMessageStatus(message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="text-sm italic">{typing} is typing...</div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}

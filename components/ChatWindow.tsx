'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Socket } from 'socket.io-client';
import { format } from 'date-fns';
import MessageInput from '@/components/MessageInput';

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
  socket: Socket | null;
  onMessageSent?: (chatId: string, message: Message) => void;
}

export default function ChatWindow({ chat, currentUser, socket, onMessageSent }: ChatWindowProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = chat.participants.find(p => p.clerkId !== currentUser.id);

  useEffect(() => {
    if (chat._id) {
      fetchMessages();
    }
  }, [chat._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.chatId === chat._id) {
        setMessages(prev => [...prev, data.message]);
        
        // Mark message as delivered
        if (data.message.senderId.clerkId !== currentUser.id) {
          socket.emit('message:status', {
            messageId: data.message._id,
            status: 'delivered',
            senderClerkId: data.message.senderId.clerkId,
          });
        }
      }
    };

    // Listen for message status updates
    const handleMessageStatusUpdate = (data: any) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: data.status }
            : msg
        )
      );
    };

    // Listen for typing indicators
    const handleTypingStart = (data: any) => {
      if (data.chatId === chat._id && data.userClerkId !== currentUser.id) {
        setTyping(data.username);
      }
    };

    const handleTypingStop = (data: any) => {
      if (data.chatId === chat._id && data.userClerkId !== currentUser.id) {
        setTyping(null);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status:update', handleMessageStatusUpdate);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status:update', handleMessageStatusUpdate);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, chat._id, currentUser.id]);

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
        setMessages(data.messages);
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
        setMessages(prev => [...prev, newMessage]);

        // Call the callback to update parent component
        if (onMessageSent) {
          onMessageSent(chat._id, newMessage);
        }

        // Emit via socket for real-time delivery
        if (socket) {
          socket.emit('message:send', {
            chatId: chat._id,
            receiverClerkId: otherParticipant.clerkId,
            message: newMessage,
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !otherParticipant) return;

    if (isTyping) {
      socket.emit('typing:start', {
        chatId: chat._id,
        receiverClerkId: otherParticipant.clerkId,
      });
    } else {
      socket.emit('typing:stop', {
        chatId: chat._id,
        receiverClerkId: otherParticipant.clerkId,
      });
    }
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

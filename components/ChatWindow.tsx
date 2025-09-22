'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import MessageInput from '@/components/MessageInput';
import { useRealtime } from '@/contexts/RealtimeContext';
import SettingsDrawer from '@/components/SettingsDrawer';

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
  onBack?: () => void; // mobile back to chat list
}

export default function ChatWindow({ chat, currentUser, onMessageSent, onBack }: ChatWindowProps) {
  const { getToken } = useAuth();
  const { joinChat, leaveChat, onNewMessage, sendMessage } = useRealtime();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    // Prefer container scroll to avoid layout jumps
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      // Only autoscroll if user is near bottom, or it's our own send
      const threshold = 120; // px
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
        return;
      }
    }
    // Fallback
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
    <div className="flex-1 flex h-full flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          {/* Mobile back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-3 rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Back to chats"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
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
          <div className="ml-auto">
            <button
              onClick={() => setSettingsOpen(true)}
              className="hidden md:inline-flex rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Open settings"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.983 4.5a1.5 1.5 0 012.598-1.06l.53.53a1.5 1.5 0 001.06.44h.75a1.5 1.5 0 011.5 1.5v.75a1.5 1.5 0 00.44 1.06l.53.53a1.5 1.5 0 010 2.121l-.53.53a1.5 1.5 0 00-.44 1.06v.75a1.5 1.5 0 01-1.5 1.5h-.75a1.5 1.5 0 00-1.06.44l-.53.53a1.5 1.5 0 01-2.121 0l-.53-.53a1.5 1.5 0 00-1.06-.44h-.75a1.5 1.5 0 01-1.5-1.5v-.75a1.5 1.5 0 00-.44-1.06l-.53-.53a1.5 1.5 0 010-2.121l.53-.53a1.5 1.5 0 00.44-1.06v-.75a1.5 1.5 0 011.5-1.5h.75a1.5 1.5 0 001.06-.44l.53-.53a1.5 1.5 0 01.44-.34z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages (scrollable only this pane) */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] md:max-w-[70%] px-3 py-2 rounded-xl border ${i % 2 === 0 ? 'bg-gray-100 border-gray-200' : 'bg-blue-500/10 border-blue-200'}`}>
                  <div className="skeleton h-3 w-40 rounded mb-2" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
            ))}
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
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isOwn = message.senderId.clerkId === currentUser.id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                      isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm">
                      {(() => {
                        const c = String(message.content || '');
                        const isDataImg = c.startsWith('data:image');
                        const isImgLink = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(c);
                        if (isDataImg || isImgLink) {
                          return (
                            <a href={c} target="_blank" rel="noreferrer">
                              <img src={c} alt="image" className={`rounded-lg ${isOwn ? '' : ''}`} style={{ maxHeight: 280 }} />
                            </a>
                          );
                        }
                        return <span>{c}</span>;
                      })()}
                    </div>
                    <div
                      className={`text-[11px] mt-1 flex items-center justify-end gap-1 ${
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
                <div className="bg-gray-100 text-gray-800 max-w-[70%] px-3 py-2 rounded-xl border border-gray-200">
                  <div className="text-sm italic">{typing} is typing...</div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input (sticky at bottom, page does not scroll) */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

'use client';

import { formatDistanceToNow } from 'date-fns';

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
  unreadCount?: number;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  currentUserClerkId: string;
  loading?: boolean;
}

export default function ChatSidebar({ 
  chats, 
  selectedChat, 
  onChatSelect, 
  currentUserClerkId,
  loading = false,
}: ChatSidebarProps) {
  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.clerkId !== currentUserClerkId);
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="p-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 hover-raise">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="skeleton h-3 w-2/3 rounded mb-2" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations yet</h3>
          <p className="text-xs text-gray-500">Click "New Chat" to start your first conversation</p>
        </div>
      ) : (
        <div className="p-2">
          <div className="space-y-1">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              if (!otherParticipant) return null;

              const isSelected = selectedChat?._id === chat._id;
              const hasUnread = chat.unreadCount && chat.unreadCount > 0;

              return (
                <div
                  key={chat._id}
                  onClick={() => onChatSelect(chat)}
                  className={`chat-item p-3 cursor-pointer transition-all duration-200 rounded-lg group relative ${
                    isSelected 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  {hasUnread && !isSelected && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                  )}
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=6b7280&color=fff`}
                        alt={otherParticipant.username}
                        className={`w-12 h-12 rounded-full object-cover transition-all ${
                          isSelected ? 'ring-2 ring-white ring-opacity-50' : 'ring-2 ring-gray-200'
                        }`}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                          isSelected ? 'border-blue-500' : 'border-white'
                        } ${otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></div>
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {otherParticipant.username}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {chat.lastMessage && (
                            <span className={`text-xs ${
                              isSelected ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                          {hasUnread && (
                            <span className={`text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium ${
                              isSelected 
                                ? 'bg-white text-blue-500' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              {(chat.unreadCount || 0) > 99 ? '99+' : (chat.unreadCount || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-1">
                        <p className={`text-sm truncate ${
                          isSelected ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {chat.lastMessage ? (
                            <>
                              <span className={`font-medium ${
                                isSelected ? 'text-blue-50' : 'text-gray-700'
                              }`}>
                                {chat.lastMessage.senderName === otherParticipant.username ? '' : 'You: '}
                              </span>
                              {chat.lastMessage.content}
                            </>
                          ) : (
                            <span className="italic">Start the conversation...</span>
                          )}
                        </p>
                      </div>
                      
                      {otherParticipant.isOnline && (
                        <div className={`flex items-center mt-1 ${
                          isSelected ? 'text-blue-100' : 'text-green-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            isSelected ? 'bg-blue-100' : 'bg-green-500'
                          } animate-pulse`}></div>
                          <span className="text-xs font-medium">Online</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

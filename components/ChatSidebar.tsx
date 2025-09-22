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
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  currentUserClerkId: string;
}

export default function ChatSidebar({ 
  chats, 
  selectedChat, 
  onChatSelect, 
  currentUserClerkId 
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
      {chats.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <div className="text-sm">No chats yet</div>
          <div className="text-xs mt-1">Start a new conversation</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            if (!otherParticipant) return null;

            const isSelected = selectedChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={otherParticipant.avatar || '/default-avatar.png'}
                      alt={otherParticipant.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        otherParticipant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {otherParticipant.username}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage ? (
                          <>
                            <span className="font-medium">
                              {chat.lastMessage.senderName}:
                            </span>{' '}
                            {chat.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>
                    </div>
                    
                    {!otherParticipant.isOnline && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last seen {formatTime(new Date(otherParticipant.lastSeen))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

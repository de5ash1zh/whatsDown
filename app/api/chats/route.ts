import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import User from '@/models/User';
import Message from '@/models/Message';

// GET /api/chats - Get all chats for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find current user
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all chats where current user is a participant
    const chats = await Chat.find({
      participants: currentUser._id
    })
    .populate('participants', 'clerkId username email avatar isOnline lastSeen')
    .sort({ updatedAt: -1 });

    // Get the last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ timestamp: -1 })
          .populate('senderId', 'username');

        return {
          ...chat.toObject(),
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderName: lastMessage.senderId.username,
          } : null,
        };
      })
    );

    return NextResponse.json(chatsWithLastMessage);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chats - Create a new chat between two users
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientClerkId } = body;

    if (!recipientClerkId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Find both users
    const currentUser = await User.findOne({ clerkId: userId });
    const recipientUser = await User.findOne({ clerkId: recipientClerkId });

    if (!currentUser || !recipientUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUser._id, recipientUser._id] }
    }).populate('participants', 'clerkId username email avatar isOnline lastSeen');

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: [currentUser._id, recipientUser._id],
    });

    await newChat.save();

    // Populate the participants for the response
    await newChat.populate('participants', 'clerkId username email avatar isOnline lastSeen');

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

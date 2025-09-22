import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET /api/messages/sync - Get new messages since last sync
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lastSync = searchParams.get('lastSync');
    const chatIds = searchParams.get('chatIds')?.split(',') || [];

    await dbConnect();

    // Find current user
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get new messages since last sync
    const query: any = {
      chatId: { $in: chatIds },
    };

    if (lastSync) {
      query.createdAt = { $gt: new Date(lastSync) };
    }

    const newMessages = await Message.find(query)
      .populate('senderId', 'clerkId username avatar')
      .populate('receiverId', 'clerkId username avatar')
      .sort({ timestamp: 1 })
      .limit(50);

    // Get updated chat info
    const updatedChats = await Chat.find({
      _id: { $in: chatIds },
      updatedAt: { $gt: lastSync ? new Date(lastSync) : new Date(0) }
    })
    .populate('participants', 'clerkId username email avatar isOnline lastSeen')
    .sort({ updatedAt: -1 });

    return NextResponse.json({
      messages: newMessages,
      chats: updatedChats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

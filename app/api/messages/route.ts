import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import Chat from '@/models/Chat';
import User from '@/models/User';

// GET /api/messages - Get messages for a specific chat
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Find current user
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(currentUser._id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find({ chatId })
      .populate('senderId', 'clerkId username avatar')
      .populate('receiverId', 'clerkId username avatar')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Reverse to get chronological order
    messages.reverse();

    return NextResponse.json({
      messages,
      page,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, content, receiverClerkId } = body;

    if (!chatId || !content || !receiverClerkId) {
      return NextResponse.json({ 
        error: 'Chat ID, content, and receiver ID are required' 
      }, { status: 400 });
    }

    await dbConnect();

    // Find users
    const sender = await User.findOne({ clerkId: userId });
    const receiver = await User.findOne({ clerkId: receiverClerkId });

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(sender._id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new message
    const message = new Message({
      chatId,
      senderId: sender._id,
      receiverId: receiver._id,
      content: content.trim(),
      status: 'sent',
      timestamp: new Date(),
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = content.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    // Populate sender and receiver info for response
    await message.populate('senderId', 'clerkId username avatar');
    await message.populate('receiverId', 'clerkId username avatar');

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/messages - Update message status (delivered/seen)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json({ 
        error: 'Message ID and status are required' 
      }, { status: 400 });
    }

    if (!['delivered', 'seen'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be "delivered" or "seen"' 
      }, { status: 400 });
    }

    await dbConnect();

    // Find current user
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find and update message
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only receiver can update message status
    if (!message.receiverId.equals(currentUser._id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    message.status = status;
    await message.save();

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users - Search for users (contacts)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let users;
    if (query) {
      // Search users by username or email
      users = await User.find({
        clerkId: { $ne: userId }, // Exclude current user
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).select('clerkId username email avatar isOnline lastSeen').limit(20);
    } else {
      // Get all users except current user
      users = await User.find({
        clerkId: { $ne: userId }
      }).select('clerkId username email avatar isOnline lastSeen').limit(50);
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, avatar } = body;

    await dbConnect();

    // Check if user already exists
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update existing user
      user.username = username || user.username;
      user.email = email || user.email;
      user.avatar = avatar || user.avatar;
      user.lastSeen = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        clerkId: userId,
        username,
        email,
        avatar: avatar || '',
        lastSeen: new Date(),
        isOnline: true,
      });
      await user.save();
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

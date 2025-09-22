import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { verifyToken } from '@clerk/nextjs/server';
import dbConnect from './mongodb';
import User from '@/models/User';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        // Verify Clerk JWT token
        const payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY!,
        });

        if (!payload.sub) {
          return next(new Error('Invalid token'));
        }

        await dbConnect();
        const user = await User.findOne({ clerkId: payload.sub });
        
        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.data.user = user;
        socket.data.clerkId = payload.sub;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    io.on('connection', async (socket) => {
      const user = socket.data.user;
      const clerkId = socket.data.clerkId;
      
      console.log(`User ${user.username} connected`);

      // Join user-specific room
      socket.join(`user:${clerkId}`);

      // Update user online status
      try {
        await User.findByIdAndUpdate(user._id, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Notify contacts that user is online
        socket.broadcast.emit('user:online', {
          clerkId,
          username: user.username,
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }

      // Handle joining chat rooms
      socket.on('chat:join', (chatId) => {
        socket.join(`chat:${chatId}`);
        console.log(`User ${user.username} joined chat ${chatId}`);
      });

      // Handle leaving chat rooms
      socket.on('chat:leave', (chatId) => {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${user.username} left chat ${chatId}`);
      });

      // Handle new messages
      socket.on('message:send', (data) => {
        const { chatId, receiverClerkId, message } = data;
        
        // Emit to receiver's room
        socket.to(`user:${receiverClerkId}`).emit('message:new', {
          chatId,
          message,
          senderClerkId: clerkId,
        });

        // Emit to chat room
        socket.to(`chat:${chatId}`).emit('message:new', {
          chatId,
          message,
          senderClerkId: clerkId,
        });
      });

      // Handle chat updates (for last message sync)
      socket.on('chat:update', (data) => {
        const { chatId, lastMessage } = data;
        
        // Broadcast to all participants in the chat
        socket.to(`chat:${chatId}`).emit('chat:update', {
          chatId,
          lastMessage,
        });
      });

      // Handle message status updates
      socket.on('message:status', (data) => {
        const { messageId, status, senderClerkId } = data;
        
        // Notify sender about status update
        socket.to(`user:${senderClerkId}`).emit('message:status:update', {
          messageId,
          status,
        });
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        const { chatId, receiverClerkId } = data;
        socket.to(`user:${receiverClerkId}`).emit('typing:start', {
          chatId,
          userClerkId: clerkId,
          username: user.username,
        });
      });

      socket.on('typing:stop', (data) => {
        const { chatId, receiverClerkId } = data;
        socket.to(`user:${receiverClerkId}`).emit('typing:stop', {
          chatId,
          userClerkId: clerkId,
        });
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`User ${user.username} disconnected`);
        
        try {
          // Update user offline status
          await User.findByIdAndUpdate(user._id, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Notify contacts that user is offline
          socket.broadcast.emit('user:offline', {
            clerkId,
            username: user.username,
          });
        } catch (error) {
          console.error('Error updating user status on disconnect:', error);
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;

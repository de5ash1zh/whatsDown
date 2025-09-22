# WhatsDown - Real-time Chat Application

A modern real-time chat application built with Next.js, Clerk authentication, MongoDB, and Socket.io.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk
- 💬 **Real-time Messaging** - Instant message delivery with Socket.io
- 👥 **User Management** - Search and connect with other users
- 🟢 **Online Status** - See who's online and when they were last active
- ⌨️ **Typing Indicators** - Know when someone is typing
- ✅ **Message Status** - Track message delivery and read status
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Deployment**: Vercel (recommended)

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Clerk account for authentication

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd my-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/whatsdown

# Optional: For production deployment
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the publishable key and secret key to your `.env.local`
4. Configure sign-in/sign-up pages:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/chat`
   - After sign-up URL: `/chat`

### 4. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env.local`

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── users/          # User management API
│   │   ├── chats/          # Chat management API
│   │   ├── messages/       # Message API
│   │   └── socket/         # Socket.io setup
│   ├── chat/               # Main chat interface
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Landing page
├── components/
│   ├── ChatSidebar.tsx     # Chat list sidebar
│   ├── ChatWindow.tsx      # Main chat interface
│   ├── MessageInput.tsx    # Message input component
│   └── UserSearch.tsx      # User search modal
├── contexts/
│   └── SocketContext.tsx   # Socket.io context provider
├── lib/
│   ├── mongodb.ts          # Database connection
│   └── socket.ts           # Socket.io server setup
├── models/
│   ├── User.ts             # User model
│   ├── Chat.ts             # Chat model
│   └── Message.ts          # Message model
└── middleware.ts           # Clerk route protection
```

## API Endpoints

### Users
- `GET /api/users` - Search users
- `POST /api/users` - Create/update user profile

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat

### Messages
- `GET /api/messages?chatId=<id>` - Get chat messages
- `POST /api/messages` - Send new message
- `PATCH /api/messages` - Update message status

## Socket.io Events

### Client to Server
- `chat:join` - Join a chat room
- `chat:leave` - Leave a chat room
- `message:send` - Send a message
- `message:status` - Update message status
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server to Client
- `message:new` - New message received
- `message:status:update` - Message status updated
- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - Someone started typing
- `typing:stop` - Someone stopped typing

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret
MONGODB_URI=your_production_mongodb_uri
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Socket.io connection issues**
   - Make sure the Socket.io server is running
   - Check CORS configuration for production

2. **Clerk authentication not working**
   - Verify environment variables are set correctly
   - Check Clerk dashboard configuration

3. **MongoDB connection errors**
   - Ensure MongoDB is running (local) or accessible (cloud)
   - Verify connection string format

4. **TypeScript errors**
   - Run `npm run build` to check for type errors
   - Ensure all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

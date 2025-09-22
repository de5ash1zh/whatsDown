import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: string[]; // Array of user IDs
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Ensure participants array has exactly 2 users for direct messaging
ChatSchema.pre('save', function(this: IChat, next) {
  if (this.participants.length !== 2) {
    next(new Error('Chat must have exactly 2 participants'));
  } else {
    next();
  }
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

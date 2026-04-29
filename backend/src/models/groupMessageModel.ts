import mongoose, { Document, Schema, Model } from "mongoose";

export interface GroupMessageSchema extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  contentType: 'text' | 'image' | 'video';
  readBy: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const groupMessageSchema: Schema<GroupMessageSchema> = new mongoose.Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text'
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
groupMessageSchema.index({ group: 1, createdAt: -1 });

const GroupMessage: Model<GroupMessageSchema> = mongoose.model<GroupMessageSchema>(
  "GroupMessage",
  groupMessageSchema
);

export default GroupMessage;
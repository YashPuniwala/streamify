import mongoose, { Document, Schema, Model } from "mongoose";

export interface FriendRequestSchema extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: "pending" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema: Schema<FriendRequestSchema> = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const FriendRequest: Model<FriendRequestSchema> = mongoose.model<FriendRequestSchema>(
  "FriendRequest",
  friendRequestSchema
);

export default FriendRequest;

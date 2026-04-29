import mongoose, { Document, Schema, Model } from "mongoose";

// Define the invite subdocument interface
interface IGroupInvite {
  userId: mongoose.Types.ObjectId;
  inviterId: mongoose.Types.ObjectId;
  accepted: boolean;
  createdAt: Date;
  acceptedAt?: Date;
}

// Define the main Group interface
export interface IGroup extends Document {
  name: string;
  description: string;
  language: string;
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  invites: IGroupInvite[];  // Add invites to the interface
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema with invites
const groupSchema: Schema<IGroup> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    invites: [{  // Add the invites array to the schema
      userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      inviterId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      accepted: { 
        type: Boolean, 
        default: false 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      acceptedAt: { 
        type: Date 
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
groupSchema.index({ language: 1 });
groupSchema.index({ admin: 1 });
groupSchema.index({ members: 1 });

// Create the model
const Group: Model<IGroup> = mongoose.model<IGroup>("Group", groupSchema);

export default Group;
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import Group from "../models/groupModel";
import User from "../models/authModel";
import GroupMessage from "../models/groupMessageModel";
import mongoose from "mongoose";

export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, language } = req.body;
    const adminId = req.user?.id;

    // Validate input
    if (!name || !description || !language) {
      res.status(400).json({ message: "Name, description, and language are required" });
      return;
    }

    // Create the group
    const group = await Group.create({
      name,
      description,
      language,
      admin: adminId,
      members: [adminId] // Admin is automatically a member
    });

    // Populate admin details in the response
    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'fullName profilePic')
      .populate('members', 'fullName profilePic');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ 
      message: "Failed to create group",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getGroups = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { language } = req.query;
    const userId = req.user?.id;

    let query: any = {};
    
    // Filter by language if provided
    if (language) {
      query.language = language;
    }

    // Find groups where the user is a member or public groups in their learning language
    const user = await User.findById(userId).select('learningLanguage');
    const userLearningLanguage = user?.learningLanguage;

    const groups = await Group.find({
      $or: [
        { members: userId }, // Groups the user is already in
        { 
          language: userLearningLanguage,
          members: { $ne: userId } // Public groups in their learning language they're not in
        }
      ],
      ...query
    })
    .populate('admin', 'fullName profilePic')
    .populate('members', 'fullName profilePic')
    .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups controller:", error.message);
    res.status(500).json({ 
      message: "Failed to get groups",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getGroupDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Check if the user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: userId
    })
    .populate('admin', 'fullName profilePic')
    .populate('members', 'fullName profilePic');

    if (!group) {
      res.status(404).json({ message: "Group not found or you're not a member" });
      return;
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails controller:", error.message);
    res.status(500).json({ 
      message: "Failed to get group details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const joinGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      res.status(400).json({ message: "You're already a member of this group" });
      return;
    }

    // Add user to group members
    group.members.push(userId);
    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'fullName profilePic')
      .populate('members', 'fullName profilePic');

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in joinGroup controller:", error.message);
    res.status(500).json({ 
      message: "Failed to join group",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const leaveGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      res.status(400).json({ message: "You're not a member of this group" });
      return;
    }

    // Check if user is admin (admin can't leave, must delete group or transfer admin)
    if (group.admin.toString() === userId) {
      res.status(400).json({ message: "Admins can't leave the group. Transfer admin or delete the group." });
      return;
    }

    // Remove user from group members
    group.members = group.members.filter(memberId => memberId.toString() !== userId);
    await group.save();

    res.status(200).json({ message: "Successfully left the group" });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error.message);
    res.status(500).json({ 
      message: "Failed to leave group",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const sendGroupMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { content, contentType = 'text' } = req.body;
    const senderId = req.user?.id;

    // Validate input
    if (!content) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      members: senderId
    });

    if (!group) {
      res.status(403).json({ message: "You're not a member of this group" });
      return;
    }

    // Create the message
    const message = await GroupMessage.create({
      group: groupId,
      sender: senderId,
      content,
      contentType,
      readBy: [senderId] // Mark as read by sender
    });

    // Populate sender details in the response
    const populatedMessage = await GroupMessage.findById(message._id)
      .populate('sender', 'fullName profilePic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage controller:", error.message);
    res.status(500).json({ 
      message: "Failed to send message",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getGroupMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;
    const { limit = 50, skip = 0 } = req.query;

    // Check if user is a member of the group
    const isMember = await Group.exists({
      _id: groupId,
      members: userId
    });

    if (!isMember) {
      res.status(403).json({ message: "You're not a member of this group" });
      return;
    }

    // Get messages with pagination
    const messages = await GroupMessage.find({ group: groupId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('sender', 'fullName profilePic')
      .populate('readBy', 'fullName profilePic');

    res.status(200).json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error("Error in getGroupMessages controller:", error.message);
    res.status(500).json({ 
      message: "Failed to get messages",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markMessageAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    // Update the message to add user to readBy array if not already there
    const message = await GroupMessage.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    )
    .populate('sender', 'fullName profilePic')
    .populate('readBy', 'fullName profilePic');

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markMessageAsRead controller:", error.message);
    res.status(500).json({ 
      message: "Failed to mark message as read",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    // Check if group exists and user is admin
    const group = await Group.findOne({
      _id: groupId,
      admin: userId
    });

    if (!group) {
      res.status(403).json({ 
        message: "Group not found or you're not the admin" 
      });
      return;
    }

    // Use transaction to delete group and all its messages
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all messages in the group
      await GroupMessage.deleteMany({ group: groupId }).session(session);
      
      // Delete the group
      await Group.findByIdAndDelete(groupId).session(session);
      
      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ 
      message: "Failed to delete group",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;
    const { name, description, language } = req.body;

    // Check if group exists and user is admin
    const group = await Group.findOne({
      _id: groupId,
      admin: userId
    });

    if (!group) {
      res.status(403).json({ 
        message: "Group not found or you're not the admin" 
      });
      return;
    }

    // Update group fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (language) group.language = language;

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'fullName profilePic')
      .populate('members', 'fullName profilePic');

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in updateGroup controller:", error.message);
    res.status(500).json({ 
      message: "Failed to update group",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const sendGroupInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body; // The user being invited
    const inviterId = req.user?.id; // The user sending the invitation

    // Validate input
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Check if inviter is a member of the group
    if (!group.members.includes(inviterId)) {
      res.status(403).json({ message: "You must be a member to invite others" });
      return;
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      res.status(400).json({ message: "User is already a member of this group" });
      return;
    }

    // Check if invitation already exists
    const existingInvite = group.invites.find(
      (invite) => invite.userId.toString() === userId && !invite.accepted
    );
    if (existingInvite) {
      res.status(400).json({ message: "User already has a pending invitation" });
      return;
    }

    // Add invitation
    group.invites.push({
      userId,
      inviterId,
      accepted: false,
      createdAt: new Date()
    });

    await group.save();

    // You might want to send a real notification here
    res.status(200).json({ 
      message: "Invitation sent successfully",
      group: await Group.findById(group._id)
        .populate('admin', 'fullName profilePic')
        .populate('members', 'fullName profilePic')
    });
  } catch (error) {
    console.error("Error in sendGroupInvitation controller:", error.message);
    res.status(500).json({ 
      message: "Failed to send invitation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const acceptGroupInvitation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id; // The user accepting the invitation

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Find the invitation
    const inviteIndex = group.invites.findIndex(
      (invite) => invite.userId.toString() === userId && !invite.accepted
    );

    if (inviteIndex === -1) {
      res.status(404).json({ message: "No pending invitation found" });
      return;
    }

    // Mark invitation as accepted
    group.invites[inviteIndex].accepted = true;
    group.invites[inviteIndex].acceptedAt = new Date();

    // Add user to members if not already there
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    await group.save();

    res.status(200).json({ 
      message: "Invitation accepted successfully",
      group: await Group.findById(group._id)
        .populate('admin', 'fullName profilePic')
        .populate('members', 'fullName profilePic')
    });
  } catch (error) {
    console.error("Error in acceptGroupInvitation controller:", error.message);
    res.status(500).json({ 
      message: "Failed to accept invitation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
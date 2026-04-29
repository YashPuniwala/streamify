import User from "../models/authModel";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import FriendRequest from "../models/friendRequestModel";
import mongoose from "mongoose";

export const getRecommendedUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const currentUser = await User.findById(currentUserId).select('friends learningLanguage nativeLanguage');

    if (!currentUser) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // Get recommended users who:
    // 1. Are not the current user
    // 2. Are not already friends
    // 3. Are onboarded
    // 4. Speak the language current user is learning
    const recommendedUsers = await User.find({
      _id: { 
        $ne: currentUserId, // Not current user
        $nin: currentUser.friends || [] // Not in friends list
      },
      isOnboarded: true,
      nativeLanguage: currentUser.learningLanguage // Speaks language you're learning
    })
    .select('fullName profilePic nativeLanguage learningLanguage location bio')
    .limit(10);

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: "Failed to get recommendations",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMyFriends = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(user?.friends);
  } catch (error: any) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
      return;
    }

    const recipient = await User.findById(recipientId);

    if (!recipient) {
      res.status(404).json({ message: "Recipient not found" });
      return;
    }

    if (recipient.friends.includes(myId)) {
      res
        .status(400)
        .json({ messaeg: "You are already friends with this user" });
      return;
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
      return;
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error: any) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: requestId } = req.params;
    const currentUserId = req.user.id;

    // Validate request ID format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      res.status(400).json({ message: "Invalid friend request ID format" });
      return;
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== currentUserId) {
      res.status(403).json({ 
        message: "You are not authorized to accept this request" 
      });
      return;
    }

    // Check if request is already accepted
    if (friendRequest.status === "accepted") {
      res.status(400).json({ 
        message: "Friend request was already accepted" 
      });
      return;
    }

    // Update friend request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Update both users' friend lists in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await User.findByIdAndUpdate(
        friendRequest.sender,
        { $addToSet: { friends: friendRequest.recipient } },
        { session }
      );

      await User.findByIdAndUpdate(
        friendRequest.recipient,
        { $addToSet: { friends: friendRequest.sender } },
        { session }
      );

      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    res.status(200).json({ 
      message: "Friend request accepted",
      updatedRequest: friendRequest 
    });

  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      message: "Failed to accept friend request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFriendRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReq = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profielPic");

    res.status(200).json({ incomingReqs, acceptedReq });
  } catch (error) {
    console.error("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOutgoingFriendReqs = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profielPic nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

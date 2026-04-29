import express from "express";
import { protectedRoute } from "../middleware/authMiddleware";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../controllers/userController";

const router = express.Router();

router.get("/me", protectedRoute, getRecommendedUsers);
router.get("/friends", protectedRoute, getMyFriends);
router.post("/friend-requests/:id", protectedRoute, sendFriendRequest);
router.put("/friend-request/:id/accept", protectedRoute, acceptFriendRequest);
router.get("/friend-requests", protectedRoute, getFriendRequests);
router.get("/outgoing-friend-requests", protectedRoute, getOutgoingFriendReqs);

export default router;

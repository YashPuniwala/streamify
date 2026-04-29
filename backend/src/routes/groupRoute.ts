import express from "express";
import {
  createGroup,
  getGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
  getGroupMessages,
  markMessageAsRead,
  deleteGroup,
  updateGroup,
  sendGroupInvitation,
  acceptGroupInvitation
} from "../controllers/groupController";
import { protectedRoute } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create-group", protectedRoute, createGroup);
router.get("/", protectedRoute, getGroups);
router.get("/:groupId", protectedRoute, getGroupDetails);
router.put("/:groupId", protectedRoute, updateGroup);
router.delete("/:groupId", protectedRoute, deleteGroup);

// Group membership
router.post("/:groupId/join", protectedRoute, joinGroup);
router.post("/:groupId/leave", protectedRoute, leaveGroup);

// Group messages
router.post("/:groupId/messages", protectedRoute, sendGroupMessage);
router.get("/:groupId/messages", protectedRoute, getGroupMessages);
router.put("/messages/:messageId/read", protectedRoute, markMessageAsRead);

router.post("/:groupId/invite", protectedRoute, sendGroupInvitation);
router.post("/:groupId/accept-invite", protectedRoute, acceptGroupInvitation);

export default router;
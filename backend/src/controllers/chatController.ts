import { Response } from "express";
import { generateStreamToken } from "../lib/stream";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getStreamToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in getStreamToken controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

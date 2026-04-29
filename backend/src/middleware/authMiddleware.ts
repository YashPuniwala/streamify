import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UserSchema } from "../models/authModel";

export interface AuthenticatedRequest extends Request {
  user?: UserSchema;
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const protectedRoute = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;

    if (!decoded?.userId) {
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "Unauthorized - User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectedRoute middleware", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

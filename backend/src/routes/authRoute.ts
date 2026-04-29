import { AuthenticatedRequest, protectedRoute } from "../middleware/authMiddleware";
import { login, logout, onboarding, signup } from "../controllers/authController";
import express, { Request, Response } from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectedRoute, onboarding);

router.get("/me", protectedRoute, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({success: true, user: req?.user})
})

export default router;

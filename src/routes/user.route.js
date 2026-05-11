import express from "express";
import { updateUserProfile, getMe } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/users/me – fetch authenticated user's profile
router.get("/me", verifyToken, getMe);

// PATCH /api/users/update  – partial profile update (student or organisation)
router.patch("/update", verifyToken, updateUserProfile);

export default router;

import express from "express";
import { updateUserProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// PATCH /api/users/update  – partial profile update (student or organisation)
router.patch("/update", verifyToken, updateUserProfile);

export default router;

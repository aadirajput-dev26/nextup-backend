import express from "express";
import { list, updateReadStatus, stream } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// SSE stream must be authenticated too.
router.get("/stream", verifyToken, stream);

// Standard API routes
router.get("/", verifyToken, list);
router.patch("/:id", verifyToken, updateReadStatus);

export default router;

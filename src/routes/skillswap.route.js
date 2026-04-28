import express from "express";
import { create, getAll, getOne, update, remove, accept, complete } from "../controllers/skillswap.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAll);
router.get("/:id", getOne);

// Authenticated – students only
router.post("/", verifyToken, requireRole("student"), create);
router.patch("/:id", verifyToken, requireRole("student"), update);
router.delete("/:id", verifyToken, requireRole("student"), remove);
router.post("/:id/accept", verifyToken, requireRole("student"), accept);
router.post("/:id/complete", verifyToken, requireRole("student"), complete);

export default router;

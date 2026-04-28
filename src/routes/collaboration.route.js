import express from "express";
import { create, getAll, getOne, update, remove, join } from "../controllers/collaboration.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes – no auth needed to browse collaborations
router.get("/", getAll);
router.get("/:id", getOne);

// Authenticated routes
router.post("/", verifyToken, requireRole("student"), create);          // students only
router.patch("/:id", verifyToken, requireRole("student"), update);      // only owner (checked in service)
router.delete("/:id", verifyToken, requireRole("student"), remove);     // only owner (checked in service)
router.post("/:id/join", verifyToken, requireRole("student"), join);    // students only

export default router;

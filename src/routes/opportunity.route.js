import express from "express";
import { create, getAll, getOne, update, remove, apply, getApplicants } from "../controllers/opportunity.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes – no auth needed to browse opportunities
router.get("/", getAll);
router.get("/:id", getOne);

// Authenticated routes
router.post("/", verifyToken, create);                                     // both roles can post
router.patch("/:id", verifyToken, update);                                 // only owner (checked in service)
router.delete("/:id", verifyToken, remove);                                // only owner (checked in service)
router.post("/:id/apply", verifyToken, requireRole("student"), apply);     // students only
router.get("/:id/applicants", verifyToken, requireRole("organisation"), getApplicants); // organisations only

export default router;

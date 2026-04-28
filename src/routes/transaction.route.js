import express from "express";
import { getMyTransactions } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/transactions – authenticated, both roles
router.get("/", verifyToken, getMyTransactions);

// POST is deliberately absent – transaction creation is service-internal only.
// No client should ever be able to fabricate a transaction directly.

export default router;

import express from "express";
import { request, accept, reject, list } from "../controllers/connection.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All connection routes require authentication
router.use(verifyToken);

router.post("/request", request);          // send a request
router.post("/:id/accept", accept);        // recipient accepts
router.post("/:id/reject", reject);        // recipient rejects
router.get("/", list);                     // list my accepted connections

export default router;

import express from "express";
import passport from "../config/passport.js";
import { signup, login, oauthCallback } from "../controllers/auth.controller.js";
import { logout } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Email / Password

// POST /auth/signup  – { email, password, role }
router.post("/signup", signup);

// POST /auth/login   – { email, password }
router.post("/login", login);

// POST /auth/logout  – requires valid JWT in Authorization header
router.post("/logout", verifyToken, logout);

// Google OAuth
// Pass role in the state param:
// GET /auth/google?role=student   or  ?role=organisation
router.get("/google", (req, res, next) => {
  const role = req.query.role || "student";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role, // forwarded through OAuth flow and read in strategy
    session: false,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: false,
  }),
  oauthCallback
);

// GitHub OAuth
// GET /auth/github?role=student   or  ?role=organisation
router.get("/github", (req, res, next) => {
  const role = req.query.role || "student";
  passport.authenticate("github", {
    scope: ["user:email"],
    state: role,
    session: false,
  })(req, res, next);
});

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/failure",
    session: false,
  }),
  oauthCallback
);

// Generic failure endpoint
router.get("/failure", (req, res) => {
  res.status(401).json({ message: "OAuth authentication failed" });
});

export default router;

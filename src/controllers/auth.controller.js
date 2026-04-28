import { createLocalUser, authenticateLocalUser } from "../services/auth.service.js";
import { issueToken, publicUser } from "../utils/jwt.js";

// POST /auth/signup
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ── Validation ──
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "email, password, and role are required" });
    }
    if (!["student", "organisation"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be 'student' or 'organisation'" });
    }

    const user = await createLocalUser({ email, password, role });
    const token = issueToken(user);

    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("[signup]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await authenticateLocalUser({ email, password });
    const token = issueToken(user);

    return res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("[login]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// OAuth callback (shared by Google & GitHub)
// Called after Passport attaches req.user
export const oauthCallback = (req, res) => {
  try {
    const user = req.user; // set by Passport
    if (!user) {
      return res.status(401).json({ message: "OAuth authentication failed" });
    }

    const token = issueToken(user);

    // Return as JSON – the client reads this from the redirect response
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[oauthCallback]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------------------------------------
//  POST /auth/logout – stateless logout (client deletes token)
// ------------------------------------------------------------------
export const logout = (_req, res) => {
  return res.status(200).json({
    message: "Logged out successfully",
    instruction: "Delete the token from client storage to complete logout."
  });
};

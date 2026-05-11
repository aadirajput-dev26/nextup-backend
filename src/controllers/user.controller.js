import { updateProfile, getProfileByUserId } from "../services/user.service.js";
import User from "../models/user.model.js";

// GET /api/users/me
// Returns the authenticated user's auth data + role-specific profile
export const getMe = async (req, res) => {
  try {
    const { id } = req.user; // from JWT payload
    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await getProfileByUserId(id);

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
      profile,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("[getMe]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/users/update
// Requires: verifyToken middleware (injects req.user)
export const updateUserProfile = async (req, res) => {
  try {
    const { id, role } = req.user; // from JWT payload
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedProfile = await updateProfile({ userId: id, role, updates });

    return res.status(200).json({ user: updatedProfile });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("[updateUserProfile]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

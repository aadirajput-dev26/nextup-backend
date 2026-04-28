import { updateProfile } from "../services/user.service.js";

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

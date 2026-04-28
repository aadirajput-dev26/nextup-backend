import Student from "../models/student.model.js";
import Organisation from "../models/organisation.model.js";
import User from "../models/user.model.js";

// Fields that must never be updated via the public PATCH endpoint
const STUDENT_PROTECTED = ["email", "password", "_id", "__v", "coin_balance", "connections", "badges", "posted_opportunities", "collaborations", "skillswapRequests", "transactions"];
const ORG_PROTECTED     = ["email", "password", "_id", "__v", "posted_opportunities"];

// Strips protected fields from an update payload.
const sanitize = (body, protectedFields) => {
  const update = { ...body };
  protectedFields.forEach((f) => delete update[f]);
  return update;
};

// Fetches the role-specific profile document linked to a User.
// Returns the profile without the password field.
export const getProfileByUserId = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const Model = user.role === "organisation" ? Organisation : Student;
  const profile = await Model.findById(user.profileRef).select("-password").lean();

  if (!profile) {
    const err = new Error("Profile not found");
    err.status = 404;
    throw err;
  }

  return profile;
};

// Applies a partial update to the role-specific profile document.
// Returns the updated document (password excluded).
export const updateProfile = async ({ userId, role, updates }) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  let sanitized;

  if (role === "organisation") {
    sanitized = sanitize(updates, ORG_PROTECTED);
    const updated = await Organisation
      .findByIdAndUpdate(
        user.profileRef,
        { $set: sanitized },
        { new: true, runValidators: true }
      )
      .select("-password")
      .lean();

    if (!updated) {
      const err = new Error("Organisation profile not found");
      err.status = 404;
      throw err;
    }

    return updated;
  }

  // ── Student ──
  sanitized = sanitize(updates, STUDENT_PROTECTED);
  const updated = await Student
    .findByIdAndUpdate(
      user.profileRef,
      { $set: sanitized },
      { new: true, runValidators: true }
    )
    .select("-password")
    .lean();

  if (!updated) {
    const err = new Error("Student profile not found");
    err.status = 404;
    throw err;
  }

  return updated;
};

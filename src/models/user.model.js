import mongoose from "mongoose";

// Unified auth-level user document.
// Stores only credentials + role; rich profile data lives in
// the Student or Organisation collection and is referenced via profileRef.
const user_schema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Null for OAuth users (no password)
    passwordHash: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["student", "organisation"],
      required: true,
    },

    // OAuth provider details  ("local" for email/password)
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    // ID returned by the OAuth provider (null for local users)
    providerId: {
      type: String,
      default: null,
    },

    // Ref to the Student or Organisation document that holds the full profile
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "profileModel",
    },

    profileModel: {
      type: String,
      enum: ["Student", "Organisation"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", user_schema);
export default User;

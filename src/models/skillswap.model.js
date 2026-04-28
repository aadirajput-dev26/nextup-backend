import mongoose from "mongoose";

const skillswap_schema = mongoose.Schema(
  {
    // ── Mode ──────────────────────────────────────────────────────────
    // "coin"  → requester pays accepter in coins
    // "skill" → pure skill-for-skill barter, no coin transfer
    mode: {
      type: String,
      enum: ["coin", "skill"],
      required: true,
    },

    // ── Common fields ─────────────────────────────────────────────────
    skillName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    // ── Coin mode only ────────────────────────────────────────────────
    coinCost: {
      type: Number,
      min: 0,
      default: null,   // null means "not applicable"
    },

    // ── Skill-for-skill mode only ─────────────────────────────────────
    skillOffered: {
      type: String,    // what the requester is offering to teach/share
      default: null,
    },
    skillRequested: {
      type: String,    // what the requester wants to learn/receive
      default: null,
    },

    // ── Creator – always a student ────────────────────────────────────
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      role: {
        type: String,
        default: "student",
      },
    },

    // ── Student who accepted the swap ─────────────────────────────────
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // ── Lifecycle ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["open", "accepted", "completed"],
      default: "open",
    },

    // ── Post-completion feedback (optional) ───────────────────────────
    feedback: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

const Skillswap = mongoose.model("Skillswap", skillswap_schema);
export default Skillswap;

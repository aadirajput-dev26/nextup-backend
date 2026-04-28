import mongoose from "mongoose";

const collaboration_schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    requiredSkills: {
      type: [String],
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Student",
      },
      role: {
        type: String,
        default: "student",
      },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Collaboration = mongoose.model("Collaboration", collaboration_schema);
export default Collaboration;
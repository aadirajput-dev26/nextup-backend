import mongoose from "mongoose";

const opportunity_schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["internship", "scholarship", "event"],
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    location: {
      type: String,
    },
    tags: {
      type: [String],
    },

    // Unified postedBy – works for both student and organisation
    postedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "postedBy.role", // dynamic reference
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"], // capitalised to match model names
        required: true,
      },
    },

    // Only students can be applicants
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    apply_link: {
      type: String,
    },
  },
  { timestamps: true }
);

const Opportunity = mongoose.model("Opportunity", opportunity_schema);
export default Opportunity;

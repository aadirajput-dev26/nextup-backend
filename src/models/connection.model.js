import mongoose from "mongoose";

const connection_schema = mongoose.Schema(
  {
    from: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "from.role",
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"],
        required: true,
      },
    },
    to: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "to.role",
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound index – ensures only one connection record exists between any pair
connection_schema.index({ "from.id": 1, "to.id": 1 }, { unique: true });

const Connection = mongoose.model("Connection", connection_schema);
export default Connection;

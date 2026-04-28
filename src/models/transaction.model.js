import mongoose from "mongoose";

const transaction_schema = mongoose.Schema(
  {
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "sender.role",
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"],
        required: true,
      },
    },
    receiver: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "receiver.role",
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"],
        required: true,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ["skillswap", "reward", "purchase"],
      required: true,
    },
    // Optional back-reference to the originating document
    relatedSkillswap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skillswap",
      default: null,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transaction_schema);
export default Transaction;

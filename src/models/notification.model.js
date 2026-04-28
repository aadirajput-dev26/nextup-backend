import mongoose from "mongoose";

const notification_schema = mongoose.Schema(
  {
    recipient: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "recipient.role",
      },
      role: {
        type: String,
        enum: ["Student", "Organisation"],
        required: true,
      },
    },
    type: {
      type: String,
      enum: ["connection", "opportunity", "skillswap", "collaboration", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // We don't use ref here because it could point to 4 different collections.
      // It's up to the client to use the `type` field to know what this ID belongs to.
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notification_schema);
export default Notification;

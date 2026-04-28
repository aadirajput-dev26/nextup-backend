import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";

import { createNotification } from "./notification.service.js";

// Helpers

// Returns { profileId, role } for the auth User doc.
// role is lowercase ("student" / "organisation") from the User doc.
const getProfileRef = async (userId) => {
  const user = await User.findById(userId).select("profileRef role").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return { profileId: user.profileRef, role: user.role };
};

// Capitalises the first letter so it matches the Mongoose model name
// used in refPath: "Student" | "Organisation"
const toModelName = (role) =>
  role.charAt(0).toUpperCase() + role.slice(1);

// sendConnectionRequest
export const sendConnectionRequest = async ({ fromUserId, toUserId }) => {
  const { profileId: fromProfileId, role: fromRole } = await getProfileRef(fromUserId);

  // Resolve the target user (toUserId is the User doc id)
  const toUser = await User.findById(toUserId).select("profileRef role").lean();
  if (!toUser) {
    const err = new Error("Target user not found");
    err.status = 404;
    throw err;
  }
  const toProfileId = toUser.profileRef;
  const toRole = toUser.role;

  // ── Role restriction: organisations cannot send to students ──────────
  if (fromRole === "organisation" && toRole === "student") {
    const err = new Error("Organisations cannot send connection requests to students");
    err.status = 403;
    throw err;
  }

  // ── Cannot request yourself ──────────────────────────────────────────
  if (fromProfileId.toString() === toProfileId.toString()) {
    const err = new Error("You cannot send a connection request to yourself");
    err.status = 400;
    throw err;
  }

  // ── Check for existing connection in either direction ────────────────
  const existing = await Connection.findOne({
    $or: [
      { "from.id": fromProfileId, "to.id": toProfileId },
      { "from.id": toProfileId, "to.id": fromProfileId },
    ],
  });
  if (existing) {
    const err = new Error(
      existing.status === "rejected"
        ? "A previous connection request was rejected"
        : "A connection request already exists between these users"
    );
    err.status = 409;
    throw err;
  }

  const connection = await Connection.create({
    from: { id: fromProfileId, role: toModelName(fromRole) },
    to: { id: toProfileId, role: toModelName(toRole) },
    status: "pending",
  });

  // Notify recipient
  await createNotification({
    recipientId: toProfileId,
    recipientRole: toModelName(toRole),
    type: "connection",
    message: `You have a new connection request.`,
    relatedId: connection._id,
  }).catch((err) => console.error("Failed to notify:", err));

  return connection;
};

// respondToRequest (accept or reject)
export const respondToRequest = async ({ connectionId, userId, action }) => {
  const { profileId } = await getProfileRef(userId);

  const connection = await Connection.findById(connectionId);
  if (!connection) {
    const err = new Error("Connection request not found");
    err.status = 404;
    throw err;
  }

  // Only the recipient can accept/reject
  if (connection.to.id.toString() !== profileId.toString()) {
    const err = new Error("Only the recipient can accept or reject this request");
    err.status = 403;
    throw err;
  }

  if (connection.status !== "pending") {
    const err = new Error(`Connection request has already been ${connection.status}`);
    err.status = 400;
    throw err;
  }

  connection.status = action; // "accepted" | "rejected"
  await connection.save();

  // Notify the original requester
  await createNotification({
    recipientId: connection.from.id,
    recipientRole: connection.from.role,
    type: "connection",
    message: `Your connection request was ${action}.`,
    relatedId: connection._id,
  }).catch((err) => console.error("Failed to notify:", err));

  return connection;
};

// getMyConnections
export const getMyConnections = async (userId) => {
  const { profileId } = await getProfileRef(userId);

  const connections = await Connection.find({
    status: "accepted",
    $or: [{ "from.id": profileId }, { "to.id": profileId }],
  })
    .populate("from.id", "-password -passwordHash")
    .populate("to.id", "-password -passwordHash")
    .sort({ updatedAt: -1 })
    .lean();

  return connections;
};

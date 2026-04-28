import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// SSE Registry
// Map to store active SSE connections. Key: User Profile ObjectId (string), Value: Express response object.
const sseClients = new Map();

// Helper to fetch the profileId (Student/Organisation doc ID) for a user
const getProfileRef = async (userId) => {
  const user = await User.findById(userId).select("profileRef role").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return { profileId: user.profileRef, role: user.role };
};

// Dispatches an SSE event to a specific user if they are connected.
const dispatchEvent = (profileIdStr, eventName, data) => {
  const res = sseClients.get(profileIdStr);
  if (res) {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

// SSE Connection Management
export const setupSSEStream = async (userId, res) => {
  const { profileId } = await getProfileRef(userId);
  const profileIdStr = profileId.toString();

  // 1. Setup headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // 2. Add to registry
  sseClients.set(profileIdStr, res);

  // 3. Keep connection alive with a 30s heartbeat
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, 30000);

  // 4. Handle client disconnect
  res.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(profileIdStr);
  });
};

// Notification Logic

// Internal method to create and dispatch a notification.
// @param {string} recipientId - Profile ObjectId of the recipient
// @param {string} recipientRole - "Student" or "Organisation"
// @param {string} type - "connection", "opportunity", "skillswap", "collaboration"
// @param {string} message - Human readable message
// @param {string} relatedId - The ID of the related entity
export const createNotification = async ({ recipientId, recipientRole, type, message, relatedId }) => {
  // 1. Save to DB
  const notification = await Notification.create({
    recipient: {
      id: recipientId,
      role: recipientRole,
    },
    type,
    message,
    relatedId,
  });

  // 2. Dispatch via SSE in real-time
  dispatchEvent(recipientId.toString(), "notification", {
    message: notification.message,
    type: notification.type,
    relatedId: notification.relatedId,
    createdAt: notification.createdAt,
  });

  return notification;
};

// Batch Creation Helper
// Creates multiple notifications efficiently and dispatches them via SSE.
export const createBatchNotifications = async (notificationsData) => {
  if (!notificationsData || notificationsData.length === 0) return;

  // 1. Insert in bulk
  const notifications = await Notification.insertMany(notificationsData);

  // 2. Dispatch individually to connected clients
  notifications.forEach((notif) => {
    dispatchEvent(notif.recipient.id.toString(), "notification", {
      message: notif.message,
      type: notif.type,
      relatedId: notif.relatedId,
      createdAt: notif.createdAt,
    });
  });

  return notifications;
};

// List My Notifications
export const listMyNotifications = async (userId) => {
  const { profileId } = await getProfileRef(userId);

  return Notification.find({ "recipient.id": profileId })
    .sort({ createdAt: -1 })
    .lean();
};

// Mark as Read
export const markAsRead = async (notificationId, userId) => {
  const { profileId } = await getProfileRef(userId);

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const err = new Error("Notification not found");
    err.status = 404;
    throw err;
  }

  if (notification.recipient.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to update this notification");
    err.status = 403;
    throw err;
  }

  notification.status = "read";
  await notification.save();

  return notification;
};

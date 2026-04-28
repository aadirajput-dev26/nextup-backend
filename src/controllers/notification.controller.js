import {
  listMyNotifications,
  markAsRead,
  setupSSEStream,
} from "../services/notification.service.js";

// GET /api/notifications
export const list = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const notifications = await listMyNotifications(userId);
    return res.status(200).json({ notifications });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[list notifications]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/notifications/:id
export const updateReadStatus = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await markAsRead(req.params.id, userId);
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[mark notification read]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/notifications/stream
// Establishes the SSE connection. Keeps it open indefinitely.
export const stream = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await setupSSEStream(userId, res);
    
    // Do NOT call res.end() or res.json(). We must leave the connection open.
    // The heartbeat in setupSSEStream will keep it alive.
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[stream notifications]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

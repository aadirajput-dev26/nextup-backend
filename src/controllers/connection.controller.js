import {
  sendConnectionRequest,
  respondToRequest,
  getMyConnections,
} from "../services/connection.service.js";

// POST /api/connections/request
export const request = async (req, res) => {
  try {
    const { id: fromUserId } = req.user;
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({ message: "toUserId is required" });
    }

    const connection = await sendConnectionRequest({ fromUserId, toUserId });
    return res.status(201).json({ connection });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[connection request]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/connections/:id/accept
export const accept = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await respondToRequest({ connectionId: req.params.id, userId, action: "accepted" });
    return res.status(200).json({ message: "Connection accepted" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[connection accept]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/connections/:id/reject
export const reject = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await respondToRequest({ connectionId: req.params.id, userId, action: "rejected" });
    return res.status(200).json({ message: "Connection rejected" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[connection reject]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/connections
export const list = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const connections = await getMyConnections(userId);
    return res.status(200).json({ connections });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[connection list]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

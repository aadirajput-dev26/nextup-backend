import {
  createCollaboration,
  getAllCollaborations,
  getCollaborationById,
  updateCollaboration,
  deleteCollaboration,
  joinCollaboration,
} from "../services/collaboration.service.js";

// POST /api/collaborations
export const create = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const collaboration = await createCollaboration({ userId, fields: req.body });
    return res.status(201).json({ collaboration });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[create collaboration]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/collaborations
export const getAll = async (_req, res) => {
  try {
    const collaborations = await getAllCollaborations();
    return res.status(200).json({ collaborations });
  } catch (err) {
    console.error("[getAll collaborations]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/collaborations/:id
export const getOne = async (req, res) => {
  try {
    const collaboration = await getCollaborationById(req.params.id);
    return res.status(200).json({ collaboration });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[getOne collaboration]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/collaborations/:id
export const update = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const collaboration = await updateCollaboration({
      collaborationId: req.params.id,
      userId,
      updates: req.body,
    });
    return res.status(200).json({ collaboration });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[update collaboration]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/collaborations/:id
export const remove = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await deleteCollaboration({ collaborationId: req.params.id, userId });
    return res.status(200).json({ message: "Collaboration deleted" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[delete collaboration]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/collaborations/:id/join
export const join = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await joinCollaboration({ collaborationId: req.params.id, userId });
    return res.status(200).json({ message: "Joined successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[join collaboration]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

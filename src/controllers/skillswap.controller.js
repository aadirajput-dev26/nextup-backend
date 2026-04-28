import {
  createSkillswap,
  getAllSkillswaps,
  getSkillswapById,
  updateSkillswap,
  deleteSkillswap,
  acceptSkillswap,
  completeSkillswap,
} from "../services/skillswap.service.js";

// POST /api/skillswap
export const create = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const skillswap = await createSkillswap({ userId, fields: req.body });
    return res.status(201).json({ skillswap });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[create skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/skillswap
export const getAll = async (_req, res) => {
  try {
    const skillswaps = await getAllSkillswaps();
    return res.status(200).json({ skillswaps });
  } catch (err) {
    console.error("[getAll skillswaps]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/skillswap/:id
export const getOne = async (req, res) => {
  try {
    const skillswap = await getSkillswapById(req.params.id);
    return res.status(200).json({ skillswap });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[getOne skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/skillswap/:id
export const update = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const skillswap = await updateSkillswap({
      skillswapId: req.params.id,
      userId,
      updates: req.body,
    });
    return res.status(200).json({ skillswap });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[update skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/skillswap/:id
export const remove = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await deleteSkillswap({ skillswapId: req.params.id, userId });
    return res.status(200).json({ message: "Skillswap request deleted" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[delete skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/skillswap/:id/accept
export const accept = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const skillswap = await acceptSkillswap({ skillswapId: req.params.id, userId });
    return res.status(200).json({ message: "Skillswap accepted successfully", skillswap });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[accept skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/skillswap/:id/complete
export const complete = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { feedback, rating } = req.body;
    const skillswap = await completeSkillswap({
      skillswapId: req.params.id,
      userId,
      feedback,
      rating,
    });
    return res.status(200).json({ message: "Skillswap marked as completed", skillswap });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[complete skillswap]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

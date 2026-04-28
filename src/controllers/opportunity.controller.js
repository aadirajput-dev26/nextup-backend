import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getApplicantsForOpportunity,
} from "../services/opportunity.service.js";

// POST /api/opportunities
export const create = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const opportunity = await createOpportunity({ userId, fields: req.body });
    return res.status(201).json({ opportunity });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[create opportunity]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/opportunities
export const getAll = async (_req, res) => {
  try {
    const opportunities = await getAllOpportunities();
    return res.status(200).json({ opportunities });
  } catch (err) {
    console.error("[getAll opportunities]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/opportunities/:id
export const getOne = async (req, res) => {
  try {
    const opportunity = await getOpportunityById(req.params.id);
    return res.status(200).json({ opportunity });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[getOne opportunity]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/opportunities/:id
export const update = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const opportunity = await updateOpportunity({
      opportunityId: req.params.id,
      userId,
      updates: req.body,
    });
    return res.status(200).json({ opportunity });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[update opportunity]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/opportunities/:id
export const remove = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await deleteOpportunity({ opportunityId: req.params.id, userId });
    return res.status(200).json({ message: "Opportunity deleted" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[delete opportunity]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/opportunities/:id/apply
export const apply = async (req, res) => {
  try {
    const { id: userId } = req.user;
    await applyToOpportunity({ opportunityId: req.params.id, userId });
    return res.status(200).json({ message: "Applied successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[apply opportunity]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/opportunities/:id/applicants
export const getApplicants = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const applicants = await getApplicantsForOpportunity({
      opportunityId: req.params.id,
      userId,
    });
    return res.status(200).json({ applicants });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[get applicants]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

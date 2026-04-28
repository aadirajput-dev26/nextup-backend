import { listTransactions } from "../services/transaction.service.js";

// GET /api/transactions
// Returns transactions where the authenticated user is sender or
// receiver. POST is intentionally absent – creation is service-only.
export const getMyTransactions = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const transactions = await listTransactions(userId);
    return res.status(200).json({ transactions });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("[getMyTransactions]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

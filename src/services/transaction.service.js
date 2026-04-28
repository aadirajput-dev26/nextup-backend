import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

// Helpers
const getProfileRef = async (userId) => {
  const user = await User.findById(userId).select("profileRef role").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return { profileId: user.profileRef, role: user.role };
};

// createTransaction  (internal – called only by other services)
// Payload: { senderId, senderRole, receiverId, receiverRole,
// amount, reason, relatedSkillswap? }
export const createTransaction = async ({
  senderId,
  senderRole,
  receiverId,
  receiverRole,
  amount,
  reason,
  relatedSkillswap = null,
}) => {
  const transaction = await Transaction.create({
    sender: {
      id: senderId,
      role: senderRole, // "Student" | "Organisation"
    },
    receiver: {
      id: receiverId,
      role: receiverRole,
    },
    amount,
    reason,
    relatedSkillswap,
  });

  return transaction;
};

// listTransactions  (used by GET /api/transactions)
// Returns all transactions where the caller is sender OR receiver.
export const listTransactions = async (userId) => {
  const { profileId } = await getProfileRef(userId);

  const transactions = await Transaction.find({
    $or: [{ "sender.id": profileId }, { "receiver.id": profileId }],
  })
    .populate("sender.id", "-password -passwordHash")
    .populate("receiver.id", "-password -passwordHash")
    .populate("relatedSkillswap", "skillName mode status")
    .sort({ createdAt: -1 })
    .lean();

  return transactions;
};

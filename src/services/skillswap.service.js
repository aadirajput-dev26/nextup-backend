import Skillswap from "../models/skillswap.model.js";
import Student from "../models/student.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

// Helpers

// These fields can never be patched by clients
const PROTECTED = ["createdBy", "acceptedBy", "status", "coinCost", "mode", "_id", "__v"];

const sanitize = (body) => {
  const update = { ...body };
  PROTECTED.forEach((f) => delete update[f]);
  return update;
};

const getProfileRef = async (userId) => {
  const user = await User.findById(userId).select("profileRef role").lean();
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return { profileId: user.profileRef, role: user.role };
};

import Connection from "../models/connection.model.js";
import { createBatchNotifications, createNotification } from "./notification.service.js";

// createSkillswap
export const createSkillswap = async ({ userId, fields }) => {
  const { profileId, role } = await getProfileRef(userId);

  if (role !== "student") {
    const err = new Error("Only students can create skillswap requests");
    err.status = 403;
    throw err;
  }

  const { mode, skillRequested } = fields;

  // Validate mode-specific required fields
  if (mode === "coin") {
    if (fields.coinCost === undefined || fields.coinCost === null) {
      const err = new Error("coinCost is required for coin-based skillswap");
      err.status = 400;
      throw err;
    }
  } else if (mode === "skill") {
    if (!fields.skillOffered || !fields.skillRequested) {
      const err = new Error("skillOffered and skillRequested are required for skill-for-skill swap");
      err.status = 400;
      throw err;
    }
  } else {
    const err = new Error("mode must be either 'coin' or 'skill'");
    err.status = 400;
    throw err;
  }

  const skillswap = await Skillswap.create({
    ...fields,
    createdBy: { id: profileId, role: "student" },
    status: "open",
  });

  // 1. Notify all followers (accepted connections)
  try {
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ "from.id": profileId }, { "to.id": profileId }],
    }).lean();

    const notificationsData = connections.map((conn) => {
      const isFrom = conn.from.id.toString() === profileId.toString();
      const recipient = isFrom ? conn.to : conn.from;

      return {
        recipient: { id: recipient.id, role: recipient.role },
        type: "skillswap",
        message: `A new skillswap request "${skillswap.skillName}" was posted by one of your connections.`,
        relatedId: skillswap._id,
      };
    });

    if (notificationsData.length > 0) {
      await createBatchNotifications(notificationsData);
    }
  } catch (err) {
    console.error("Failed to notify followers about new skillswap:", err);
  }

  // 2. Notify users with matching skills (up to 50)
  if (mode === "skill" && skillRequested) {
    try {
      const matchingStudents = await Student.find({
        skills: { $in: [skillRequested] },
        _id: { $ne: profileId }, // Exclude the creator
      })
        .limit(50)
        .select("_id")
        .lean();

      const skillNotificationsData = matchingStudents.map((student) => ({
        recipient: { id: student._id, role: "Student" },
        type: "skillswap",
        message: `A new skillswap request matches your skillset: "${skillswap.skillName}"`,
        relatedId: skillswap._id,
      }));

      if (skillNotificationsData.length > 0) {
        await createBatchNotifications(skillNotificationsData);
      }
    } catch (err) {
      console.error("Failed to notify matching students about new skillswap:", err);
    }
  }

  return skillswap;
};

// getAllSkillswaps
export const getAllSkillswaps = async () => {
  return Skillswap.find()
    .populate("createdBy.id", "-password -passwordHash")
    .populate("acceptedBy", "-password -passwordHash")
    .sort({ createdAt: -1 })
    .lean();
};

// getSkillswapById
export const getSkillswapById = async (skillswapId) => {
  const skillswap = await Skillswap.findById(skillswapId)
    .populate("createdBy.id", "-password -passwordHash")
    .populate("acceptedBy", "-password -passwordHash")
    .lean();

  if (!skillswap) {
    const err = new Error("Skillswap request not found");
    err.status = 404;
    throw err;
  }

  return skillswap;
};

// updateSkillswap
export const updateSkillswap = async ({ skillswapId, userId, updates }) => {
  const { profileId } = await getProfileRef(userId);

  const skillswap = await Skillswap.findById(skillswapId);
  if (!skillswap) {
    const err = new Error("Skillswap request not found");
    err.status = 404;
    throw err;
  }

  if (skillswap.createdBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to update this skillswap request");
    err.status = 403;
    throw err;
  }

  if (skillswap.status !== "open") {
    const err = new Error("Cannot update a skillswap request that is already accepted");
    err.status = 400;
    throw err;
  }

  const sanitized = sanitize(updates);
  Object.assign(skillswap, sanitized);
  await skillswap.save();

  return skillswap;
};

// deleteSkillswap
export const deleteSkillswap = async ({ skillswapId, userId }) => {
  const { profileId } = await getProfileRef(userId);

  const skillswap = await Skillswap.findById(skillswapId);
  if (!skillswap) {
    const err = new Error("Skillswap request not found");
    err.status = 404;
    throw err;
  }

  if (skillswap.createdBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to delete this skillswap request");
    err.status = 403;
    throw err;
  }

  await skillswap.deleteOne();
};

// acceptSkillswap
// Branches by mode:
// coin  → coin transfer A→B + transaction log
// skill → just mark accepted, no coin movement
export const acceptSkillswap = async ({ skillswapId, userId }) => {
  const { profileId, role } = await getProfileRef(userId);

  if (role !== "student") {
    const err = new Error("Only students can accept skillswap requests");
    err.status = 403;
    throw err;
  }

  const skillswap = await Skillswap.findById(skillswapId);
  if (!skillswap) {
    const err = new Error("Skillswap request not found");
    err.status = 404;
    throw err;
  }

  if (skillswap.status !== "open") {
    const err = new Error("This skillswap request has already been accepted");
    err.status = 409;
    throw err;
  }

  if (skillswap.createdBy.id.toString() === profileId.toString()) {
    const err = new Error("You cannot accept your own skillswap request");
    err.status = 400;
    throw err;
  }

  // ── Coin mode ────────────────────────────────────────────────────────
  if (skillswap.mode === "coin") {
    const requester = await Student.findById(skillswap.createdBy.id);
    if (!requester) {
      const err = new Error("Requester profile not found");
      err.status = 404;
      throw err;
    }

    if (requester.coin_balance < skillswap.coinCost) {
      const err = new Error("Requester does not have enough coins");
      err.status = 402;
      throw err;
    }

    const accepter = await Student.findById(profileId);
    if (!accepter) {
      const err = new Error("Your student profile was not found");
      err.status = 404;
      throw err;
    }

    // Coin transfer
    requester.coin_balance -= skillswap.coinCost;
    accepter.coin_balance += skillswap.coinCost;

    skillswap.acceptedBy = profileId;
    skillswap.status = "accepted";

    await Promise.all([requester.save(), accepter.save(), skillswap.save()]);

    // Log transaction
    const transaction = await Transaction.create({
      sender: { id: skillswap.createdBy.id, role: "Student" },
      receiver: { id: profileId, role: "Student" },
      amount: skillswap.coinCost,
      reason: "skillswap",
      relatedSkillswap: skillswap._id,
    });

    requester.transactions.push(transaction._id);
    accepter.transactions.push(transaction._id);
    await Promise.all([requester.save(), accepter.save()]);
  }

  // ── Skill-for-skill mode ─────────────────────────────────────────────
  if (skillswap.mode === "skill") {
    // No coin movement, just accept and let parties coordinate
    skillswap.acceptedBy = profileId;
    skillswap.status = "accepted";
    await skillswap.save();
  }

  // Notify requester
  await createNotification({
    recipientId: skillswap.createdBy.id,
    recipientRole: skillswap.createdBy.role,
    type: "skillswap",
    message: `Your skillswap request "${skillswap.skillName}" has been accepted.`,
    relatedId: skillswap._id,
  }).catch((err) => console.error("Failed to notify requester:", err));

  return skillswap;
};

// completeSkillswap
// Either party (creator or accepter) can mark it as completed.
// Optionally submit feedback + rating at the same time.
export const completeSkillswap = async ({ skillswapId, userId, feedback, rating }) => {
  const { profileId } = await getProfileRef(userId);

  const skillswap = await Skillswap.findById(skillswapId);
  if (!skillswap) {
    const err = new Error("Skillswap request not found");
    err.status = 404;
    throw err;
  }

  if (skillswap.status !== "accepted") {
    const err = new Error("Only an accepted skillswap can be marked as completed");
    err.status = 400;
    throw err;
  }

  // Only the creator or accepter can mark as complete
  const isCreator = skillswap.createdBy.id.toString() === profileId.toString();
  const isAccepter = skillswap.acceptedBy?.toString() === profileId.toString();

  if (!isCreator && !isAccepter) {
    const err = new Error("You are not a participant of this skillswap");
    err.status = 403;
    throw err;
  }

  skillswap.status = "completed";
  if (feedback !== undefined) skillswap.feedback = feedback;
  if (rating !== undefined) skillswap.rating = rating;
  await skillswap.save();

  return skillswap;
};

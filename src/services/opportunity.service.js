import Opportunity from "../models/opportunity.model.js";
import User from "../models/user.model.js";

// Helpers

// Protected fields that can never be patched by clients
const PROTECTED = ["postedBy", "applicants", "_id", "__v"];

const sanitize = (body) => {
  const update = { ...body };
  PROTECTED.forEach((f) => delete update[f]);
  return update;
};

// Resolves the profile ObjectId for the authenticated user.
// The JWT carries the User doc id, but opportunities need the
// Student/Organisation profileRef id for postedBy and population.
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
import { createBatchNotifications } from "./notification.service.js";

// createOpportunity
export const createOpportunity = async ({ userId, fields }) => {
  const { profileId, role } = await getProfileRef(userId);

  const postedByRole = role === "organisation" ? "Organisation" : "Student";

  const opportunity = await Opportunity.create({
    ...fields,
    postedBy: {
      id: profileId,
      // Capitalise to match Mongoose model names for refPath population
      role: postedByRole,
    },
  });

  // Notify all followers (accepted connections)
  try {
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ "from.id": profileId }, { "to.id": profileId }],
    }).lean();

    const notificationsData = connections.map((conn) => {
      // Find the "other" person in the connection
      const isFrom = conn.from.id.toString() === profileId.toString();
      const recipient = isFrom ? conn.to : conn.from;

      return {
        recipient: { id: recipient.id, role: recipient.role },
        type: "opportunity",
        message: `A new opportunity "${opportunity.title}" was posted by one of your connections.`,
        relatedId: opportunity._id,
      };
    });

    if (notificationsData.length > 0) {
      await createBatchNotifications(notificationsData);
    }
  } catch (err) {
    console.error("Failed to notify followers about new opportunity:", err);
  }

  return opportunity;
};

// getAllOpportunities
export const getAllOpportunities = async () => {
  return Opportunity.find()
    .populate("postedBy.id", "-password -passwordHash")
    .sort({ createdAt: -1 })
    .lean();
};

// getOpportunityById
export const getOpportunityById = async (opportunityId) => {
  const opportunity = await Opportunity.findById(opportunityId)
    .populate("postedBy.id", "-password -passwordHash")
    .populate("applicants", "email location skills")
    .lean();

  if (!opportunity) {
    const err = new Error("Opportunity not found");
    err.status = 404;
    throw err;
  }

  return opportunity;
};

// updateOpportunity
export const updateOpportunity = async ({ opportunityId, userId, updates }) => {
  const { profileId } = await getProfileRef(userId);

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    const err = new Error("Opportunity not found");
    err.status = 404;
    throw err;
  }

  // Ownership check – compare profileRef ids
  if (opportunity.postedBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to update this opportunity");
    err.status = 403;
    throw err;
  }

  const sanitized = sanitize(updates);
  Object.assign(opportunity, sanitized);
  await opportunity.save();

  return opportunity;
};

// deleteOpportunity
export const deleteOpportunity = async ({ opportunityId, userId }) => {
  const { profileId } = await getProfileRef(userId);

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    const err = new Error("Opportunity not found");
    err.status = 404;
    throw err;
  }

  if (opportunity.postedBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to delete this opportunity");
    err.status = 403;
    throw err;
  }

  await opportunity.deleteOne();
};

// applyToOpportunity
export const applyToOpportunity = async ({ opportunityId, userId }) => {
  const { profileId } = await getProfileRef(userId);

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    const err = new Error("Opportunity not found");
    err.status = 404;
    throw err;
  }

  // Prevent duplicate application
  const alreadyApplied = opportunity.applicants.some(
    (a) => a.toString() === profileId.toString()
  );
  if (alreadyApplied) {
    const err = new Error("You have already applied to this opportunity");
    err.status = 409;
    throw err;
  }

  opportunity.applicants.push(profileId);
  await opportunity.save();
};

// getApplicantsForOpportunity
export const getApplicantsForOpportunity = async ({ opportunityId, userId }) => {
  const { profileId, role } = await getProfileRef(userId);

  if (role !== "organisation") {
    const err = new Error("Only organisations can view applicants");
    err.status = 403;
    throw err;
  }

  const opportunity = await Opportunity.findById(opportunityId)
    .populate("applicants", "email location education skills profiles avatar gender intrested_domains badges")
    .lean();

  if (!opportunity) {
    const err = new Error("Opportunity not found");
    err.status = 404;
    throw err;
  }

  if (opportunity.postedBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to view applicants for this opportunity");
    err.status = 403;
    throw err;
  }

  return opportunity.applicants;
};

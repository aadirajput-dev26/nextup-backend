import Collaboration from "../models/collaboration.model.js";
import User from "../models/user.model.js";

// Helpers

// Protected fields that can never be patched by clients
const PROTECTED = ["createdBy", "participants", "_id", "__v"];

const sanitize = (body) => {
  const update = { ...body };
  PROTECTED.forEach((f) => delete update[f]);
  return update;
};

// Resolves the profile ObjectId for the authenticated user.
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
import Student from "../models/student.model.js";
import { createBatchNotifications, createNotification } from "./notification.service.js";

// createCollaboration
export const createCollaboration = async ({ userId, fields }) => {
  const { profileId, role } = await getProfileRef(userId);

  if (role !== "student") {
    const err = new Error("Only students can create collaborations");
    err.status = 403;
    throw err;
  }

  const collaboration = await Collaboration.create({
    ...fields,
    createdBy: {
      id: profileId,
      role: "student",
    },
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
        type: "collaboration",
        message: `A new collaboration "${collaboration.title}" was posted by one of your connections.`,
        relatedId: collaboration._id,
      };
    });

    if (notificationsData.length > 0) {
      await createBatchNotifications(notificationsData);
    }
  } catch (err) {
    console.error("Failed to notify followers about new collaboration:", err);
  }

  // 2. Notify users with matching skills (up to 50)
  if (fields.requiredSkills && fields.requiredSkills.length > 0) {
    try {
      const matchingStudents = await Student.find({
        skills: { $in: fields.requiredSkills },
        _id: { $ne: profileId }, // Exclude the creator
      })
        .limit(50)
        .select("_id")
        .lean();

      const skillNotificationsData = matchingStudents.map((student) => ({
        recipient: { id: student._id, role: "Student" },
        type: "collaboration",
        message: `A new collaboration matches your skillset: "${collaboration.title}"`,
        relatedId: collaboration._id,
      }));

      if (skillNotificationsData.length > 0) {
        await createBatchNotifications(skillNotificationsData);
      }
    } catch (err) {
      console.error("Failed to notify matching students about new collaboration:", err);
    }
  }

  return collaboration;
};

// getAllCollaborations
export const getAllCollaborations = async () => {
  return Collaboration.find()
    .populate("createdBy.id", "-password -passwordHash")
    .sort({ createdAt: -1 })
    .lean();
};

// getCollaborationById
export const getCollaborationById = async (collaborationId) => {
  const collaboration = await Collaboration.findById(collaborationId)
    .populate("createdBy.id", "-password -passwordHash")
    .populate("participants", "email location skills profiles avatar education")
    .lean();

  if (!collaboration) {
    const err = new Error("Collaboration not found");
    err.status = 404;
    throw err;
  }

  return collaboration;
};

// updateCollaboration
export const updateCollaboration = async ({ collaborationId, userId, updates }) => {
  const { profileId } = await getProfileRef(userId);

  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    const err = new Error("Collaboration not found");
    err.status = 404;
    throw err;
  }

  // Ownership check
  if (collaboration.createdBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to update this collaboration");
    err.status = 403;
    throw err;
  }

  const sanitized = sanitize(updates);
  Object.assign(collaboration, sanitized);
  await collaboration.save();

  return collaboration;
};

// deleteCollaboration
export const deleteCollaboration = async ({ collaborationId, userId }) => {
  const { profileId } = await getProfileRef(userId);

  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    const err = new Error("Collaboration not found");
    err.status = 404;
    throw err;
  }

  // Ownership check
  if (collaboration.createdBy.id.toString() !== profileId.toString()) {
    const err = new Error("You are not authorised to delete this collaboration");
    err.status = 403;
    throw err;
  }

  await collaboration.deleteOne();
};

// joinCollaboration
export const joinCollaboration = async ({ collaborationId, userId }) => {
  const { profileId, role } = await getProfileRef(userId);

  if (role !== "student") {
    const err = new Error("Only students can join collaborations");
    err.status = 403;
    throw err;
  }

  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    const err = new Error("Collaboration not found");
    err.status = 404;
    throw err;
  }

  // Prevent creator from joining their own collaboration
  if (collaboration.createdBy.id.toString() === profileId.toString()) {
    const err = new Error("You cannot join your own collaboration");
    err.status = 400;
    throw err;
  }

  // Prevent duplicate application
  const alreadyJoined = collaboration.participants.some(
    (p) => p.toString() === profileId.toString()
  );
  if (alreadyJoined) {
    const err = new Error("You have already joined this collaboration");
    err.status = 409;
    throw err;
  }

  collaboration.participants.push(profileId);
  await collaboration.save();

  // Notify creator
  await createNotification({
    recipientId: collaboration.createdBy.id,
    recipientRole: collaboration.createdBy.role,
    type: "collaboration",
    message: `Someone joined your collaboration "${collaboration.title}".`,
    relatedId: collaboration._id,
  }).catch((err) => console.error("Failed to notify collaboration creator:", err));
};

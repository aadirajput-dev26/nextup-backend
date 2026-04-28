import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Organisation from "../models/organisation.model.js";

const SALT_ROUNDS = 12;

// Creates a new local user and their corresponding profile shell.
export const createLocalUser = async ({ email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let profile;
  if (role === "organisation") {
    profile = await Organisation.create({ email: email.toLowerCase() });
  } else {
    profile = await Student.create({ email: email.toLowerCase() });
  }

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    provider: "local",
    profileRef: profile._id,
    profileModel: role === "organisation" ? "Organisation" : "Student",
  });

  return user;
};

// Authenticates a local user by email and password.
export const authenticateLocalUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || user.provider !== "local") {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  return user;
};

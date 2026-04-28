import jwt from "jsonwebtoken";

// Access-flag matrix for each role.
// Extend this object when new feature flags are introduced.
const ACCESS_FLAGS = {
  student: {
    post_opportunities: true,
    transactions: true,
    collaboration: true,
    skillswap_request: true,
  },
  organisation: {
    post_opportunities: true,
    transactions: true,
    collaboration: true,
    skillswap_request: false, // orgs don't do skill-swap
  },
};

// Issues a signed JWT containing id, role, and access flags.
// @param {object} user  - Mongoose User document
// @returns {string}     - Signed JWT string
export const issueToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    access: ACCESS_FLAGS[user.role] ?? {},
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Builds the public-safe user object returned in API responses.
export const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  provider: user.provider,
});

import jwt from "jsonwebtoken";

// verifyToken – authenticate every protected route
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, access }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// requireRole – restrict routes to specific roles
// Usage: requireRole("organisation")
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

// requireAccess – restrict routes by feature-flag
// Usage: requireAccess("post_opportunities")
export const requireAccess = (flag) => {
  return (req, res, next) => {
    if (!req.user?.access?.[flag]) {
      return res.status(403).json({
        message: `Access denied. '${flag}' permission required.`,
      });
    }
    next();
  };
};

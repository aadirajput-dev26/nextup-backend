import express from "express";
import cors from "cors";
import passport from "./src/config/passport.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import opportunityRoutes from "./src/routes/opportunity.route.js";
import collaborationRoutes from "./src/routes/collaboration.route.js";
import skillswapRoutes from "./src/routes/skillswap.route.js";
import transactionRoutes from "./src/routes/transaction.route.js";
import connectionRoutes from "./src/routes/connection.route.js";
import notificationRoutes from "./src/routes/notification.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration – allow only the two trusted front‑ends
const allowedOrigins = [process.env.FRONTEND_URL_LOCAL, process.env.FRONTEND_URL_PROD];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non‑browser requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport initialisation (stateless – no session)
app.use(passport.initialize());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/skillswap", skillswapRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "NextUp API is running" }));

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
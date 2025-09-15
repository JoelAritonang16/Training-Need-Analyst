import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import UserRoute from "./routes/users.js";
import AuthRoute from "./routes/auth.js";
import db from "./models/index.js";
import seedUsers from "./seeders/userSeeder.js";

dotenv.config();

const app = express();

console.log("CWD:", process.cwd());

app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:5000", "file://", "https://"]
        : ["http://localhost:3000", "http://localhost:5173", /^file:\/\/.*/],
  })
);
app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESS_SECRET ||
      process.env.SESSION_SECRET ||
      "your-super-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
    },
  })
);

// API Routes
app.use("/api/users", UserRoute);
app.use("/api/auth", AuthRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.APP_PORT || process.env.SERVER_PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    await db.initDatabase();
    
    // Seed sample users
    await seedUsers();

    app.listen(PORT, () => {
      console.log(`Backend API server running on port ${PORT}...`);
      console.log(`API endpoints available at: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

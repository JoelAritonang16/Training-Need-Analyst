import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import UserRoute from "./routes/users.js";
import AuthRoute from "./routes/auth.js";
import db from "./models/index.js";
import seedUsers from "./seeders/userSeeder.js";
import TrainingProposalRoute from "./routes/trainingProposal.js";
import { syncDraftsFromRealizedProposals } from "./controllers/trainingProposalController.js";
import DivisiRoute from "./routes/divisi.js";
import BranchRoute from "./routes/branch.js";
import AnakPerusahaanRoute from "./routes/anakPerusahaan.js";
import DraftTNA2026Route from "./routes/draftTNA2026.js";
import TempatDiklatRealisasiRoute from "./routes/tempatDiklatRealisasi.js";
import NotificationRoute from "./routes/notifications.js";
import DemografiRoute from "./routes/demografi.js";

dotenv.config();

const app = express();

console.log("CWD:", process.cwd());

app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:5000", "file://", "https://"]
        : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", /^file:\/\/.*/],
  })
);
app.use(express.json());

// Serve static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

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
app.use("/api/training-proposals", TrainingProposalRoute);
app.use("/api/divisi", DivisiRoute);
app.use("/api/branch", BranchRoute);
app.use("/api/anak-perusahaan", AnakPerusahaanRoute);
app.use("/api/draft-tna-2026", DraftTNA2026Route);
app.use("/api/tempat-diklat-realisasi", TempatDiklatRealisasiRoute);
app.use("/api/notifications", NotificationRoute);
app.use("/api/demografi", DemografiRoute);

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
    await syncDraftsFromRealizedProposals();

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

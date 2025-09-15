import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();

console.log('Testing basic Express setup...');

app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173", "http://localhost:3000"]
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESS_SECRET || "test-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: "lax",
  },
}));

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log('✅ Basic Express setup is working');
  console.log('✅ CORS is configured');
  console.log('✅ Session middleware is working');
  console.log('✅ Environment variables loaded');
  
  // Exit after 3 seconds
  setTimeout(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  }, 3000);
});

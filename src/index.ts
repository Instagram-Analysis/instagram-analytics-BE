// backend/src/index.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import instagramRoutes from "./routes/instagram.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1) CORS must allow credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// 2) Session middleware BEFORE your routes
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

// 3) Body parser
app.use(express.json());

// 4) Mount auth routes
app.use("/api/auth", authRoutes);

// 5) Mount protected Instagram data routes
app.use("/api", instagramRoutes);

// 6) A simple health‐check endpoint
app.get("/", (_req, res) => {
  res.send("Instagram Analytics API is up and running");
});

app.listen(PORT, () => {
  console.log(`▶️  API listening on http://localhost:${PORT}`);
});

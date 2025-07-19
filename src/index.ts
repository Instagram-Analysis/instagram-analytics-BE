// backend/src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import authRoutes from "./routes/auth.routes";
import instagramRoutes from "./routes/instagram.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1) CORS with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// 2) Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

app.use(express.json());

// 3) Auth endpoints
app.use("/api/auth", authRoutes);

// 4) Protected Instagram routes
app.use("/api", instagramRoutes);

app.get("/", (_req, res) => {
  res.send("Instagram Analytics API is up and running");
});

app.listen(PORT, () => {
  console.log(`▶️  API listening on http://localhost:${PORT}`);
});

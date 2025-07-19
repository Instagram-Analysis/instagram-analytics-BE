import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import instagramRoutes from "./routes/instagram.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api", instagramRoutes);

app.listen(PORT, () => {
  console.log(`▶️  API listening on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Instagram Analytics API is up and running");
});

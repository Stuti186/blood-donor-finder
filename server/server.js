import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { startEscalation } from "./utils/cron.js";
import authRoutes from "./routes/auth.js";
import donorRoutes from "./routes/donors.js";
import requestRoutes from "./routes/requests.js";
import bankRoutes from "./routes/banks.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1);
const origins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors({ origin: origins }));

app.use(express.json());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use((err, _req, res, _next) => res.status(500).json({ message: err.message }));

await connectDB();
startEscalation();
app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`));

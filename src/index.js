import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./utils/database.js";

// REST Routes
import healthRouter          from "./routes/health.js";
import authRouter            from "./routes/auth.js";
import moodsRouter           from "./routes/moods.js";
import genresRouter          from "./routes/genres.js";
import recommendationsRouter from "./routes/recommendations.js";
import historyRouter         from "./routes/history.js";
import favouritesRouter      from "./routes/favourites.js";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

// REST API Routes
app.use("/api/v1/health",          healthRouter);
app.use("/api/v1/auth",            authRouter);
app.use("/api/v1/moods",           moodsRouter);
app.use("/api/v1/genres",          genresRouter);
app.use("/api/v1/recommendations", recommendationsRouter);
app.use("/api/v1/history",         historyRouter);
app.use("/api/v1/favourites",      favouritesRouter);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🎵 MoodTunes REST API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/v1/health`);
  });
}).catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});
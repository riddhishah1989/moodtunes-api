import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/database.js";

// Controllers
import healthRouter from "./controllers/health.js";
import authRouter from "./controllers/auth.js";
import moodsRouter from "./controllers/moods.js";
import genresRouter from "./controllers/genres.js";
import recommendationsRouter from "./controllers/recommendations.js";
import historyRouter from "./controllers/history.js";
import favouritesRouter from "./controllers/favourites.js";
import spotifyRouter from "./controllers/spotify.js";
import youtubeRouter from "./controllers/youtube.js";
import journalRouter from "./controllers/journal.js";
import insightsRouter from "./controllers/insights.js";
import shareRouter from "./controllers/share.js";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

// REST API Routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/moods", moodsRouter);
app.use("/api/v1/genres", genresRouter);
app.use("/api/v1/recommendations", recommendationsRouter);
app.use("/api/v1/history", historyRouter);
app.use("/api/v1/favourites", favouritesRouter);
app.use("/api/v1/spotify", spotifyRouter);
app.use("/api/v1/youtube", youtubeRouter);
app.use("/api/v1/journal", journalRouter);
app.use("/api/v1/insights", insightsRouter);
app.use("/api/v1/share", shareRouter);

// 404 handler
app.use("/api", (req, res) => {
  res
    .status(404)
    .json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🎵 MoodTunes REST API running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/v1/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

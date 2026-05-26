import express   from "express";
import mongoose  from "mongoose";

const router  = express.Router();
const startTime = Date.now();

// ── GET /api/v1/health ────────────────────────────────────────
router.get("/", (req, res) => {
  const dbState  = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.status(200).json({
    success:   true,
    status:    "ok",
    service:   "MoodTunes API",
    version:   "1.0.0",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    database: {
      status: dbStatus[dbState] || "unknown",
      connected: dbState === 1,
    },
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;

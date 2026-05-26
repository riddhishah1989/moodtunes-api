import express                from "express";
import { searchYouTubeVideo } from "../services/youtubeService.js";

const router = express.Router();

// ── GET /api/v1/youtube/search?q=&limit= ─────────────────────
router.get("/search", async (req, res) => {
  try {
    const { q, limit = 1 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required.' });
    }

    const parsedLimit = Math.min(parseInt(limit) || 1, 10); // max 10
    const result      = await searchYouTubeVideo(q.trim(), parsedLimit);

    if (!result) {
      return res.status(404).json({ success: false, error: "No YouTube videos found for that query." });
    }

    res.status(200).json({
      success: true,
      data: parsedLimit === 1 ? result : { videos: result, count: result.length },
    });
  } catch (err) {
    console.error("YouTube search error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

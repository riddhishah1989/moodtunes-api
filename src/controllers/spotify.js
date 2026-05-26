import express                from "express";
import { searchSpotifyTrack } from "../services/spotifyService.js";

const router = express.Router();

// ── GET /api/v1/spotify/search?q=&limit= ─────────────────────
router.get("/search", async (req, res) => {
  try {
    const { q, limit = 1 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required.' });
    }

    const parsedLimit = Math.min(parseInt(limit) || 1, 10); // max 10
    const result      = await searchSpotifyTrack(q.trim(), parsedLimit);

    if (!result) {
      return res.status(404).json({ success: false, error: "No Spotify tracks found for that query." });
    }

    res.status(200).json({
      success: true,
      data: parsedLimit === 1 ? result : { tracks: result, count: result.length },
    });
  } catch (err) {
    console.error("Spotify search error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

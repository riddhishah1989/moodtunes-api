import express              from "express";
import { authMiddleware }   from "../middleware/auth.js";
import { sessionRepository } from "../repositories/sessionRepository.js";

const router = express.Router();

// ── GET /api/v1/share/:sessionId ─────────────────────────────
// Public endpoint — no auth needed — returns shareable playlist data
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find session — no userId check since this is public sharing
    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Playlist not found or has been deleted." });
    }

    const baseUrl = process.env.APP_BASE_URL || `https://moodtunes-graphql-api-devlopment.up.railway.app`;

    return res.status(200).json({
      success: true,
      data: {
        share_url:           `${baseUrl}/api/v1/share/${sessionId}`,
        mood:                session.mood,
        mood_interpretation: session.moodInterpretation,
        song_count:          session.songs.length,
        created_at:          session.createdAt.toISOString(),
        songs: session.songs.map((s, i) => ({
          id:           `${session._id}-${i}`,
          title:        s.title,
          artist:       s.artist,
          genre:        s.genre,
          reason:       s.reason,
          album_art:    s.albumArt,
          spotify_url:  s.spotifyUrl,
          youtube_url:  s.youtubeUrl,
        })),
      },
    });
  } catch (err) {
    console.error("Share playlist error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── POST /api/v1/share ────────────────────────────────────────
// Generate a share link for one of the logged-in user's sessions
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, error: '"session_id" is required.' });
    }

    // Verify session belongs to this user
    const session = await sessionRepository.findByIdAndUser(session_id, req.user._id);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }

    const baseUrl  = process.env.APP_BASE_URL || `https://moodtunes-graphql-api-devlopment.up.railway.app`;
    const shareUrl = `${baseUrl}/api/v1/share/${session_id}`;

    return res.status(200).json({
      success: true,
      data: {
        share_url:  shareUrl,
        session_id,
        mood:       session.mood,
        song_count: session.songs.length,
        message:    "Share this link with anyone to show your playlist!",
      },
    });
  } catch (err) {
    console.error("Generate share link error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

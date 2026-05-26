import express                from "express";
import { authMiddleware }     from "../middleware/auth.js";
import { sessionRepository }  from "../repositories/sessionRepository.js";
import { HISTORY_DEFAULT_LIMIT } from "../config/constants.js";

const router = express.Router();

// ── GET /api/v1/history ───────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || HISTORY_DEFAULT_LIMIT;
    const offset = parseInt(req.query.offset) || 0;

    // Both queries via repository
    const [totalCount, sessions] = await Promise.all([
      sessionRepository.countByUserId(req.user._id),
      sessionRepository.findByUserId(req.user._id, limit, offset),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sessions:    sessions.map(formatSession),
        total_count: totalCount,
        has_more:    offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/history/:id ───────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // Via repository
    const session = await sessionRepository.findByIdAndUser(req.params.id, req.user._id);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }
    res.status(200).json({ success: true, data: formatSession(session) });
  } catch (err) {
    console.error("Get session error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/history/:id ────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Via repository
    const result = await sessionRepository.deleteByIdAndUser(req.params.id, req.user._id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Session not found." });
    }
    res.status(200).json({ success: true, message: "Session deleted." });
  } catch (err) {
    console.error("Delete session error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/history ────────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    // Via repository
    await sessionRepository.deleteAllByUser(req.user._id);
    res.status(200).json({ success: true, message: "All history cleared." });
  } catch (err) {
    console.error("Clear history error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── Helper: format session for response ──────────────────────
function formatSession(session) {
  return {
    id:                  session._id.toString(),
    mood:                session.mood,
    custom_text:         session.customText,
    mood_interpretation: session.moodInterpretation,
    song_count:          session.songs.length,
    created_at:          session.createdAt.toISOString(),
    songs: session.songs.map((s, i) => ({
      id:                `${session._id}-${i}`,
      title:             s.title,
      artist:            s.artist,
      album:             s.album,
      genre:             s.genre,
      year:              s.year,
      reason:            s.reason,
      energy_level:      s.energyLevel?.toLowerCase(),
      tempo:             s.tempo?.toLowerCase(),
      spotify_url:       s.spotifyUrl,
      preview_url:       s.spotifyPreviewUrl,
      album_art:         s.albumArt,
      album_art_thumb:   s.albumArtThumb,
      youtube_url:       s.youtubeUrl,
      youtube_thumbnail: s.youtubeThumbnail,
      youtube_title:     s.youtubeTitle,
    })),
  };
}

export default router;

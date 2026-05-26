import express                from "express";
import { authMiddleware }      from "../middleware/auth.js";
import { favouriteRepository } from "../repositories/favouriteRepository.js";

const router = express.Router();

// ── GET /api/v1/favourites ────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 50;
    const offset = parseInt(req.query.offset) || 0;

    const [favs, totalCount] = await Promise.all([
      favouriteRepository.findByUserId(req.user._id, limit, offset),
      favouriteRepository.countByUser(req.user._id),
    ]);

    res.status(200).json({
      success: true,
      data: {
        favourites: favs.map(formatFavourite),
        count:      favs.length,
        total:      totalCount,
        has_more:   offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("Get favourites error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/favourites/:songId/check ─────────────────────
router.get("/:songId/check", authMiddleware, async (req, res) => {
  try {
    const isFav = await favouriteRepository.isFavourite(req.user._id, req.params.songId);
    res.status(200).json({ success: true, data: { is_favourite: isFav, song_id: req.params.songId } });
  } catch (err) {
    console.error("Check favourite error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── POST /api/v1/favourites ───────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { song_id, title, artist, album, genre, album_art, spotify_url, youtube_url } = req.body;

    if (!song_id || !title || !artist) {
      return res.status(400).json({ success: false, error: "song_id, title and artist are required." });
    }

    const fav = await favouriteRepository.upsert(req.user._id, song_id, {
      title, artist, album, genre,
      albumArt:   album_art,
      spotifyUrl: spotify_url,
      youtubeUrl: youtube_url,
    });

    res.status(201).json({
      success: true,
      data: { id: fav._id.toString(), song_id: fav.songId, title: fav.title, saved_at: fav.createdAt.toISOString() },
      message: "Added to favourites. ♥",
    });
  } catch (err) {
    console.error("Add favourite error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/favourites/:songId ────────────────────────
router.delete("/:songId", authMiddleware, async (req, res) => {
  try {
    const result = await favouriteRepository.deleteByUserAndSong(req.user._id, req.params.songId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Favourite not found." });
    }
    res.status(200).json({ success: true, message: "Removed from favourites." });
  } catch (err) {
    console.error("Remove favourite error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/favourites ─────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await favouriteRepository.deleteAllByUser(req.user._id);
    res.status(200).json({ success: true, message: "All favourites cleared." });
  } catch (err) {
    console.error("Clear favourites error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

function formatFavourite(f) {
  return {
    id:          f._id.toString(),
    song_id:     f.songId,
    title:       f.title,
    artist:      f.artist,
    album:       f.album,
    genre:       f.genre,
    album_art:   f.albumArt,
    spotify_url: f.spotifyUrl,
    youtube_url: f.youtubeUrl,
    saved_at:    f.createdAt.toISOString(),
  };
}

export default router;

import express from "express";
import mongoose from "mongoose";
import { getUser } from "../utils/auth.js";
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ── Favourite model ───────────────────────────────────────────────────────
const favouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    songId: { type: String, required: true },
    title: String,
    artist: String,
    album: String,
    genre: String,
    albumArt: String,
    spotifyUrl: String,
    youtubeUrl: String,
  },
  { timestamps: true },
);
favouriteSchema.index({ userId: 1, songId: 1 }, { unique: true });

const Favourite =
  mongoose.models.Favourite || mongoose.model("Favourite", favouriteSchema);

// ── GET /api/v1/favourites ────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const favs = await Favourite.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      data: {
        favourites: favs.map((f) => ({
          id: f._id.toString(),
          song_id: f.songId,
          title: f.title,
          artist: f.artist,
          album: f.album,
          genre: f.genre,
          album_art: f.albumArt,
          spotify_url: f.spotifyUrl,
          youtube_url: f.youtubeUrl,
          saved_at: f.createdAt.toISOString(),
        })),
        count: favs.length,
      },
    });
  } catch (err) {
    console.error("Get favourites error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── POST /api/v1/favourites ───────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      song_id,
      title,
      artist,
      album,
      genre,
      album_art,
      spotify_url,
      youtube_url,
    } = req.body;

    if (!song_id || !title || !artist) {
      return res
        .status(400)
        .json({
          success: false,
          error: "song_id, title and artist are required.",
        });
    }

    const fav = await Favourite.findOneAndUpdate(
      { userId: req.user._id, songId: song_id },
      {
        userId: req.user._id,
        songId: song_id,
        title,
        artist,
        album,
        genre,
        albumArt: album_art,
        spotifyUrl: spotify_url,
        youtubeUrl: youtube_url,
      },
      { upsert: true, new: true },
    );

    res.status(201).json({
      success: true,
      data: {
        id: fav._id.toString(),
        song_id: fav.songId,
        title: fav.title,
        saved_at: fav.createdAt.toISOString(),
      },
      message: "Added to favourites.",
    });
  } catch (err) {
    console.error("Add favourite error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/favourites/:songId ─────────────────────────────────────
router.delete("/:songId", authMiddleware, async (req, res) => {
  try {
    const result = await Favourite.deleteOne({
      userId: req.user._id,
      songId: req.params.songId,
    });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Favourite not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "Removed from favourites." });
  } catch (err) {
    console.error("Remove favourite error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/favourites ─────────────────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Favourite.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: "All favourites cleared." });
  } catch (err) {
    console.error("Clear favourites error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

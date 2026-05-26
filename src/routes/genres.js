import express from "express";
import { Genre } from "../utils/genreModel.js";
import { getUser } from "../utils/auth.js";
import { GENRES } from "../utils/constants.js";

const router = express.Router();

// ── Auth middleware ───────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res
      .status(401)
      .json({ success: false, error: "No token provided." });
  const user = await getUser(token);
  if (!user)
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token." });
  req.user = user;
  next();
}

// ── GET /api/v1/genres ────────────────────────────────────────────────────
// Returns all active genres — used to populate genre picker in app
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: {
        genres: genres.map((g) => ({
          id: g._id.toString(),
          name: g.name,
          description: g.description,
          emoji: g.emoji,
        })),
        count: genres.length,
      },
    });
  } catch (err) {
    console.error("Get genres error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/genres/:id ────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res
        .status(404)
        .json({ success: false, error: "Genre not found." });
    }
    res.status(200).json({
      success: true,
      data: {
        id: genre._id.toString(),
        name: genre.name,
        description: genre.description,
        emoji: genre.emoji,
      },
    });
  } catch (err) {
    console.error("Get genre error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── POST /api/v1/genres/seed ──────────────────────────────────────────────
// Run this ONCE to populate genres in MongoDB
router.post("/seed", async (req, res) => {
  try {
    const genres = GENRES

    // Insert only if not already existing
    let inserted = 0;
    for (const genre of genres) {
      const exists = await Genre.findOne({ name: genre.name });
      if (!exists) {
        await Genre.create(genre);
        inserted++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${inserted} genres successfully.`,
      total: await Genre.countDocuments(),
    });
  } catch (err) {
    console.error("Seed genres error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

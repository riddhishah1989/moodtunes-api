import express               from "express";
import { genreRepository }   from "../repositories/genreRepository.js";
import { GENRES }            from "../config/constants.js";

const router = express.Router();

// ── GET /api/v1/genres ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // Via repository
    const genres = await genreRepository.findAll();
    res.status(200).json({
      success: true,
      data: {
        genres: genres.map((g) => ({
          id:          g._id.toString(),
          name:        g.name,
          description: g.description,
          emoji:       g.emoji,
        })),
        count: genres.length,
      },
    });
  } catch (err) {
    console.error("Get genres error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/genres/:id ────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    // Via repository
    const genre = await genreRepository.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({ success: false, error: "Genre not found." });
    }
    res.status(200).json({
      success: true,
      data: {
        id:          genre._id.toString(),
        name:        genre.name,
        description: genre.description,
        emoji:       genre.emoji,
      },
    });
  } catch (err) {
    console.error("Get genre error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── POST /api/v1/genres/seed ──────────────────────────────────
// Run ONCE to populate genres in MongoDB
router.post("/seed", async (req, res) => {
  try {
    let inserted = 0;
    for (const genre of GENRES) {
      // Via repository
      const exists = await genreRepository.findByName(genre.name);
      if (!exists) {
        await genreRepository.create(genre);
        inserted++;
      }
    }
    const total = await genreRepository.count();
    res.status(200).json({
      success: true,
      message: `Seeded ${inserted} genres successfully.`,
      total,
    });
  } catch (err) {
    console.error("Seed genres error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;

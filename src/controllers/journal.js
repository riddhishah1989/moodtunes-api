import express              from "express";
import { authMiddleware }   from "../middleware/auth.js";
import { journalRepository } from "../repositories/journalRepository.js";
import { PRESET_MOODS }     from "../config/constants.js";

const router = express.Router();

// ── POST /api/v1/journal ──────────────────────────────────────
// Create a new mood journal entry
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mood, note = null, rating, tags = [] } = req.body;

    // Validate mood
    if (!mood || mood.trim().length === 0) {
      return res.status(400).json({ success: false, error: '"mood" is required.' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: '"rating" must be between 1 and 5.' });
    }

    // Get emoji from preset moods or default
    const presetMood = PRESET_MOODS.find(
      (m) => m.label.toLowerCase() === mood.toLowerCase()
    );
    const moodEmoji = presetMood?.emoji || "😐";

    const entry = await journalRepository.create({
      userId:    req.user._id,
      mood:      mood.trim(),
      moodEmoji,
      note:      note?.trim() || null,
      rating:    parseInt(rating),
      tags,
    });

    return res.status(201).json({
      success: true,
      data:    formatEntry(entry),
      message: "Journal entry saved.",
    });
  } catch (err) {
    console.error("Create journal error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/journal ───────────────────────────────────────
// Get all journal entries for logged-in user (paginated)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit)  || 20;
    const offset = parseInt(req.query.offset) || 0;

    const [entries, totalCount] = await Promise.all([
      journalRepository.findByUserId(req.user._id, limit, offset),
      journalRepository.countByUserId(req.user._id),
    ]);

    res.status(200).json({
      success: true,
      data: {
        entries:     entries.map(formatEntry),
        total_count: totalCount,
        has_more:    offset + limit < totalCount,
      },
    });
  } catch (err) {
    console.error("Get journal error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── GET /api/v1/journal/:id ───────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await journalRepository.findByIdAndUser(req.params.id, req.user._id);
    if (!entry) {
      return res.status(404).json({ success: false, error: "Journal entry not found." });
    }
    res.status(200).json({ success: true, data: formatEntry(entry) });
  } catch (err) {
    console.error("Get journal entry error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/journal/:id ────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await journalRepository.deleteByIdAndUser(req.params.id, req.user._id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Journal entry not found." });
    }
    res.status(200).json({ success: true, message: "Journal entry deleted." });
  } catch (err) {
    console.error("Delete journal error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/journal ────────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await journalRepository.deleteAllByUser(req.user._id);
    res.status(200).json({ success: true, message: "All journal entries deleted." });
  } catch (err) {
    console.error("Clear journal error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── Helper ────────────────────────────────────────────────────
function formatEntry(entry) {
  return {
    id:         entry._id.toString(),
    mood:       entry.mood,
    mood_emoji: entry.moodEmoji,
    note:       entry.note,
    rating:     entry.rating,
    tags:       entry.tags,
    created_at: entry.createdAt.toISOString(),
  };
}

export default router;

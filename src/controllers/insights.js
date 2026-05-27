import express               from "express";
import Anthropic             from "@anthropic-ai/sdk";
import { authMiddleware }    from "../middleware/auth.js";
import { journalRepository } from "../repositories/journalRepository.js";
import { sessionRepository } from "../repositories/sessionRepository.js";

const router  = express.Router();
const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── GET /api/v1/insights ──────────────────────────────────────
// Returns AI-powered mood and music insights for the last 30 days
router.get("/", authMiddleware, async (req, res) => {
  try {
    const days      = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [moodCounts, avgRatings, recentEntries, recentSessions] = await Promise.all([
      journalRepository.getMoodCounts(req.user._id, startDate),
      journalRepository.getAvgRatingPerMood(req.user._id, startDate),
      journalRepository.findByDateRange(req.user._id, startDate, new Date()),
      sessionRepository.findByUserId(req.user._id, 50, 0),
    ]);

    // If no data yet — return empty state
    if (moodCounts.length === 0 && recentSessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          has_data:           false,
          message:            "Start logging your mood and getting recommendations to see insights!",
          period_days:        days,
          mood_breakdown:     [],
          top_genres:         [],
          ai_insight:         null,
          most_common_mood:   null,
          total_sessions:     0,
          total_journal_entries: 0,
        },
      });
    }

    // ── Calculate top genres from sessions ────────────────────
    const genreMap = {};
    recentSessions.forEach((session) => {
      session.songs.forEach((song) => {
        if (song.genre) {
          genreMap[song.genre] = (genreMap[song.genre] || 0) + 1;
        }
      });
    });
    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // ── Genre per mood mapping ────────────────────────────────
    const moodGenreMap = {};
    recentSessions.forEach((session) => {
      const mood = session.mood;
      if (!moodGenreMap[mood]) moodGenreMap[mood] = {};
      session.songs.forEach((song) => {
        if (song.genre) {
          moodGenreMap[mood][song.genre] = (moodGenreMap[mood][song.genre] || 0) + 1;
        }
      });
    });

    const genrePerMood = Object.entries(moodGenreMap).map(([mood, genres]) => ({
      mood,
      top_genre: Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    }));

    // ── Generate AI insight using Claude ─────────────────────
    let aiInsight = null;
    if (recentEntries.length >= 3 || recentSessions.length >= 3) {
      aiInsight = await generateAIInsight({
        moodCounts,
        avgRatings,
        topGenres,
        genrePerMood,
        totalEntries: recentEntries.length,
        totalSessions: recentSessions.length,
        days,
        userName: req.user.name,
      });
    }

    // ── Mood breakdown with avg rating ───────────────────────
    const moodBreakdown = moodCounts.map((m) => {
      const ratingData = avgRatings.find((r) => r._id === m._id);
      return {
        mood:       m._id,
        emoji:      m.emoji,
        count:      m.count,
        avg_rating: ratingData ? parseFloat(ratingData.avgRating.toFixed(1)) : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        has_data:             true,
        period_days:          days,
        most_common_mood:     moodBreakdown[0] || null,
        mood_breakdown:       moodBreakdown,
        top_genres:           topGenres,
        genre_per_mood:       genrePerMood,
        total_sessions:       recentSessions.length,
        total_journal_entries: recentEntries.length,
        ai_insight:           aiInsight,
      },
    });
  } catch (err) {
    console.error("Insights error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── Claude AI insight generator ───────────────────────────────
async function generateAIInsight({ moodCounts, avgRatings, topGenres, genrePerMood, totalEntries, totalSessions, days, userName }) {
  try {
    const prompt = `You are a music and mood analyst for MoodTunes app.

Here is ${userName}'s data for the last ${days} days:
- Total journal entries: ${totalEntries}
- Total music sessions: ${totalSessions}
- Mood breakdown: ${JSON.stringify(moodCounts.slice(0, 5))}
- Average mood ratings: ${JSON.stringify(avgRatings.slice(0, 5))}
- Top genres listened to: ${JSON.stringify(topGenres.slice(0, 5))}
- Genre per mood: ${JSON.stringify(genrePerMood)}

Write ONE short, personal, insightful observation (2-3 sentences) about their mood and music patterns.
Be warm and encouraging. Mention specific patterns you notice. Don't start with "I".
Respond with ONLY the insight text — no quotes, no labels, no JSON.`;

    const message = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages:   [{ role: "user", content: prompt }],
    });

    return message.content[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

export default router;

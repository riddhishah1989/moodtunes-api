import express                   from "express";
import { authMiddleware }         from "../middleware/auth.js";
import { sessionRepository }      from "../repositories/sessionRepository.js";
import { genreRepository }        from "../repositories/genreRepository.js";
import { getAIRecommendations }   from "../services/claudeService.js";
import { enrichWithSpotify }      from "../services/spotifyService.js";
import { enrichWithYouTube }      from "../services/youtubeService.js";
import {
  RECOMMENDATION_MIN_COUNT,
  RECOMMENDATION_MAX_COUNT,
  RECOMMENDATION_DEFAULT_COUNT,
} from "../config/constants.js";

const router = express.Router();

// ── POST /api/v1/recommendations ──────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      mood,
      custom_text     = null,
      genre_ids       = [],      // NEW: optional genre filter
      include_spotify = true,
      include_youtube = true,
    } = req.body;
    const count = req.body.count || RECOMMENDATION_DEFAULT_COUNT;

    // Validate
    if (!mood || mood.trim().length === 0) {
      return res.status(400).json({ success: false, error: '"mood" is required.' });
    }
    if (count < RECOMMENDATION_MIN_COUNT || count > RECOMMENDATION_MAX_COUNT) {
      return res.status(400).json({
        success: false,
        error: `count must be between ${RECOMMENDATION_MIN_COUNT} and ${RECOMMENDATION_MAX_COUNT}.`,
      });
    }

    // Resolve genre names from IDs if provided
    let genreContext = "";
    if (genre_ids.length > 0) {
      const genres = await Promise.all(genre_ids.map((id) => genreRepository.findById(id)));
      const validGenres = genres.filter(Boolean).map((g) => g.name);
      if (validGenres.length > 0) {
        genreContext = `Preferred genres: ${validGenres.join(", ")}.`;
      }
    }

    const startTime = Date.now();

    // 1. Get AI recommendations — inject genre context into custom_text
    const enrichedCustomText = [custom_text, genreContext].filter(Boolean).join(" ") || null;
    const { moodInterpretation, songs } = await getAIRecommendations(
      mood.trim(),
      enrichedCustomText,
      count
    );

    // 2. Enrich with Spotify + YouTube in parallel
    let enriched = songs;
    if (include_spotify && include_youtube) {
      const [withSpotify, withYouTube] = await Promise.all([
        enrichWithSpotify(songs),
        enrichWithYouTube(songs),
      ]);
      enriched = withSpotify.map((song, i) => ({ ...song, ...withYouTube[i] }));
    } else if (include_spotify) {
      enriched = await enrichWithSpotify(songs);
    } else if (include_youtube) {
      enriched = await enrichWithYouTube(songs);
    }

    // 3. Save session via repository
    const session = await sessionRepository.create({
      userId:             req.user._id,
      mood:               mood.trim(),
      customText:         custom_text,
      moodInterpretation,
      songs: enriched.map((s) => ({
        title:             s.title,
        artist:            s.artist,
        album:             s.album,
        genre:             s.genre,
        year:              s.year,
        reason:            s.reason,
        energyLevel:       (s.energy_level || "medium").toUpperCase(),
        tempo:             (s.tempo || "moderate").toUpperCase(),
        spotifyUrl:        s.spotifyUrl,
        spotifyPreviewUrl: s.spotifyPreviewUrl,
        albumArt:          s.albumArt,
        albumArtThumb:     s.albumArtThumb,
        popularity:        s.popularity,
        youtubeUrl:        s.youtubeUrl,
        youtubeThumbnail:  s.youtubeThumbnail,
        youtubeTitle:      s.youtubeTitle,
      })),
    });

    return res.status(200).json({
      success: true,
      data: {
        session_id:          session._id.toString(),
        mood_input:          mood.trim(),
        mood_interpretation: moodInterpretation,
        count:               session.songs.length,
        recommendations:     formatSongs(session),
      },
      meta: {
        duration_ms: Date.now() - startTime,
        model:       "claude-sonnet-4-20250514",
      },
    });
  } catch (err) {
    console.error("Recommendations error:", err.message);
    res.status(500).json({ success: false, error: err.message || "Something went wrong." });
  }
});

function formatSongs(session) {
  return session.songs.map((s, i) => ({
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
  }));
}

export default router;

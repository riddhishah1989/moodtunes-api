import { GraphQLError }           from 'graphql';
import { requireAuth }             from '../utils/auth.js';
import { Session }                 from '../utils/sessionModel.js';
import { getAIRecommendations }    from '../services/claudeService.js';
import { enrichWithSpotify }       from '../services/spotifyService.js';
import { enrichWithYouTube }       from '../services/youtubeService.js';

// ── Preset moods (returned by moods query) ────────────────────────────────
const PRESET_MOODS = [
  { id: 'happy',     label: 'Happy',     emoji: '😊', description: 'Upbeat & joyful',   colorHex: '#FFD93D', bgColorHex: '#1A1500' },
  { id: 'sad',       label: 'Sad',       emoji: '😢', description: 'Reflective',         colorHex: '#5B8FD4', bgColorHex: '#040810' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', description: 'Pumped up',          colorHex: '#FF6B6B', bgColorHex: '#0F0404' },
  { id: 'calm',      label: 'Calm',      emoji: '🌿', description: 'Peaceful & serene',  colorHex: '#5DD68A', bgColorHex: '#04100A' },
  { id: 'romantic',  label: 'Romantic',  emoji: '💕', description: 'Tender & warm',      colorHex: '#FF63A5', bgColorHex: '#0F0408' },
  { id: 'focused',   label: 'Focused',   emoji: '🎯', description: 'In the zone',        colorHex: '#4D96FF', bgColorHex: '#04060F' },
  { id: 'angry',     label: 'Angry',     emoji: '😤', description: 'Intense energy',     colorHex: '#FF4444', bgColorHex: '#0F0404' },
  { id: 'anxious',   label: 'Anxious',   emoji: '😰', description: 'Overwhelmed',        colorHex: '#C77DFF', bgColorHex: '#0A040F' },
];

// ── Helper: format a Session document for GraphQL response ────────────────
function formatSession(session) {
  return {
    id:                 session._id.toString(),
    mood:               session.mood,
    customText:         session.customText,
    moodInterpretation: session.moodInterpretation,
    songCount:          session.songs.length,
    createdAt:          session.createdAt.toISOString(),
    songs: session.songs.map((s, i) => ({
      id:               `${session._id}-${i}`,
      title:            s.title,
      artist:           s.artist,
      album:            s.album,
      genre:            s.genre,
      year:             s.year,
      reason:           s.reason,
      energyLevel:      (s.energyLevel || 'MEDIUM').toUpperCase(),
      tempo:            (s.tempo || 'MODERATE').toUpperCase(),
      spotifyUrl:       s.spotifyUrl,
      spotifyPreviewUrl:s.spotifyPreviewUrl,
      albumArt:         s.albumArt,
      albumArtThumb:    s.albumArtThumb,
      popularity:       s.popularity,
      youtubeUrl:       s.youtubeUrl,
      youtubeThumbnail: s.youtubeThumbnail,
      youtubeTitle:     s.youtubeTitle,
    })),
  };
}

export const musicResolvers = {
  Query: {
    // ── GET all preset moods ──────────────────────────────────────────────
    moods: () => PRESET_MOODS,

    // ── GET single mood by ID ─────────────────────────────────────────────
    mood: (_, { id }) => {
      const mood = PRESET_MOODS.find(m => m.id === id);
      if (!mood) throw new GraphQLError(`Mood '${id}' not found.`, {
        extensions: { code: 'NOT_FOUND' },
      });
      return mood;
    },

    // ── GET single session ────────────────────────────────────────────────
    session: async (_, { id }, context) => {
      const user    = requireAuth(context);
      const session = await Session.findOne({ _id: id, userId: user._id });
      if (!session) throw new GraphQLError('Session not found.', {
        extensions: { code: 'NOT_FOUND' },
      });
      return formatSession(session);
    },

    // ── GET user's session history ────────────────────────────────────────
    myHistory: async (_, { limit = 20, offset = 0 }, context) => {
      const user       = requireAuth(context);
      const totalCount = await Session.countDocuments({ userId: user._id });
      const sessions   = await Session.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return {
        sessions:   sessions.map(formatSession),
        totalCount,
        hasMore:    offset + limit < totalCount,
      };
    },
  },

  Mutation: {
    // ── GET AI MUSIC RECOMMENDATIONS ──────────────────────────────────────
    getRecommendations: async (_, { input }, context) => {
      const user = requireAuth(context);

      const {
        mood,
        customText     = null,
        count          = 8,
        includeSpotify = true,
        includeYoutube = true,
      } = input;

      // Validate count
      if (count < 1 || count > 15) {
        throw new GraphQLError('count must be between 1 and 15.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // 1️⃣  Ask Claude AI for recommendations
      const { moodInterpretation, songs } = await getAIRecommendations(mood, customText, count);

      // 2️⃣  Enrich with Spotify + YouTube in parallel
      let enriched = songs;
      if (includeSpotify && includeYoutube) {
        const [withSpotify, withYouTube] = await Promise.all([
          enrichWithSpotify(songs),
          enrichWithYouTube(songs),
        ]);
        enriched = withSpotify.map((song, i) => ({ ...song, ...withYouTube[i] }));
      } else if (includeSpotify) {
        enriched = await enrichWithSpotify(songs);
      } else if (includeYoutube) {
        enriched = await enrichWithYouTube(songs);
      }

      // 3️⃣  Save session to MongoDB
      const session = await Session.create({
        userId:             user._id,
        mood,
        customText,
        moodInterpretation,
        songs: enriched.map(s => ({
          title:             s.title,
          artist:            s.artist,
          album:             s.album,
          genre:             s.genre,
          year:              s.year,
          reason:            s.reason,
          energyLevel:       (s.energy_level || 'medium').toUpperCase(),
          tempo:             (s.tempo || 'moderate').toUpperCase(),
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

      return formatSession(session);
    },

    // ── DELETE session from history ───────────────────────────────────────
    deleteSession: async (_, { id }, context) => {
      const user   = requireAuth(context);
      const result = await Session.deleteOne({ _id: id, userId: user._id });
      return result.deletedCount > 0;
    },
  },
};

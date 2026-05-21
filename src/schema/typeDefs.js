export const typeDefs = `#graphql

  # ═══════════════════════════════════════════════════════
  # AUTH TYPES
  # ═══════════════════════════════════════════════════════

  """A registered user of MoodTunes"""
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  """Returned after login or signup — contains the JWT token"""
  type AuthPayload {
    token: String!
    user: User!
    message: String!
  }

  """Input for signing up"""
  input SignUpInput {
    name: String!
    email: String!
    password: String!
  }

  """Input for signing in"""
  input SignInInput {
    email: String!
    password: String!
  }

  # ═══════════════════════════════════════════════════════
  # MUSIC RECOMMENDATION TYPES
  # ═══════════════════════════════════════════════════════

  """A single song recommended by Claude AI"""
  type Song {
    id: ID!
    title: String!
    artist: String!
    album: String!
    genre: String!
    year: Int
    reason: String!          # Why Claude picked this for your mood
    energyLevel: EnergyLevel!
    tempo: Tempo!
    # Spotify data
    spotifyUrl: String
    spotifyPreviewUrl: String # 30-second preview MP3
    albumArt: String          # Album art image URL
    albumArtThumb: String
    popularity: Int           # Spotify popularity 0-100
    # YouTube data
    youtubeUrl: String
    youtubeThumbnail: String
    youtubeTitle: String
  }

  """A complete mood recommendation session"""
  type RecommendationSession {
    id: ID!
    mood: String!
    customText: String
    moodInterpretation: String!  # Claude's read on your mood
    songs: [Song!]!
    songCount: Int!
    createdAt: String!
  }

  """A preset mood option shown in the app picker"""
  type MoodOption {
    id: ID!
    label: String!
    emoji: String!
    description: String!
    colorHex: String!
    bgColorHex: String!
  }

  """Paginated list of past sessions"""
  type SessionHistory {
    sessions: [RecommendationSession!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  """Input to request music recommendations"""
  input RecommendationInput {
    mood: String!           # e.g. "Happy" or free-text "just got promoted"
    customText: String      # optional extra context
    count: Int              # number of songs (1-15, default 8)
    includeSpotify: Boolean # default true
    includeYoutube: Boolean # default true
  }

  enum EnergyLevel {
    LOW
    MEDIUM
    HIGH
  }

  enum Tempo {
    SLOW
    MODERATE
    FAST
  }

  # ═══════════════════════════════════════════════════════
  # QUERIES  (read-only operations — like GET requests)
  # ═══════════════════════════════════════════════════════

  type Query {
    # ── Auth ──────────────────────────────────────────────
    """Get the currently logged-in user's profile (requires token)"""
    me: User

    # ── Moods ─────────────────────────────────────────────
    """Get all preset mood options for the app picker"""
    moods: [MoodOption!]!

    """Get a single mood option by ID"""
    mood(id: ID!): MoodOption

    # ── Sessions ──────────────────────────────────────────
    """Get a single recommendation session by ID (requires token)"""
    session(id: ID!): RecommendationSession

    """Get the logged-in user's recommendation history (requires token)"""
    myHistory(
      limit: Int   # default 20
      offset: Int  # default 0
    ): SessionHistory!
  }

  # ═══════════════════════════════════════════════════════
  # MUTATIONS  (write operations — like POST/PUT/DELETE)
  # ═══════════════════════════════════════════════════════

  type Mutation {
    # ── Auth ──────────────────────────────────────────────
    """Create a new MoodTunes account"""
    signUp(input: SignUpInput!): AuthPayload!

    """Sign in to an existing account"""
    signIn(input: SignInInput!): AuthPayload!

    # ── Recommendations ───────────────────────────────────
    """
    Ask Claude AI to recommend music for your mood.
    Enriches each song with Spotify and YouTube data.
    Saves the session to your history.
    Requires authentication.
    """
    getRecommendations(input: RecommendationInput!): RecommendationSession!

    """Delete a session from your history (requires token)"""
    deleteSession(id: ID!): Boolean!
  }
`;

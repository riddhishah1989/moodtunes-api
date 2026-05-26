// ═══════════════════════════════════════════════════════════════
// MoodTunes — All Static Data
// ═══════════════════════════════════════════════════════════════

// ── Genres ────────────────────────────────────────────────────
export const GENRES = [
  // Western
  { name: "Pop", emoji: "🎤", description: "Catchy mainstream music" },
  { name: "Hip-Hop", emoji: "🎧", description: "Rap and urban beats" },
  { name: "R&B", emoji: "🎶", description: "Rhythm and blues" },
  { name: "Rock", emoji: "🎸", description: "Guitar-driven rock music" },
  { name: "Electronic", emoji: "🎛️", description: "EDM, house, techno" },
  { name: "Jazz", emoji: "🎷", description: "Smooth jazz and blues" },
  {
    name: "Classical",
    emoji: "🎻",
    description: "Western orchestral and piano",
  },
  { name: "Country", emoji: "🤠", description: "American country and folk" },
  { name: "Indie", emoji: "🌿", description: "Independent alternative music" },
  { name: "Metal", emoji: "🤘", description: "Heavy metal and rock" },
  { name: "Soul", emoji: "💛", description: "Soulful emotional music" },
  { name: "Reggae", emoji: "🌴", description: "Reggae and dancehall" },
  { name: "Latin", emoji: "💃", description: "Latin pop and salsa" },
  { name: "Ambient", emoji: "🌌", description: "Calm atmospheric music" },
  { name: "Acoustic", emoji: "🎵", description: "Acoustic and unplugged" },
  { name: "Funk", emoji: "🕺", description: "Groovy funk music" },
  { name: "Blues", emoji: "😢", description: "Classic blues music" },
  { name: "Gospel", emoji: "🙏", description: "Gospel and worship music" },
  // Indian
  { name: "Bollywood", emoji: "🎬", description: "Indian Hindi film music" },
  {
    name: "Indian Classical",
    emoji: "🪕",
    description: "Hindustani and Carnatic classical",
  },
  { name: "Indian Pop", emoji: "🎙️", description: "Modern Indian pop music" },
  { name: "Bhangra", emoji: "🥁", description: "Punjabi folk and dance music" },
  { name: "Ghazal", emoji: "🌹", description: "Urdu poetic music form" },
  {
    name: "Devotional",
    emoji: "🕉️",
    description: "Indian devotional and bhajans",
  },
  { name: "Sufi", emoji: "✨", description: "Mystical Sufi music" },
  { name: "Tamil", emoji: "🎶", description: "Tamil film and pop music" },
  { name: "Telugu", emoji: "🎵", description: "Telugu film and pop music" },
  { name: "Punjabi", emoji: "🎺", description: "Punjabi pop and folk" },
  { name: "Gujarati", emoji: "🎺", description: "Gujarati film and Garba" },
  {
    name: "Bengali",
    emoji: "🎸",
    description: "Bengali Rabindra Sangeet and pop",
  },
  {
    name: "Rajasthani Folk",
    emoji: "🪘",
    description: "Traditional Rajasthani folk music",
  },
  {
    name: "Indie Indian",
    emoji: "🌿",
    description: "Independent Indian artists",
  },
  // Asian
  { name: "K-Pop", emoji: "🌟", description: "Korean pop music" },
  { name: "K-Drama OST", emoji: "🎭", description: "Korean drama soundtracks" },
  { name: "J-Pop", emoji: "🗼", description: "Japanese pop music" },
  { name: "J-Rock", emoji: "⚡", description: "Japanese rock music" },
  { name: "Mandopop", emoji: "🏮", description: "Mandarin Chinese pop music" },
  { name: "C-Pop", emoji: "🌸", description: "Chinese pop music" },
  { name: "Thai Pop", emoji: "🐘", description: "Thai pop music" },
  { name: "OPM", emoji: "🌺", description: "Original Pilipino Music" },
  {
    name: "Malay Pop",
    emoji: "🌙",
    description: "Malaysian and Indonesian pop",
  },
  // African & Global
  { name: "Afrobeats", emoji: "🪘", description: "African pop and beats" },
  { name: "Afro Pop", emoji: "🌍", description: "African popular music" },
  { name: "Amapiano", emoji: "🎹", description: "South African house music" },
  // Chill & Mood
  {
    name: "Lo-Fi",
    emoji: "☕",
    description: "Chill lo-fi beats to study/relax",
  },
  { name: "Chillout", emoji: "🌊", description: "Relaxing downtempo music" },
  {
    name: "Meditation",
    emoji: "🧘",
    description: "Meditation and mindfulness music",
  },
  { name: "Sleep", emoji: "🌙", description: "Calming music for sleep" },
  { name: "Workout", emoji: "💪", description: "High energy workout music" },
];

// ── Preset Moods ──────────────────────────────────────────────
export const PRESET_MOODS = [
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    description: "Upbeat & joyful",
    colorHex: "#FFD93D",
    bgColorHex: "#1A1500",
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😢",
    description: "Reflective",
    colorHex: "#5B8FD4",
    bgColorHex: "#040810",
  },
  {
    id: "energetic",
    label: "Energetic",
    emoji: "⚡",
    description: "Pumped up",
    colorHex: "#FF6B6B",
    bgColorHex: "#0F0404",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "🌿",
    description: "Peaceful & serene",
    colorHex: "#5DD68A",
    bgColorHex: "#04100A",
  },
  {
    id: "romantic",
    label: "Romantic",
    emoji: "💕",
    description: "Tender & warm",
    colorHex: "#FF63A5",
    bgColorHex: "#0F0408",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    description: "In the zone",
    colorHex: "#4D96FF",
    bgColorHex: "#04060F",
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😤",
    description: "Intense energy",
    colorHex: "#FF4444",
    bgColorHex: "#0F0404",
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😰",
    description: "Overwhelmed",
    colorHex: "#C77DFF",
    bgColorHex: "#0A040F",
  },
];

// ── Gender Options ────────────────────────────────────────────
export const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];

// ── Password Rules ────────────────────────────────────────────
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^])[A-Za-z\d@$!%*?&_#^]{8,}$/;
export const PASSWORD_ERROR =
  "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character. No spaces allowed.";

// ── JWT ───────────────────────────────────────────────────────
export const JWT_EXPIRES_IN = "7d";

// ── API Limits ────────────────────────────────────────────────
export const RECOMMENDATION_MIN_COUNT = 1;
export const RECOMMENDATION_MAX_COUNT = 15;
export const RECOMMENDATION_DEFAULT_COUNT = 8;
export const HISTORY_DEFAULT_LIMIT = 20;

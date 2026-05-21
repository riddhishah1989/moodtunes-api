import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are MoodTunes, an expert music curator.
Recommend songs perfectly matched to the user's emotional state.
Be diverse across genres, eras, and artists.
ALWAYS respond with valid JSON only — no markdown, no extra text.`;

function buildPrompt(mood, customText, count) {
  const moodDesc = customText ? `${mood} — extra context: "${customText}"` : mood;
  return `The user feels: ${moodDesc}

Recommend exactly ${count} songs. Respond ONLY with this JSON:
{
  "mood_interpretation": "one sentence about their mood",
  "recommendations": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "genre": "Genre",
      "year": 2020,
      "reason": "Why this fits the mood (1-2 sentences)",
      "energy_level": "low|medium|high",
      "tempo": "slow|moderate|fast",
      "spotify_query": "song title artist name",
      "youtube_query": "song title artist name official audio"
    }
  ]
}`;
}

export async function getAIRecommendations(mood, customText, count = 8) {
  const message = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: buildPrompt(mood, customText, count) }],
  });

  const raw     = message.content[0]?.text ?? '';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }

  if (!parsed.recommendations?.length) {
    throw new Error('No recommendations returned. Please try again.');
  }

  return {
    moodInterpretation: parsed.mood_interpretation,
    songs:              parsed.recommendations,
  };
}

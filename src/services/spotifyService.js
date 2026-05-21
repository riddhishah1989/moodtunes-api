import axios from 'axios';

let cachedToken = null;
let tokenExpiry  = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const creds    = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cachedToken  = response.data.access_token;
  tokenExpiry  = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function searchSpotifyTrack(query) {
  try {
    const token    = await getToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params:  { q: query, type: 'track', limit: 1, market: 'US' },
    });

    const track = response.data.tracks?.items?.[0];
    if (!track) return null;

    return {
      spotifyUrl:        track.external_urls.spotify,
      spotifyPreviewUrl: track.preview_url,
      albumArt:          track.album.images?.[0]?.url,
      albumArtThumb:     track.album.images?.[2]?.url,
      popularity:        track.popularity,
    };
  } catch {
    return null; // Gracefully fail — song still shows without Spotify data
  }
}

export async function enrichWithSpotify(songs) {
  return Promise.all(
    songs.map(async (song) => {
      const data = await searchSpotifyTrack(song.spotify_query);
      return { ...song, ...data };
    })
  );
}

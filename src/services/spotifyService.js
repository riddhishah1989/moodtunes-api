import axios from "axios";

let cachedToken = null;
let tokenExpiry  = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const creds    = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function searchSpotifyTrack(query, limit = 1) {
  try {
    const token    = await getToken();
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params:  { q: query, type: "track", limit, market: "US" },
    });
    const items = response.data.tracks?.items;
    if (!items?.length) return null;

    // Return array if limit > 1, single object if limit === 1
    const format = (track) => ({
      spotify_id:         track.id,
      spotify_url:        track.external_urls.spotify,
      preview_url:        track.preview_url,
      album_art:          track.album.images?.[0]?.url,
      album_art_thumb:    track.album.images?.[2]?.url,
      title:              track.name,
      artist:             track.artists?.[0]?.name,
      album:              track.album.name,
      duration_ms:        track.duration_ms,
      popularity:         track.popularity,
      explicit:           track.explicit,
    });

    return limit === 1 ? format(items[0]) : items.map(format);
  } catch {
    return null;
  }
}

export async function enrichWithSpotify(songs) {
  return Promise.all(
    songs.map(async (song) => {
      const data = await searchSpotifyTrack(song.spotify_query);
      return {
        ...song,
        spotifyUrl:        data?.spotify_url,
        spotifyPreviewUrl: data?.preview_url,
        albumArt:          data?.album_art,
        albumArtThumb:     data?.album_art_thumb,
        popularity:        data?.popularity,
      };
    })
  );
}

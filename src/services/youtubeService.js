import axios from 'axios';

export async function searchYouTubeVideo(query) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key:             process.env.YOUTUBE_API_KEY,
        q:               query,
        part:            'snippet',
        type:            'video',
        videoCategoryId: '10', // Music category
        maxResults:      1,
        safeSearch:      'moderate',
      },
    });

    const item = response.data.items?.[0];
    if (!item) return null;

    const videoId = item.id.videoId;
    return {
      youtubeUrl:       `https://www.youtube.com/watch?v=${videoId}`,
      youtubeThumbnail: item.snippet.thumbnails?.medium?.url,
      youtubeTitle:     item.snippet.title,
    };
  } catch {
    return null; // Gracefully fail
  }
}

export async function enrichWithYouTube(songs) {
  return Promise.all(
    songs.map(async (song) => {
      const data = await searchYouTubeVideo(song.youtube_query);
      return { ...song, ...data };
    })
  );
}

import axios from "axios";

export async function searchYouTubeVideo(query, limit = 1) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: query,
          part: "snippet",
          type: "video",
          videoCategoryId: "10",
          maxResults: limit,
          safeSearch: "moderate",
        },
      },
    );

    const items = response.data.items;
    if (!items?.length) return null;

    const format = (item) => ({
      youtube_video_id: item.id.videoId,
      youtube_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      youtube_thumbnail: item.snippet.thumbnails?.medium?.url,
      youtube_title: item.snippet.title,
      channel_name: item.snippet.channelTitle,
    });

    return limit === 1 ? format(items[0]) : items.map(format);
  } catch {
    return null;
  }
}

export async function enrichWithYouTube(songs) {
  return Promise.all(
    songs.map(async (song) => {
      const data = await searchYouTubeVideo(song.youtube_query);
      return {
        ...song,
        youtubeUrl: data?.youtube_url,
        youtubeThumbnail: data?.youtube_thumbnail,
        youtubeTitle: data?.youtube_title,
      };
    }),
  );
}

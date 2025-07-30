export const extractVideoIdFromUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoIdFromUrl(url) !== null;
};

export const formatVideoId = (videoId: string): string => {
  return videoId.length > 20 ? `${videoId.substring(0, 20)}...` : videoId;
};
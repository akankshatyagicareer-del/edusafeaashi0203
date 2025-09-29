const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'your_youtube_api_key';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const searchVideos = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: `disaster preparedness ${query}`,
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY
      }
    });
    
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
};

const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });
    
    return response.data.items[0];
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
};

module.exports = { searchVideos, getVideoDetails };
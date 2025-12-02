import axios from 'axios';

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  params: {
    // Some endpoints might still require api_key if token isn't enough, but Bearer usually works
    // api_key: API_KEY 
  }
});

export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
  try {
    const response = await api.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return [];
  }
};

export const getDetails = async (mediaType, id) => {
  try {
    const response = await api.get(`/${mediaType}/${id}`, {
      params: {
        append_to_response: 'credits,videos,similar'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error);
    return null;
  }
};

export const searchContent = async (query) => {
  try {
    const response = await api.get('/search/multi', {
      params: { query }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
};

export const getTopRated = async (mediaType = 'movie') => {
  try {
    const response = await api.get(`/${mediaType}/top_rated`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching top rated ${mediaType}:`, error);
    return [];
  }
};

export const getUpcoming = async () => {
  try {
    const response = await api.get('/movie/upcoming');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

export const getImageUrl = (path, size = 'original') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default api;

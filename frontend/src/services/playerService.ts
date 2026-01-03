import { API_BASE } from '../utils/constants';
import { authService } from './authService';

// Helper function to get headers with auth token
const getHeaders = async (): Promise<HeadersInit> => {
  const token = await authService.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const sendCommand = async (cmd: string): Promise<void> => {
  try {
    const headers = await getHeaders();
    await fetch(`${API_BASE}/api/player/command`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ command: cmd })
    });
    console.log('Command sent:', cmd);
  } catch (error) {
    console.error('Failed to send command:', error);
  }
};

export const loadSongs = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/player/songs`, { headers });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to load songs:', error);
    return [];
  }
};

export const loadSongsByCategory = async (category: string) => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/player/songs/category/${encodeURIComponent(category)}`, { headers });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to load songs for category ${category}:`, error);
    return [];
  }
};

export const getRecentlyPlayed = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/player/recently-played`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch recently played: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to load recently played:', error);
    return [];
  }
};

// Favorites API
export const getFavorites = async () => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/favorites`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch favorites: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
};

export const addFavorite = async (songId: number): Promise<boolean> => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/favorites/${songId}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      throw new Error(`Failed to add favorite: ${res.status}`);
    }
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return false;
  }
};

export const removeFavorite = async (songId: number): Promise<boolean> => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/favorites/${songId}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) {
      throw new Error(`Failed to remove favorite: ${res.status}`);
    }
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return false;
  }
};

export const checkFavorite = async (songId: number): Promise<boolean> => {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/api/favorites/check/${songId}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to check favorite: ${res.status}`);
    }
    const data = await res.json();
    return data.isFavorite;
  } catch (error) {
    console.error('Failed to check favorite:', error);
    return false;
  }
};


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


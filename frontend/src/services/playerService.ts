import { API_BASE } from '../utils/constants';

export const sendCommand = async (cmd: string): Promise<void> => {
  try {
    await fetch(`${API_BASE}/api/player/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    console.log('Command sent:', cmd);
  } catch (error) {
    console.error('Failed to send command:', error);
  }
};

export const loadSongs = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/player/songs`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to load songs:', error);
    return [];
  }
};

export const loadSongsByCategory = async (category: string) => {
  try {
    const res = await fetch(`${API_BASE}/api/player/songs/category/${encodeURIComponent(category)}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to load songs for category ${category}:`, error);
    return [];
  }
};

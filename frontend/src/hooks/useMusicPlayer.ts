import { useState, useEffect, useRef, useCallback } from 'react';
import { Song, ServerState } from '../types/music.types';
import { API_BASE } from '../utils/constants';
import { loadSongs as fetchSongs } from '../services/playerService';

export const useMusicPlayer = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);
  const [repeatEnabled, setRepeatEnabled] = useState<boolean>(false);
  const [songTitle, setSongTitle] = useState<string>('Song Name');
  const [songArtist, setSongArtist] = useState<string>('Artist Name');
  const [coverUrl, setCoverUrl] = useState<string>('/cover/better-day.png');

  const audioRef = useRef<HTMLAudioElement>(null);
  const songsRef = useRef<Song[]>([]);

  // Load songs
  const loadSongs = useCallback(async () => {
    const data = await fetchSongs();
    setSongs(data);
    songsRef.current = data;
    console.log('Songs loaded:', data);
    
    // Set the first song immediately on load
    if (data && data.length > 0) {
      const firstSong = data[0];
      setCurrentSong(firstSong);
      setSongTitle(firstSong.title || 'Song Name');
      setSongArtist(firstSong.artist || 'Artist Name');
      
      // Set cover URL with backend base
      if (firstSong.coverUrl) {
        const fullCoverUrl = firstSong.coverUrl.startsWith('http') 
          ? firstSong.coverUrl 
          : `${API_BASE}${firstSong.coverUrl}`;
        setCoverUrl(fullCoverUrl);
      }
    }
  }, []);

  // Update state from server
  const updateStateFromServer = useCallback((data: ServerState) => {
    console.log('Server state update:', data);
    
    setSongTitle(data.title);
    setSongArtist(data.artist);
    setShuffleEnabled(data.shuffle);
    setRepeatEnabled(data.repeat);
    setVolume(data.volume);
    setIsMuted(data.isMuted);

    // Apply volume changes to audio element
    if (audioRef.current) {
      audioRef.current.volume = data.isMuted ? 0 : data.volume / 100;
    }

    // Use ref to get current songs array
    const song = songsRef.current.find(s => s.id === data.currentSongId);
    if (song) {
      setCurrentSong(song);
      
      // Update cover URL with fallback
      if (song.coverUrl) {
        const fullCoverUrl = song.coverUrl.startsWith('http') 
          ? song.coverUrl 
          : `${API_BASE}${song.coverUrl}`;
        setCoverUrl(fullCoverUrl);
      } else {
        setCoverUrl(`${API_BASE}/cover/better-day.jpg`);
      }

      // Update audio source if different
      if (audioRef.current && song.srcUrl) {
        const currentSrc = audioRef.current.src;
        const newSrc = song.srcUrl.startsWith('http') ? song.srcUrl : `${API_BASE}${song.srcUrl}`;
        
        if (currentSrc !== newSrc) {
          const wasPlaying = !audioRef.current.paused;
          audioRef.current.src = newSrc;
          
          if (data.isPlaying || wasPlaying) {
            audioRef.current.load();
            safePlay();
          }
        }
      }
    }

    // Sync play/pause state
    setIsPlaying(data.isPlaying);
    
    if (data.isPlaying && audioRef.current?.paused) {
      safePlay();
    } else if (!data.isPlaying && !audioRef.current?.paused) {
      audioRef.current?.pause();
    }

    // Handle seek forward from ESP32 controller
    if (data.lastCommand === 'SEEK_FORWARD' && audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  }, []);

  const safePlay = useCallback(() => {
    audioRef.current?.play().catch((error: Error) => {
      console.warn('Autoplay blocked – waiting for user interaction.', error);
    });
  }, []);

  // SSE Connection
  const connectSSE = useCallback(() => {
    const eventSource = new EventSource(`${API_BASE}/api/player/stream`);

    eventSource.onmessage = (event: MessageEvent) => {
      const data: ServerState = JSON.parse(event.data);
      updateStateFromServer(data);
    };

    eventSource.onerror = () => {
      console.warn('SSE connection lost – reconnecting...');
      eventSource.close();
      setTimeout(connectSSE, 2000);
    };

    return () => eventSource.close();
  }, [updateStateFromServer]);

  // Update songsRef when songs change
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  return {
    // State
    songs,
    currentSong,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    shuffleEnabled,
    repeatEnabled,
    songTitle,
    songArtist,
    coverUrl,
    
    // Setters
    setIsPlaying,
    setIsMuted,
    setVolume,
    setCurrentTime,
    setDuration,
    
    // Refs
    audioRef,
    
    // Functions
    loadSongs,
    connectSSE,
    safePlay,
  };
};

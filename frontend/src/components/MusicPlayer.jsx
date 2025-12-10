import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [songTitle, setSongTitle] = useState('Song Name');
  const [songArtist, setSongArtist] = useState('Artist Name');
  const [coverUrl, setCoverUrl] = useState('/cover/better-day.png');

  const audioRef = useRef(null);
  const progressSliderRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const songsRef = useRef([]);

  // API base URL
  const API_BASE = 'http://localhost:8080';

  // Load songs on component mount
  useEffect(() => {
    loadSongs();
    connectSSE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update songsRef when songs change
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  // Update slider backgrounds when values change
  useEffect(() => {
    if (progressSliderRef.current) {
      updateSliderBackground(progressSliderRef.current, currentTime, 0, duration);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (volumeSliderRef.current) {
      updateSliderBackground(volumeSliderRef.current, volume, 0, 100);
    }
  }, [volume]);

  const loadSongs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/player/songs`);
      const data = await res.json();
      setSongs(data);
      songsRef.current = data;
      console.log('Songs loaded:', data);
    } catch (error) {
      console.error('Failed to load songs:', error);
    }
  };

  const sendCommand = async (cmd) => {
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

  const connectSSE = () => {
    const eventSource = new EventSource(`${API_BASE}/api/player/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateStateFromServer(data);
    };

    eventSource.onerror = () => {
      console.warn('SSE connection lost – reconnecting...');
      eventSource.close();
      setTimeout(connectSSE, 2000);
    };

    return () => eventSource.close();
  };

  const updateStateFromServer = (data) => {
    console.log('Server state update:', data);
    
    setSongTitle(data.title);
    setSongArtist(data.artist);
    setShuffleEnabled(data.shuffle);
    setRepeatEnabled(data.repeat);
    setVolume(data.volume);
    setIsMuted(data.isMuted);

    // Use ref to get current songs array
    const song = songsRef.current.find(s => s.id === data.currentSongId);
    if (song) {
      setCurrentSong(song);
      
    // Update cover URL with fallback - prepend backend URL for absolute paths
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
  };

  const safePlay = () => {
    audioRef.current?.play().catch((error) => {
      console.warn('Autoplay blocked – waiting for user interaction.', error);
    });
  };

  const handlePlayPause = async () => {
    if (audioRef.current?.paused) {
      await sendCommand('PLAY');
    } else {
      await sendCommand('PAUSE');
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    sendCommand(`VOLUME:${newVolume}`);
  };

  const handleMute = () => {
    sendCommand('MUTE');
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    sendCommand('NEXT');
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const updateSliderBackground = (slider, value, min, max) => {
    if (!slider) return;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, hotpink 0%, hotpink ${percentage}%, white ${percentage}%, white 100%)`;
  };

  return (
    <div className="container">
      <div className="cover">
        <img id="cover-art" src={coverUrl} alt="Album Cover" />
      </div>

      <div className="song-name">
        <h1>{songTitle}</h1>
      </div>

      <div className="artist-name">
        <p>{songArtist}</p>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="progress-bar">
        <span>{formatTime(currentTime)}</span>
        <input
          ref={progressSliderRef}
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="volume-control">
        <i
          className={`fa-solid ${isMuted || volume === 0 ? 'fa-volume-xmark' : 'fa-volume-up'}`}
          onClick={handleMute}
        />
        <input
          ref={volumeSliderRef}
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
        <span style={{ minWidth: '40px' }}></span>
      </div>

      <div className="buttons">
        <div className="buttons-row">
          <button
            id="shuffle-btn"
            onClick={() => sendCommand('SHUFFLE')}
            style={{ opacity: shuffleEnabled ? '1' : '0.3' }}
          >
            <i className="fa-solid fa-shuffle"></i>
          </button>
          <button className="prev-next-btn" onClick={() => sendCommand('PREV')}>
            <i className="fa-solid fa-backward"></i>
          </button>
          <button className="play-button" onClick={handlePlayPause}>
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <button className="prev-next-btn" onClick={() => sendCommand('NEXT')}>
            <i className="fa-solid fa-forward"></i>
          </button>
          <button
            id="repeat-btn"
            onClick={() => sendCommand('REPEAT')}
            style={{ opacity: repeatEnabled ? '1' : '0.3' }}
          >
            <i className="fa-solid fa-repeat"></i>
          </button>
        </div>
      </div>

      <div className="grafana-text">
        <a
          href="http://localhost:3000/d/adcnd7x/music-remote-esp32?orgId=1&from=now-30d&to=now&timezone=browser&kiosk=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3>View Statistics in Grafana</h3>
          <img
            src="http://localhost:3000/public/build/static/img/grafana_icon.1e0deb6b.svg"
            alt="Grafana Dashboard"
            className="grafana-icon"
          />
        </a>
      </div>
    </div>
  );
};

export default MusicPlayer;
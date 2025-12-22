/* eslint-disable unicode-bom */
import React, { useEffect, useRef } from 'react';
import './MusicPlayer.css';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { sendCommand } from '../services/playerService';
import { updateSliderBackground } from '../utils/helpers';
import { SongInfo } from './player/SongInfo';
import { PlayerControls } from './player/PlayerControls';
import { ProgressBar } from './player/ProgressBar';
import { PlayerRightSection } from './player/PlayerRightSection';

const MusicPlayer: React.FC = () => {
  const {
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
    setIsPlaying,
    setIsMuted,
    setVolume,
    setCurrentTime,
    setDuration,
    audioRef,
    loadSongs,
    connectSSE,
    safePlay,
  } = useMusicPlayer();

  const progressSliderRef = useRef<HTMLInputElement | null>(null);
  const volumeSliderRef = useRef<HTMLInputElement | null>(null);

  // Load songs and connect SSE on mount
  useEffect(() => {
    loadSongs();
    connectSSE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Event handlers
  const handlePlayPause = async (): Promise<void> => {
    if (isMuted && audioRef.current?.paused) {
      await sendCommand('MUTE');
    }
    
    if (audioRef.current?.paused) {
      await sendCommand('PLAY');
    } else {
      await sendCommand('PAUSE');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    sendCommand(`VOLUME:${newVolume}`);
  };

  const handleMute = (): void => {
    sendCommand('MUTE');
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleTimeUpdate = (): void => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = (): void => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = (): void => {
    sendCommand('NEXT');
  };

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <SongInfo
        coverUrl={coverUrl}
        songTitle={songTitle}
        songArtist={songArtist}
      />

      <div className="player-center">
        <PlayerControls
          shuffleEnabled={shuffleEnabled}
          isPlaying={isPlaying}
          repeatEnabled={repeatEnabled}
          currentSong={currentSong}
          onPlayPause={handlePlayPause}
        />
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          progressSliderRef={progressSliderRef}
          onProgressChange={handleProgressChange}
        />
      </div>

      <PlayerRightSection
        volume={volume}
        isMuted={isMuted}
        volumeSliderRef={volumeSliderRef}
        onVolumeChange={handleVolumeChange}
        onMute={handleMute}
      />
    </div>
  );
};

export default MusicPlayer;

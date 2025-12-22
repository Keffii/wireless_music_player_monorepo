import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShuffle,
  faBackwardStep,
  faPlay,
  faPause,
  faForwardStep,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { sendCommand } from '../../services/playerService';
import { useFavorites } from '../../context/FavoritesContext';
import { Song } from '../../types/music.types';

interface PlayerControlsProps {
  shuffleEnabled: boolean;
  isPlaying: boolean;
  repeatEnabled: boolean;
  currentSong: Song | null;
  onPlayPause: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  shuffleEnabled,
  isPlaying,
  repeatEnabled,
  currentSong,
  onPlayPause,
}) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = (): void => {
    if (!currentSong) return;
    
    if (isFavorite(currentSong.id)) {
      removeFavorite(currentSong.id);
    } else {
      addFavorite(currentSong);
    }
  };

  return (
    <div className="player-controls">
      <button
        onClick={() => sendCommand('SHUFFLE')}
        className={shuffleEnabled ? 'active' : ''}
        title="Shuffle"
      >
        <FontAwesomeIcon icon={faShuffle} size="xl" />
      </button>
      <button onClick={() => sendCommand('PREV')} title="Previous">
        <FontAwesomeIcon icon={faBackwardStep} size="xl" />
      </button>
      <button className="play-button" onClick={onPlayPause} title={isPlaying ? 'Pause' : 'Play'}>
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="2xl" />
      </button>
      <button onClick={() => sendCommand('NEXT')} title="Next">
        <FontAwesomeIcon icon={faForwardStep} size="xl" />
      </button>
      <button
        onClick={() => sendCommand('REPEAT')}
        className={repeatEnabled ? 'active' : ''}
        title="Repeat"
      >
        <FontAwesomeIcon icon={faRepeat} size="xl" />
      </button>
      <button
        onClick={handleToggleFavorite}
        className={currentSong && isFavorite(currentSong.id) ? 'active' : ''}
        title={currentSong && isFavorite(currentSong.id) ? 'Remove from Favorites' : 'Add to Favorites'}
      >
        <FontAwesomeIcon icon={currentSong && isFavorite(currentSong.id) ? faHeartSolid : faHeartRegular} size="xl" />
      </button>
    </div>
  );
};

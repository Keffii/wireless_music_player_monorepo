import React from 'react';
import { formatTime } from '../../utils/helpers';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  progressSliderRef: React.RefObject<HTMLInputElement | null>;
  onProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  progressSliderRef,
  onProgressChange,
}) => {
  return (
    <div className="player-progress-container">
      <span className="player-time">{formatTime(currentTime)}</span>
      <input
        ref={progressSliderRef}
        className="progress-slider"
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={onProgressChange}
      />
      <span className="player-time">{formatTime(duration)}</span>
    </div>
  );
};

import React from 'react';

interface SongInfoProps {
  coverUrl: string;
  songTitle: string;
  songArtist: string;
}

export const SongInfo: React.FC<SongInfoProps> = ({
  coverUrl,
  songTitle,
  songArtist,
}) => {
  return (
    <div className="player-left">
      <div className="player-album-art">
        <img src={coverUrl} alt="Album Cover" />
      </div>
      <div className="player-song-info">
        <div className="player-song-title">{songTitle}</div>
        <div className="player-song-artist">{songArtist}</div>
      </div>
    </div>
  );
};

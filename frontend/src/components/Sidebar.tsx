import React from 'react';
import './Sidebar.css';
import { useFavorites } from '../context/FavoritesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faHome, faSearch, faBook, faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';

const Sidebar: React.FC = () => {
  const { favorites } = useFavorites();
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FontAwesomeIcon icon={faMusic} className="sidebar-logo" />
        <h1>MusicBox</h1>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active">
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        <button className="nav-item">
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
        <button className="nav-item">
          <FontAwesomeIcon icon={faBook} />
          <span>Your Library</span>
        </button>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>PLAYLISTS</h3>
          <FontAwesomeIcon icon={faPlus} />
        </div>
        <ul className="playlist-list">
          <li className="playlist-item">
            <FontAwesomeIcon icon={faMusic} />
            <div>
              <div className="playlist-name">My Playlist #1</div>
              <div className="playlist-count">24 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <FontAwesomeIcon icon={faMusic} />
            <div>
              <div className="playlist-name">Chill Vibes</div>
              <div className="playlist-count">18 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <FontAwesomeIcon icon={faMusic} />
            <div>
              <div className="playlist-name">Workout Mix</div>
              <div className="playlist-count">32 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <FontAwesomeIcon icon={faMusic} />
            <div>
              <div className="playlist-name">Late Night</div>
              <div className="playlist-count">15 songs</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>
            <FontAwesomeIcon icon={faHeart} /> FAVORITES
          </h3>
        </div>
        <ul className="favorites-list">
          {favorites.length === 0 ? (
            <li className="favorite-item empty">
              <div className="favorite-name" style={{ opacity: 0.5 }}>No favorites yet</div>
            </li>
          ) : (
            favorites.map(song => (
              <li key={song.id} className="favorite-item">
                {song.coverUrl && (
                  <img 
                    src={song.coverUrl} 
                    alt={song.title}
                    className="favorite-cover"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                      marginRight: '10px'
                    }}
                  />
                )}
                <div>
                  <div className="favorite-name">{song.title}</div>
                  <div className="favorite-artist">{song.artist}</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

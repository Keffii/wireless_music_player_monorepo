import React from 'react';
import './Sidebar.css';
import { useFavorites } from '../context/FavoritesContext';

const Sidebar: React.FC = () => {
  const { favorites } = useFavorites();
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <i className="fa-solid fa-music sidebar-logo"></i>
        <h1>MusicBox</h1>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active">
          <i className="fa-solid fa-home"></i>
          <span>Home</span>
        </button>
        <button className="nav-item">
          <i className="fa-solid fa-search"></i>
          <span>Search</span>
        </button>
        <button className="nav-item">
          <i className="fa-solid fa-book"></i>
          <span>Your Library</span>
        </button>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>PLAYLISTS</h3>
          <i className="fa-solid fa-plus"></i>
        </div>
        <ul className="playlist-list">
          <li className="playlist-item">
            <i className="fa-solid fa-music"></i>
            <div>
              <div className="playlist-name">My Playlist #1</div>
              <div className="playlist-count">24 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <i className="fa-solid fa-music"></i>
            <div>
              <div className="playlist-name">Chill Vibes</div>
              <div className="playlist-count">18 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <i className="fa-solid fa-music"></i>
            <div>
              <div className="playlist-name">Workout Mix</div>
              <div className="playlist-count">32 songs</div>
            </div>
          </li>
          <li className="playlist-item">
            <i className="fa-solid fa-music"></i>
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
            <i className="fa-solid fa-heart"></i> FAVORITES
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
                <div className="favorite-checkbox"></div>
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

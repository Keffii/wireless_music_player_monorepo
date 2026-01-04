import React, { useState } from 'react';
import './Sidebar.css';
import { useFavorites } from '../context/FavoritesContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faHome, faSearch, faPlus, faHeart, faSignOutAlt, faUser, faTrash } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  onNavigate: (view: 'home' | 'category' | 'search' | 'playlist') => void;
  currentView: 'home' | 'category' | 'search' | 'playlist';
  onPlaylistClick?: (playlistId: number, playlistName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, onPlaylistClick }) => {
  const { favorites } = useFavorites();
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const { user, signOut } = useAuth();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      const success = await createPlaylist(newPlaylistName.trim());
      if (success) {
        setNewPlaylistName('');
        setShowCreatePlaylist(false);
      }
    }
  };

  const handleDeletePlaylist = async (playlistId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(playlistId);
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FontAwesomeIcon icon={faMusic} className="sidebar-logo" />
        <h1>MusicBox</h1>
      </div>

      <nav className="sidebar-nav">
        <button className={`nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </button>
        <button className={`nav-item ${currentView === 'search' ? 'active' : ''}`} onClick={() => onNavigate('search')}>
          <FontAwesomeIcon icon={faSearch} />
          <span>Search</span>
        </button>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>PLAYLISTS</h3>
          <FontAwesomeIcon 
            icon={faPlus} 
            onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
            style={{ cursor: 'pointer' }}
          />
        </div>
        {showCreatePlaylist && (
          <div style={{ padding: '8px 0' }}>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--foreground)',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
        )}
        <ul className="playlist-list">
          {playlists.length === 0 ? (
            <li className="playlist-item" style={{ opacity: 0.5 }}>
              <FontAwesomeIcon icon={faMusic} />
              <div>
                <div className="playlist-name">No playlists yet</div>
                <div className="playlist-count">Click + to create one</div>
              </div>
            </li>
          ) : (
            playlists.map(playlist => (
              <li 
                key={playlist.id} 
                className="playlist-item" 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => {
                  if (onPlaylistClick) {
                    onPlaylistClick(playlist.id, playlist.name);
                  }
                }}
              >
                <FontAwesomeIcon icon={faMusic} />
                <div style={{ flex: 1 }}>
                  <div className="playlist-name">{playlist.name}</div>
                  <div className="playlist-count">{playlist.songCount} songs</div>
                </div>
                <FontAwesomeIcon 
                  icon={faTrash} 
                  onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                  style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                />
              </li>
            ))
          )}
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

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'User'}</div>
          </div>
        </div>
        <button className="sign-out-button" onClick={signOut}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

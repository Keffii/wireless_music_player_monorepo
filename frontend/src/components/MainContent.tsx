import React, { useState, useEffect } from 'react';
import './MainContent.css';
import { loadSongsByCategory } from '../services/playerService';
import { Song } from '../types/music.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine, faCompass } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../context/AuthContext';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'home' | 'category'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySongs, setCategorySongs] = useState<Song[]>([]);

  const handleCategoryClick = async (category: string) => {
    setSelectedCategory(category);
    setViewMode('category');
    const songs = await loadSongsByCategory(category);
    setCategorySongs(songs);
    console.log(`${category} songs:`, songs);
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setSelectedCategory(null);
    setCategorySongs([]);
  };

  // Category Page View
  if (viewMode === 'category' && selectedCategory) {
    return (
      <div className="main-content">
        <div className="greeting-section">
          <button 
            onClick={handleBackToHome}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Home
          </button>
          <h1>{selectedCategory}</h1>
          <p>{categorySongs.length} song{categorySongs.length !== 1 ? 's' : ''} available</p>
        </div>

        {categorySongs.length > 0 ? (
          <section className="content-section">
            <div className="card-grid">
              {categorySongs.map((song) => (
                <div key={song.id} className="music-card">
                  <div className="card-image">
                    <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                  <div className="card-info">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="content-section">
            <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No songs found in this category</p>
          </section>
        )}
      </div>
    );
  }

  // Home Page View
  return (
    <div className="main-content">
      <div className="greeting-section">
        <h1>Hi, {user?.username || 'User'}</h1>
        <p>Welcome back! Here's what's playing.</p>
      </div>

      <section className="content-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faClock} />
          <h2>Recently Played</h2>
        </div>
        <div className="card-grid">
          <div className="music-card">
            <div className="card-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="card-info">
              <h3>Better Day</h3>
              <p>Artist One</p>
            </div>
          </div>
          <div className="music-card">
            <div className="card-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="card-info">
              <h3>Night Vibes</h3>
              <p>Artist Two</p>
            </div>
          </div>
          <div className="music-card">
            <div className="card-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="card-info">
              <h3>Summer Breeze</h3>
              <p>Artist Three</p>
            </div>
          </div>
          <div className="music-card">
            <div className="card-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="card-info">
              <h3>City Lights</h3>
              <p>Artist Four</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faChartLine} />
          <h2>Made For You</h2>
        </div>
        <div className="recommendation-grid">
          <div className="recommendation-card">
            <div className="rec-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="rec-info">
              <h3>Daily Mix 1</h3>
              <p>Based on your listening</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="rec-info">
              <h3>Discover New Songs</h3>
              <p>New music for you</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="rec-info">
              <h3>New Releases</h3>
              <p>Latest releases</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title">
          <FontAwesomeIcon icon={faCompass} />
          <h2>Browse</h2>
        </div>
        <div className="browse-grid">
          <div 
            className="browse-category" 
            style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', cursor: 'pointer' }}
            onClick={() => handleCategoryClick('Pop')}
          >
            <h3>Pop</h3>
          </div>
          <div 
            className="browse-category" 
            style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', cursor: 'pointer' }}
            onClick={() => handleCategoryClick('Rock')}
          >
            <h3>Rock</h3>
          </div>
          <div 
            className="browse-category" 
            style={{ background: 'linear-gradient(135deg, #d35400, #e67e22)', cursor: 'pointer' }}
            onClick={() => handleCategoryClick('Hip Hop')}
          >
            <h3>Hip Hop</h3>
          </div>
          <div 
            className="browse-category" 
            style={{ background: 'linear-gradient(135deg, #16a085, #1abc9c)', cursor: 'pointer' }}
            onClick={() => handleCategoryClick('Electronic')}
          >
            <h3>Electronic</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainContent;

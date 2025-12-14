import React from 'react';
import './MainContent.css';

const MainContent: React.FC = () => {
  return (
    <div className="main-content">
      <div className="greeting-section">
        <h1>Hi, USER_NAME</h1>
        <p>Welcome back! Here's what's playing.</p>
      </div>

      <section className="content-section">
        <div className="section-title">
          <i className="fa-regular fa-clock"></i>
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
          <i className="fa-solid fa-chart-line"></i>
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
              <h3>Discover Weekly</h3>
              <p>New music for you</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="rec-info">
              <h3>Release Radar</h3>
              <p>Latest releases</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title">
          <i className="fa-solid fa-compass"></i>
          <h2>Browse</h2>
        </div>
        <div className="browse-grid">
          <div className="browse-category" style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)' }}>
            <h3>Pop</h3>
          </div>
          <div className="browse-category" style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)' }}>
            <h3>Rock</h3>
          </div>
          <div className="browse-category" style={{ background: 'linear-gradient(135deg, #d35400, #e67e22)' }}>
            <h3>Hip Hop</h3>
          </div>
          <div className="browse-category" style={{ background: 'linear-gradient(135deg, #16a085, #1abc9c)' }}>
            <h3>Electronic</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainContent;

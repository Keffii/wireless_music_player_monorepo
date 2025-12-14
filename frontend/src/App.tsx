import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="app-container">
        <Sidebar />
        <MainContent />
      </div>
      <MusicPlayer />
    </div>
  );
};

export default App;
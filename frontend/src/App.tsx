import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MusicPlayer from './components/MusicPlayer';
import { FavoritesProvider } from './context/FavoritesContext';

const App: React.FC = () => {
  return (
    <FavoritesProvider>
      <div className="App">
        <div className="app-container">
          <Sidebar />
          <MainContent />
        </div>
        <MusicPlayer />
      </div>
    </FavoritesProvider>
  );
};

export default App;
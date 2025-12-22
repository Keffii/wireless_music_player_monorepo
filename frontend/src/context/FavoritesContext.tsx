import React, { createContext, useContext, useState, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  srcUrl: string;
  coverUrl: string;
}

interface FavoritesContextType {
  favorites: Song[];
  addFavorite: (song: Song) => void;
  removeFavorite: (songId: number) => void;
  isFavorite: (songId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Song[]>(() => {
    // Load favorites from localStorage on initial render
    const saved = localStorage.getItem('musicbox-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('musicbox-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (song: Song) => {
    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(s => s.id === song.id)) {
        return prev;
      }
      return [...prev, song];
    });
  };

  const removeFavorite = (songId: number) => {
    setFavorites(prev => prev.filter(s => s.id !== songId));
  };

  const isFavorite = (songId: number): boolean => {
    return favorites.some(s => s.id === songId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

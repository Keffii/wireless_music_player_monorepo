import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFavorites as apiFetchFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '../services/playerService';

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
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load favorites from backend when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        // User logged out - clear favorites
        setFavorites([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiFetchFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Failed to load favorites:', error);
        // Fallback to localStorage for offline/error scenarios
        const saved = localStorage.getItem(`musicbox-favorites-${user.userId}`);
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // Backup to localStorage whenever favorites change (offline fallback)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`musicbox-favorites-${user.userId}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addFavorite = async (song: Song) => {
    // Optimistic update - add to UI immediately
    setFavorites(prev => {
      if (prev.some(s => s.id === song.id)) {
        return prev;
      }
      return [...prev, song];
    });

    // Sync with backend
    try {
      const success = await apiAddFavorite(song.id);
      if (!success) {
        // Rollback on failure
        setFavorites(prev => prev.filter(s => s.id !== song.id));
        console.error('Failed to add favorite to backend');
      }
    } catch (error) {
      // Rollback on error
      setFavorites(prev => prev.filter(s => s.id !== song.id));
      console.error('Error adding favorite:', error);
    }
  };

  const removeFavorite = async (songId: number) => {
    // Optimistic update - remove from UI immediately
    const previousFavorites = favorites;
    setFavorites(prev => prev.filter(s => s.id !== songId));

    // Sync with backend
    try {
      const success = await apiRemoveFavorite(songId);
      if (!success) {
        // Rollback on failure
        setFavorites(previousFavorites);
        console.error('Failed to remove favorite from backend');
      }
    } catch (error) {
      // Rollback on error
      setFavorites(previousFavorites);
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorite = (songId: number): boolean => {
    return favorites.some(s => s.id === songId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, isLoading }}>
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

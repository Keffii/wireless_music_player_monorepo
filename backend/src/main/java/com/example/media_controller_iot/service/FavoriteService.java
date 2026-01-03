package com.example.media_controller_iot.service;

import com.example.media_controller_iot.models.Favorite;
import com.example.media_controller_iot.models.Songs;
import com.example.media_controller_iot.repository.FavoriteRepository;
import com.example.media_controller_iot.repository.SongsRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private SongsRepo songsRepo;
    
    /**
     * Get all favorite songs for a user
     */
    public List<Songs> getUserFavorites(String userId) {
        return favoriteRepository.findSongsByUserId(userId);
    }
    
    /**
     * Add a song to user's favorites
     */
    @Transactional
    public Favorite addFavorite(String userId, Long songId) {
        // Validate parameters
        if (songId == null) {
            throw new IllegalArgumentException("Song ID cannot be null");
        }
        
        // Check if song exists
        Songs song = songsRepo.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + songId));
        
        // Check if already favorited
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndSongId(userId, songId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Create new favorite
        Favorite favorite = new Favorite(userId, song);
        return favoriteRepository.save(favorite);
    }
    
    /**
     * Remove a song from user's favorites
     */
    @Transactional
    public void removeFavorite(String userId, Long songId) {
        favoriteRepository.deleteByUserIdAndSongId(userId, songId);
    }
    
    /**
     * Check if a song is in user's favorites
     */
    public boolean isFavorite(String userId, Long songId) {
        return favoriteRepository.existsByUserIdAndSongId(userId, songId);
    }
    
    /**
     * Toggle favorite status of a song
     */
    @Transactional
    public boolean toggleFavorite(String userId, Long songId) {
        if (isFavorite(userId, songId)) {
            removeFavorite(userId, songId);
            return false;
        } else {
            addFavorite(userId, songId);
            return true;
        }
    }
    
    /**
     * Get count of user's favorites
     */
    public long getFavoriteCount(String userId) {
        return favoriteRepository.countByUserId(userId);
    }
    
    /**
     * Clear all favorites for a user
     */
    @Transactional
    public void clearAllFavorites(String userId) {
        favoriteRepository.deleteByUserId(userId);
    }
}

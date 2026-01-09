package com.example.media_controller_iot.repository;

import com.example.media_controller_iot.models.Favorite;
import com.example.media_controller_iot.models.Songs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    /**
     * Find all favorites for a specific user
     */
    List<Favorite> findByUserId(String userId);
    
    /**
     * Find a specific favorite by user and song
     */
    Optional<Favorite> findByUserIdAndSongId(String userId, Long songId);
    
    /**
     * Check if a song is favorited by a user
     */
    boolean existsByUserIdAndSongId(String userId, Long songId);
    
    /**
     * Delete a favorite by user and song
     */
    void deleteByUserIdAndSongId(String userId, Long songId);
    
    /**
     * Get all songs favorited by a user (with song details)
     */
    @Query("SELECT f.song FROM Favorite f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    List<Songs> findSongsByUserId(@Param("userId") String userId);
    
    /**
     * Count favorites for a user
     */
    long countByUserId(String userId);
    
    /**
     * Delete all favorites for a user
     */
    void deleteByUserId(String userId);
}

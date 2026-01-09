package com.example.media_controller_iot.repository;

import com.example.media_controller_iot.models.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findByPlaylistId(Long playlistId);
    
    @Query("SELECT ps.songId FROM PlaylistSong ps WHERE ps.playlistId = :playlistId ORDER BY ps.addedAt DESC")
    List<Long> findSongIdsByPlaylistId(@Param("playlistId") Long playlistId);
    
    void deleteByPlaylistIdAndSongId(Long playlistId, Long songId);
    
    void deleteByPlaylistId(Long playlistId);
    
    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);
}

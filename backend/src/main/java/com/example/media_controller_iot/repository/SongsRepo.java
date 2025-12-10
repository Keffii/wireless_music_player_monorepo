package com.example.media_controller_iot.repository;

import com.example.media_controller_iot.models.Songs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SongsRepo extends JpaRepository<Songs, Long> {
}
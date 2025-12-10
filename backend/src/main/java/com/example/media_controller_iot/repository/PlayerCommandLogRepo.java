package com.example.media_controller_iot.repository;

import com.example.media_controller_iot.models.PlayerCommandLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerCommandLogRepo extends JpaRepository<PlayerCommandLog, Long> {
}

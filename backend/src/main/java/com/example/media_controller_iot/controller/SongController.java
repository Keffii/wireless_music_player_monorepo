package com.example.media_controller_iot.controller;

import com.example.media_controller_iot.models.Songs;
import com.example.media_controller_iot.repository.SongsRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player")
public class SongController {

    private final SongsRepo songRepository;

    public SongController(SongsRepo songRepository) {
        this.songRepository = songRepository;
    }

    @GetMapping("/songs")
    public List<Songs> getAllSongs() {
        return songRepository.findAll();
    }
    
    @GetMapping("/songs/category/{category}")
    public List<Songs> getSongsByCategory(@PathVariable String category) {
        return songRepository.findByCategory(category);
    }
}

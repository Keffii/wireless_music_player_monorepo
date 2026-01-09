package com.example.media_controller_iot.service;

import com.example.media_controller_iot.models.PlayerCommandLog;
import com.example.media_controller_iot.models.Songs;
import com.example.media_controller_iot.models.VolumeLog;
import com.example.media_controller_iot.repository.PlayerCommandLogRepo;
import com.example.media_controller_iot.repository.SongsRepo;
import com.example.media_controller_iot.repository.VolumeLogRepo;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;

@Service
public class PlayerService {

    private final SongsRepo songsRepo;
    private final PlayerCommandLogRepo playerCommandLogRepo;
    private final VolumeLogRepo volumeLogRepo;

    private boolean shuffleEnabled = false;
    private boolean repeatEnabled = false;
    private double playbackPosition = 0;

    private final List<SseEmitter> emitters = new ArrayList<>();

    // Playlist queue management
    private List<Long> playlistQueue = new ArrayList<>();
    private int currentQueueIndex = -1;

    private boolean isPlaying = false;
    private boolean isMuted = false;
    private int previousVolume = 50;
    private boolean wasPlayingBeforeMute = false;
    private int volume = 50;
    private String lastCommand = "NONE";

    private Songs currentSong;

    public PlayerService(SongsRepo songsRepo,
                         PlayerCommandLogRepo playerCommandLogRepo,
                         VolumeLogRepo volumeLogRepo) {
        this.songsRepo = songsRepo;
        this.playerCommandLogRepo = playerCommandLogRepo;
        this.volumeLogRepo = volumeLogRepo;
        loadInitialSong();
    }

    private void loadInitialSong() {
        List<Songs> songs = songsRepo.findAll();
        if (!songs.isEmpty()) {
            currentSong = songs.get(0);
        }
    }

    public void addEmitter(SseEmitter emitter) { emitters.add(emitter); }
    public void removeEmitter(SseEmitter emitter) { emitters.remove(emitter); }

    private void broadcastState() {
        Map<String, Object> state = getState();
        emitters.removeIf(emitter -> {
            try {
                emitter.send(state);
                return false;
            } catch (Exception e) {
                return true;
            }
        });
    }

    private void nextSong() {
        // If playlist queue is active, navigate within queue
        if (!playlistQueue.isEmpty() && currentQueueIndex >= 0) {
            if (repeatEnabled) {
                // Stay on same song
                playbackPosition = 0;
                return;
            }
            
            if (shuffleEnabled) {
                Random r = new Random();
                int newIndex;
                do {
                    newIndex = r.nextInt(playlistQueue.size());
                } while (newIndex == currentQueueIndex && playlistQueue.size() > 1);
                currentQueueIndex = newIndex;
            } else {
                currentQueueIndex = (currentQueueIndex + 1) % playlistQueue.size();
            }
            
            Long songId = playlistQueue.get(currentQueueIndex);
            songsRepo.findById(Objects.requireNonNull(songId)).ifPresent(song -> currentSong = song);
            playbackPosition = 0;
            return;
        }

        // Default behavior: use all songs
        List<Songs> songs = songsRepo.findAll();
        if (songs.isEmpty()) return;

        // If repeat is enabled (and not shuffling), just restart the current song
        if (repeatEnabled && !shuffleEnabled) {
            playbackPosition = 0;
            return;
        }

        if (shuffleEnabled) {
            Random r = new Random();
            Songs newSong;
            do {
                newSong = songs.get(r.nextInt(songs.size()));
            } while (newSong.equals(currentSong));
            currentSong = newSong;
        } else {
            int idx = songs.indexOf(currentSong);
            currentSong = songs.get((idx + 1) % songs.size());
        }

        playbackPosition = 0;
    }

    private void prevSong() {
        // If playlist queue is active, navigate within queue
        if (!playlistQueue.isEmpty() && currentQueueIndex >= 0) {
            currentQueueIndex = (currentQueueIndex - 1 + playlistQueue.size()) % playlistQueue.size();
            Long songId = playlistQueue.get(currentQueueIndex);
            songsRepo.findById(Objects.requireNonNull(songId)).ifPresent(song -> currentSong = song);
            playbackPosition = 0;
            return;
        }

        // Default behavior: use all songs
        List<Songs> songs = songsRepo.findAll();
        if (songs.isEmpty()) return;

        int index = songs.indexOf(currentSong);
        currentSong = songs.get((index - 1 + songs.size()) % songs.size());
        playbackPosition = 0;
    }

    private void toggleMute() {
        if (!isMuted) {
            previousVolume = volume;
            volume = 0;
            isMuted = true;
            wasPlayingBeforeMute = isPlaying;
            isPlaying = false;
        } else {
            volume = previousVolume;
            isMuted = false;
            isPlaying = wasPlayingBeforeMute;
        }
    }

    private void handleVolume(String cmd) {
        try {
            int newVolume = Integer.parseInt(cmd.split(":")[1]);
            volume = Math.max(0, Math.min(newVolume, 100));
            isMuted = (volume == 0);
            volumeLogRepo.save(new VolumeLog(volume));
        } catch (Exception e) {
            System.err.println("Invalid VOLUME command: " + cmd);
        }
    }

    public void mediaCommands(String cmd) {
        mediaCommands(cmd, null);
    }

    public void mediaCommands(String cmd, String userId) {
        switch (cmd) {
            case "PLAY" -> isPlaying = true;
            case "PAUSE" -> isPlaying = false;
            case "NEXT" -> nextSong();
            case "PREV" -> prevSong();
            case "MUTE" -> toggleMute();
            case "PLAY_PAUSE" -> isPlaying = !isPlaying;
            case "SHUFFLE" -> shuffleEnabled = !shuffleEnabled;
            case "REPEAT" -> repeatEnabled = !repeatEnabled;
            case "SEEK_FORWARD" -> playbackPosition += 10;
            default -> {
                if (cmd.startsWith("VOLUME:")) handleVolume(cmd);
            }
        }

        lastCommand = cmd;
        playerCommandLogRepo.save(new PlayerCommandLog(cmd, currentSong, userId));
        broadcastState();
    }

    public void setPlaylistQueue(List<Long> songIds, String userId) {
        if (songIds == null || songIds.isEmpty()) {
            // Clear playlist queue
            playlistQueue.clear();
            currentQueueIndex = -1;
        } else {
            playlistQueue = new ArrayList<>(songIds);
            currentQueueIndex = 0;
            // Load first song from queue
            Long firstSongId = playlistQueue.get(0);
            songsRepo.findById(Objects.requireNonNull(firstSongId)).ifPresent(song -> {
                currentSong = song;
                isPlaying = true;
                // Log the command so it appears in recently played
                lastCommand = "PLAY";
                playerCommandLogRepo.save(new PlayerCommandLog("PLAY", song, userId));
            });
            playbackPosition = 0;
        }
        broadcastState();
    }

    @SuppressWarnings("null")
    public @NonNull Map<String, Object> getState() {
        if (currentSong == null) loadInitialSong();

        return Map.ofEntries(
                Map.entry("isPlaying", isPlaying),
                Map.entry("currentSongId", currentSong.getId()),
                Map.entry("title", currentSong.getTitle()),
                Map.entry("artist", currentSong.getArtist()),
                Map.entry("srcUrl", currentSong.getSrcUrl()),
                Map.entry("coverUrl", currentSong.getCoverUrl()),
                Map.entry("volume", volume),
                Map.entry("isMuted", isMuted),
                Map.entry("lastCommand", lastCommand),
                Map.entry("shuffle", shuffleEnabled),
                Map.entry("repeat", repeatEnabled),
                Map.entry("position", playbackPosition),
                Map.entry("duration", 0)
        );
    }
}

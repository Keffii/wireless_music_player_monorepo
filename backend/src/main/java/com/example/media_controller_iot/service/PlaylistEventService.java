package com.example.media_controller_iot.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlaylistEventService {

    private final List<SseEmitter> emitters = new ArrayList<>();

    public void addEmitter(SseEmitter emitter) {
        emitters.add(emitter);
    }

    public void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
    }

    public void broadcastPlaylistEvent(String eventType, Object data) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", eventType);
        event.put("data", data);
        event.put("timestamp", System.currentTimeMillis());

        emitters.removeIf(emitter -> {
            try {
                emitter.send(event);
                return false;
            } catch (Exception e) {
                return true;
            }
        });
    }

    public void broadcastPlaylistCreated(Long playlistId, String playlistName) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", playlistId);
        data.put("name", playlistName);
        broadcastPlaylistEvent("PLAYLIST_CREATED", data);
    }

    public void broadcastPlaylistDeleted(Long playlistId) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", playlistId);
        broadcastPlaylistEvent("PLAYLIST_DELETED", data);
    }

    public void broadcastSongAdded(Long playlistId, Long songId) {
        Map<String, Object> data = new HashMap<>();
        data.put("playlistId", playlistId);
        data.put("songId", songId);
        broadcastPlaylistEvent("SONG_ADDED", data);
    }

    public void broadcastSongRemoved(Long playlistId, Long songId) {
        Map<String, Object> data = new HashMap<>();
        data.put("playlistId", playlistId);
        data.put("songId", songId);
        broadcastPlaylistEvent("SONG_REMOVED", data);
    }
}

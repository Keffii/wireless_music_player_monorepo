package com.example.media_controller_iot.controller;

import com.example.media_controller_iot.service.PlayerService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/player")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping("/command")
    public void playCommand(@RequestBody Map<String, String> body) {
        String command = body.get("command");
        playerService.mediaCommands(command);
    }

    @GetMapping("/state")
    public @NonNull Map<String, Object> getState() {
        return playerService.getState();
    }

    @GetMapping("/stream")
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        playerService.addEmitter(emitter);

        try {
            emitter.send(playerService.getState());
        } catch (Exception ignored) {
        }

        emitter.onCompletion(() -> playerService.removeEmitter(emitter));
        emitter.onTimeout(() -> playerService.removeEmitter(emitter));

        return emitter;
    }
}

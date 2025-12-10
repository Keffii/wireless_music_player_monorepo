package com.example.media_controller_iot.serial;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.media_controller_iot.models.PlayerCommandLog;
import com.example.media_controller_iot.repository.PlayerCommandLogRepo;
import com.example.media_controller_iot.service.PlayerService;
import com.fazecast.jSerialComm.SerialPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import com.example.media_controller_iot.models.VolumeLog;
import com.example.media_controller_iot.repository.VolumeLogRepo;

@Component
public class BluetoothListener {
    private static final Logger log = LoggerFactory.getLogger(BluetoothListener.class);
    private final PlayerService playerService;
    private final PlayerCommandLogRepo playerCommandLogRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final VolumeLogRepo volumeLogRepo;

    public BluetoothListener(PlayerService playerService,
                             PlayerCommandLogRepo playerCommandLogRepo,
                             VolumeLogRepo volumeLogRepo) {
        this.playerService = playerService;
        this.playerCommandLogRepo = playerCommandLogRepo;
        this.volumeLogRepo = volumeLogRepo;
    }


    @EventListener(ApplicationReadyEvent.class)
    public void startBluetoothListener() {
        SerialPort comPort = SerialPort.getCommPort("COM6"); // Change if needed
        comPort.setBaudRate(115200);

        if (!comPort.openPort()) {
            log.warn("Could not open COM6.");
            return;
        }

        log.info("Listening for Bluetooth data on COM6...");

        new Thread(() -> {
            StringBuilder buffer = new StringBuilder();
            try {
                while (true) {
                    while (comPort.bytesAvailable() > 0) {
                        byte[] data = new byte[comPort.bytesAvailable()];
                        int numRead = comPort.readBytes(data, data.length);
                        buffer.append(new String(data, 0, numRead));

                        int newlineIndex;
                        while ((newlineIndex = buffer.indexOf("\n")) != -1) {
                            String line = buffer.substring(0, newlineIndex).trim();
                            buffer.delete(0, newlineIndex + 1);
                            if (!line.isEmpty()) handleJson(line);
                        }
                    }
                    Thread.sleep(50); // prevent busy-wait loop, intentionally throttled
                }
            } catch (Exception e) {
                log.error("Error while reading Bluetooth data", e);
            } finally {
                comPort.closePort();
            }
        }).start();
    }
    private void saveVolume(int value) {
        try {
            VolumeLog volumeLog = new VolumeLog(value);
            volumeLogRepo.save(volumeLog);
        } catch (Exception e) {
            log.error("Failed to save volume: {}", value, e);
        }
    }

    private void handleJson(String line) {
        try {
            // Clean up data
            if (!line.startsWith("{") || !line.endsWith("}")) {
                return;
            }

            JsonNode json = objectMapper.readTree(line);
            if (!json.has("command")) return;

            String command = json.get("command").asText();

            if ("VOLUME".equalsIgnoreCase(command)) {
                int value = json.has("value") ? json.get("value").asInt() : -1;
                if (value >= 0) {
                    log.info("Volume changed: {}", value);
                    saveCommand("VOLUME:" + value);
                    saveVolume(value);
                    playerService.mediaCommands("VOLUME:" + value); //update backend state
                }
            } else {
                log.info("Command: {}", command);
                playerService.mediaCommands(command);
                saveCommand(command);
            }

        } catch (Exception e) {
            log.warn("Skipped malformed line: {}", line, e);
        }
    }

    private void saveCommand(String command) {
        try {
            PlayerCommandLog entry = new PlayerCommandLog();
            entry.setCommand(command);
            entry.setTimestamp(LocalDateTime.now());
            playerCommandLogRepo.save(entry);
        } catch (Exception e) {
            log.error("Failed to save command: {}", command, e);
        }
    }
}

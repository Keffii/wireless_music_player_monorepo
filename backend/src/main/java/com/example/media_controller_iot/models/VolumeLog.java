package com.example.media_controller_iot.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "volume_log")
public class VolumeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int volume;
    private LocalDateTime timestamp = LocalDateTime.now();

    public VolumeLog(int volume) {
        this.volume = volume;
        this.timestamp = LocalDateTime.now();
    }
}

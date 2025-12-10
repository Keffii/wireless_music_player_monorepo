package com.example.media_controller_iot.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "songs")
public class Songs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String artist;
    
    @Column(name = "src_url")
    private String srcUrl;
    
    @Column(name = "cover_url")
    private String coverUrl;
}

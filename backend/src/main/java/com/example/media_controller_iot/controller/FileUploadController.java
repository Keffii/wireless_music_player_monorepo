package com.example.media_controller_iot.controller;

import com.example.media_controller_iot.service.S3Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final S3Service s3Service;

    public FileUploadController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    /**
     * Upload a music file to S3
     * POST /api/files/upload/music
     * @param file - The music file to upload (multipart/form-data)
     * @param description - Optional description for the file
     * @return JSON with the S3 URL and metadata
     */
    @PostMapping("/upload/music")
    public ResponseEntity<Map<String, String>> uploadMusicFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            // Validate file type (optional)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File must be an audio file"));
            }

            String fileUrl = s3Service.uploadFile(file, "music", description);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("originalFilename", file.getOriginalFilename());
            if (description != null && !description.isBlank()) {
                response.put("description", description);
            }
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Upload a cover art file to S3
     * POST /api/files/upload/cover
     * @param file - The cover art image to upload (multipart/form-data)
     * @param description - Optional description for the file
     * @return JSON with the S3 URL and metadata
     */
    @PostMapping("/upload/cover")
    public ResponseEntity<Map<String, String>> uploadCoverFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            // Validate file type (optional)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File must be an image file"));
            }

            String fileUrl = s3Service.uploadFile(file, "cover", description);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("originalFilename", file.getOriginalFilename());
            if (description != null && !description.isBlank()) {
                response.put("description", description);
            }
            response.put("message", "Cover art uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload cover art: " + e.getMessage()));
        }
    }

    /**
     * Delete a file from S3
     * DELETE /api/files/delete
     * @param fileUrl - The S3 URL of the file to delete
     * @return Success message
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            s3Service.deleteFile(fileUrl);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete file: " + e.getMessage()));
        }
    }

    /**
     * Check if S3 bucket exists
     * GET /api/files/bucket/status
     * @return Bucket status
     */
    @GetMapping("/bucket/status")
    public ResponseEntity<Map<String, Object>> checkBucketStatus() {
        boolean exists = s3Service.bucketExists();
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "S3 bucket is accessible" : "S3 bucket does not exist");
        return ResponseEntity.ok(response);
    }

    /**
     * Create S3 bucket if it doesn't exist
     * POST /api/files/bucket/create
     * @return Success message
     */
    @PostMapping("/bucket/create")
    public ResponseEntity<Map<String, String>> createBucket() {
        try {
            s3Service.createBucketIfNotExists();
            return ResponseEntity.ok(Map.of("message", "Bucket created or already exists"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create bucket: " + e.getMessage()));
        }
    }
}

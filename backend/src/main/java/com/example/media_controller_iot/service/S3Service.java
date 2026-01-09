package com.example.media_controller_iot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Upload a file to S3 and return the public URL
     * @param file - The file to upload
     * @param folder - The folder path in S3 (e.g., "music" or "cover")
     * @param description - Optional description for the file
     * @return The public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder, String description) throws IOException {
        String fileName = generateFileName(file.getOriginalFilename(), folder);
        
        try {
            // Build metadata to store original filename and description
            java.util.Map<String, String> metadata = new java.util.HashMap<>();
            if (file.getOriginalFilename() != null) {
                metadata.put("original-filename", file.getOriginalFilename());
            }
            if (description != null && !description.isBlank()) {
                metadata.put("description", description);
            }
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .metadata(metadata)
                    // Do NOT set ACL - bucket has "Bucket owner enforced" (ACLs disabled)
                    // Use bucket policy for public access instead
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return getPublicUrl(fileName);
        } catch (S3Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Upload a file to S3 without description (backward compatibility)
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        return uploadFile(file, folder, null);
    }

    /**
     * Delete a file from S3
     * @param fileUrl - The full S3 URL of the file
     */
    public void deleteFile(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);
        
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to delete file from S3: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Generate a public URL for an S3 object
     * Note: This returns the public URL. For presigned URLs with expiration, use S3Presigner
     * @param key - The S3 object key
     * @return Public URL
     */
    public String generatePublicUrl(String key) {
        try {
            URL url = s3Client.utilities().getUrl(builder -> builder.bucket(bucketName).key(key));
            return url.toString();
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to generate URL: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    /**
     * Get the public URL for a file in S3
     */
    private String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    /**
     * Generate a file name with the folder path using the original filename (sanitized)
     * Note: This can overwrite existing files with the same name
     */
    private String generateFileName(String originalFileName, String folder) {
        if (originalFileName == null || originalFileName.isBlank()) {
            // Fallback to UUID if no filename
            return folder + "/" + UUID.randomUUID() + ".bin";
        }
        
        // Sanitize filename: remove special chars, spaces, keep only alphanumeric, dots, hyphens, underscores
        String sanitized = originalFileName
                .replaceAll("[^a-zA-Z0-9._-]", "-")  // Replace invalid chars with hyphen
                .replaceAll("-+", "-")                // Collapse multiple hyphens
                .toLowerCase();                       // Lowercase for consistency
        
        return folder + "/" + sanitized;
    }

    /**
     * Extract the S3 key from a full URL
     */
    private String extractKeyFromUrl(String fileUrl) {
        // URL format: https://bucket-name.s3.region.amazonaws.com/folder/file.ext
        String[] parts = fileUrl.split(".amazonaws.com/");
        return parts.length > 1 ? parts[1] : fileUrl;
    }

    /**
     * Check if a bucket exists
     */
    public boolean bucketExists() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(headBucketRequest);
            return true;
        } catch (NoSuchBucketException e) {
            return false;
        }
    }

    /**
     * Create the S3 bucket if it doesn't exist
     */
    public void createBucketIfNotExists() {
        if (!bucketExists()) {
            try {
                CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                        .bucket(bucketName)
                        .build();
                s3Client.createBucket(createBucketRequest);
            } catch (S3Exception e) {
                throw new RuntimeException("Failed to create S3 bucket: " + e.awsErrorDetails().errorMessage(), e);
            }
        }
    }
}

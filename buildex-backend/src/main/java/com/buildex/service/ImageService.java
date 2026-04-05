package com.buildex.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageService {

    private final Path storageLocation;

    public ImageService() {
        this.storageLocation = Paths.get("uploads/360");
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String saveImageFromUrl(String imageUrl) throws IOException {
        // Generate filename from MD5/UUID of string to ensure same URL = same file
        String extension = ".jpg";
        if (imageUrl.contains(".")) {
            int i = imageUrl.lastIndexOf('.');
            if (i > 0) {
                String extPart = imageUrl.substring(i);
                if (extPart.contains("?"))
                    extPart = extPart.split("\\?")[0];
                if (extPart.length() <= 5)
                    extension = extPart;
            }
        }

        String fileName = UUID.nameUUIDFromBytes(imageUrl.getBytes()).toString() + extension;
        Path targetPath = this.storageLocation.resolve(fileName);

        // If file exists, return it (cache)
        if (Files.exists(targetPath) && Files.size(targetPath) > 0) {
            return fileName;
        }

        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) new java.net.URL(imageUrl)
                .openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        // Add User-Agent to avoid being blocked by CDNs (like Wikimedia)
        connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        connection.connect();

        if (connection.getResponseCode() != 200) {
            System.err.println("HTTP error " + connection.getResponseCode() + " for URL: " + imageUrl);
            return null;
        }

        try (InputStream in = connection.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            connection.disconnect();
        }

        return fileName;
    }

    public Path getImagePath(String fileName) {
        return this.storageLocation.resolve(fileName).normalize();
    }
}

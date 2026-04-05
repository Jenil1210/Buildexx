package com.buildex.controller;

import com.buildex.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*") // Allow frontend to access
public class ImageController {

    @Autowired
    private ImageService imageService;

    @PostMapping("/proxy-360")
    public ResponseEntity<?> proxyImage(@RequestBody Map<String, String> request) {
        String imageUrl = request.get("url");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseEntity.badRequest().body("URL is required");
        }

        try {
            String fileName = imageService.saveImageFromUrl(imageUrl);
            Map<String, String> response = new HashMap<>();
            if (fileName != null) {
                response.put("localUrl", "/api/images/serve-360/" + fileName);
            } else {
                response.put("localUrl", imageUrl); // Fallback
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Proxy failed for " + imageUrl + ": " + e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("localUrl", imageUrl);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/serve-360/{fileName:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        try {
            Path filePath = imageService.getImagePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // You might want dynamic content type detection
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

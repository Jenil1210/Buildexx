package com.buildex.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Buildex Backend is Running!");
    }

    @GetMapping("/")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("Buildex API Root. Visit /health to check status.");
    }
}

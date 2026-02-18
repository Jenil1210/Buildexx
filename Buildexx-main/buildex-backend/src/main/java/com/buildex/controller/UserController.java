package com.buildex.controller;

import com.buildex.dto.BuilderSummaryDTO;
import com.buildex.entity.User;
import com.buildex.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/builders")
    public ResponseEntity<List<BuilderSummaryDTO>> getAllBuilders() {
        return ResponseEntity.ok(userRepository.findAllBuilderSummaries("builder"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Status is required"));
        }

        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(status);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("success", true, "message", "User status updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

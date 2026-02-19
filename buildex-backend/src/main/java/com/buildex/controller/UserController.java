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

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> userData = new java.util.HashMap<>();
                    userData.put("id", user.getId());
                    userData.put("username", user.getUsername());
                    userData.put("email", user.getEmail());
                    userData.put("full_name", user.getFullName());
                    userData.put("phone", user.getPhone());
                    userData.put("role", user.getRole());
                    // Builder specific fields
                    userData.put("company_name", user.getCompanyName());
                    userData.put("gst_number", user.getGstNumber());
                    userData.put("address", user.getAddress());
                    userData.put("verification_status", user.getVerificationStatus());
                    return ResponseEntity.ok(userData);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        return userRepository.findById(id)
                .map(user -> {
                    if (updates.containsKey("full_name"))
                        user.setFullName(updates.get("full_name"));
                    if (updates.containsKey("phone"))
                        user.setPhone(updates.get("phone"));

                    // Builder specific updates
                    if (updates.containsKey("company_name"))
                        user.setCompanyName(updates.get("company_name"));
                    if (updates.containsKey("gst_number"))
                        user.setGstNumber(updates.get("gst_number"));
                    if (updates.containsKey("address"))
                        user.setAddress(updates.get("address"));

                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

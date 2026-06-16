package com.buildex.controller;

import com.buildex.entity.User;
import com.buildex.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SubscriptionController {

    private final UserRepository userRepository;

    public SubscriptionController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/{builderId}/subscribe")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('BUILDER') and #builderId == authentication.principal.id)")
    public ResponseEntity<?> subscribeBuilder(@PathVariable Long builderId) {
        Optional<User> userOpt = userRepository.findById(builderId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (!"builder".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "User is not a builder"));
        }

        user.setSubscriptionStatus("Active");
        user.setSubscriptionDate(LocalDateTime.now());
        user.setPropertyLimit(9999); // Unlimited
        user.setSubscriptionPlan("Premium");

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Subscription successful",
                "subscriptionStatus", user.getSubscriptionStatus(),
                "propertyLimit", user.getPropertyLimit()));
    }
}

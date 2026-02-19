package com.buildex.controller;

import com.buildex.entity.RentSubscription;
import com.buildex.repository.RentSubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.hibernate.Hibernate;

import java.util.List;

@RestController
@RequestMapping("/api/rent-subscriptions")
@CrossOrigin(origins = "*")
public class RentSubscriptionController {

    private final RentSubscriptionRepository rentSubscriptionRepository;

    public RentSubscriptionController(RentSubscriptionRepository rentSubscriptionRepository) {
        this.rentSubscriptionRepository = rentSubscriptionRepository;
    }

    @GetMapping("/user/{userId}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<RentSubscription>> getUserSubscriptions(@PathVariable Long userId) {
        List<RentSubscription> subscriptions = rentSubscriptionRepository.findByUserId(userId);
        
        // Initialize lazy associations to avoid LazyInitializationException
        subscriptions.forEach(sub -> {
            Hibernate.initialize(sub.getUser());
            Hibernate.initialize(sub.getProperty());
            Hibernate.initialize(sub.getBuilder());
        });
        
        return ResponseEntity.ok(subscriptions);
    }
}

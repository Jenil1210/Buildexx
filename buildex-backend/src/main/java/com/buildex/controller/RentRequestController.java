package com.buildex.controller;

import com.buildex.entity.RentRequest;
import com.buildex.service.RentRequestService;
import com.buildex.model.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rent-requests")
public class RentRequestController {

    private final RentRequestService rentRequestService;

    public RentRequestController(RentRequestService rentRequestService) {
        this.rentRequestService = rentRequestService;
    }

    @PostMapping
    public ResponseEntity<RentRequest> createRentRequest(@RequestBody RentRequest rentRequest) {
        RentRequest createdRequest = rentRequestService.createRentRequest(rentRequest);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<RentRequest>> getRentRequestsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(rentRequestService.getRentRequestsByUserId(userId));
    }

    @GetMapping("/builder/{builderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('BUILDER') and #builderId == authentication.principal.id)")
    public ResponseEntity<List<RentRequest>> getRentRequestsByBuilderId(@PathVariable Long builderId) {
        List<RentRequest> rentRequests = rentRequestService.getRentRequestsByBuilderId(builderId);
        return ResponseEntity.ok(rentRequests);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('BUILDER', 'ADMIN')")
    public ResponseEntity<?> approveRentRequest(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!principal.getRole().equalsIgnoreCase("admin")) {
            Optional<RentRequest> rentRequestOpt = rentRequestService.getRentRequestById(id);
            if (rentRequestOpt.isEmpty() || rentRequestOpt.get().getProperty() == null ||
                rentRequestOpt.get().getProperty().getBuilder() == null ||
                !rentRequestOpt.get().getProperty().getBuilder().getId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
            }
        }
        Optional<RentRequest> updatedRequest = rentRequestService.updateRentRequestStatus(id,
                RentRequest.Status.APPROVED);
        return updatedRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('BUILDER', 'ADMIN')")
    public ResponseEntity<?> rejectRentRequest(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!principal.getRole().equalsIgnoreCase("admin")) {
            Optional<RentRequest> rentRequestOpt = rentRequestService.getRentRequestById(id);
            if (rentRequestOpt.isEmpty() || rentRequestOpt.get().getProperty() == null ||
                rentRequestOpt.get().getProperty().getBuilder() == null ||
                !rentRequestOpt.get().getProperty().getBuilder().getId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
            }
        }
        Optional<RentRequest> updatedRequest = rentRequestService.updateRentRequestStatus(id,
                RentRequest.Status.REJECTED);
        return updatedRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRentRequest(@PathVariable Long id) {
        rentRequestService.deleteRentRequest(id);
        return ResponseEntity.noContent().build();
    }
}
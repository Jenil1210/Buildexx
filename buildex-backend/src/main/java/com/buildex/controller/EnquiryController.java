package com.buildex.controller;

import com.buildex.entity.Enquiry;
import com.buildex.entity.Property;
import com.buildex.repository.PropertyRepository;
import com.buildex.service.EnquiryService;
import com.buildex.model.AuthenticatedUser;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService enquiryService;
    private final PropertyRepository propertyRepository;

    @PostMapping
    public ResponseEntity<Enquiry> createEnquiry(@RequestBody EnquiryRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + request.getPropertyId()));

        Enquiry enquiry = new Enquiry();
        enquiry.setProperty(property);
        enquiry.setName(request.getFullName() != null ? request.getFullName() : request.getName());
        enquiry.setEmail(request.getEmail());
        enquiry.setPhone(request.getPhone());
        enquiry.setMessage(request.getMessage());
        try {
            if (request.getEnquiryType() != null) {
                enquiry.setEnquiryType(Enquiry.EnquiryType.valueOf(request.getEnquiryType().toUpperCase()));
            } else {
                enquiry.setEnquiryType(Enquiry.EnquiryType.BUY);
            }
        } catch (IllegalArgumentException e) {
            enquiry.setEnquiryType(Enquiry.EnquiryType.BUY);
        }

        Enquiry createdEnquiry = enquiryService.createEnquiry(enquiry);
        return new ResponseEntity<>(createdEnquiry, HttpStatus.CREATED);
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('BUILDER', 'ADMIN')")
    public ResponseEntity<?> getEnquiriesByPropertyId(@PathVariable Long propertyId, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!principal.getRole().equalsIgnoreCase("admin")) {
            Property property = propertyRepository.findById(propertyId)
                    .orElse(null);
            if (property == null || property.getBuilder() == null || !property.getBuilder().getId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this property");
            }
        }
        List<Enquiry> enquiries = enquiryService.getEnquiriesByPropertyId(propertyId);
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/builder/{builderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('BUILDER') and #builderId == authentication.principal.id)")
    public ResponseEntity<List<Enquiry>> getEnquiriesByBuilderId(@PathVariable Long builderId) {
        List<Enquiry> enquiries = enquiryService.getEnquiriesByBuilderId(builderId);
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<Enquiry>> getEnquiriesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(enquiryService.getEnquiriesByUserId(userId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('BUILDER', 'ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!principal.getRole().equalsIgnoreCase("admin")) {
            Enquiry enquiry = enquiryService.getEnquiryById(id)
                    .orElse(null);
            if (enquiry == null || enquiry.getProperty() == null || enquiry.getProperty().getBuilder() == null ||
                !enquiry.getProperty().getBuilder().getId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this resource");
            }
        }
        Enquiry updated = enquiryService.updateEnquiryStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEnquiry(@PathVariable Long id) {
        enquiryService.deleteEnquiry(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class EnquiryRequest {
        private Long propertyId;
        private Long builderId; // Ignored as implied by property
        private Long userId; // Ignored as Enquiry doesn't link User currently
        private String fullName; // helper for frontend mapping
        private String name;
        private String email;
        private String phone;
        private String message;
        private String enquiryType;
    }
}
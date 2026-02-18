package com.buildex.controller;

import com.buildex.entity.Enquiry;
import com.buildex.entity.Property;
import com.buildex.repository.PropertyRepository;
import com.buildex.service.EnquiryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Enquiry>> getEnquiriesByPropertyId(@PathVariable Long propertyId) {
        List<Enquiry> enquiries = enquiryService.getEnquiriesByPropertyId(propertyId);
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/builder/{builderId}")
    public ResponseEntity<List<Enquiry>> getEnquiriesByBuilderId(@PathVariable Long builderId) {
        List<Enquiry> enquiries = enquiryService.getEnquiriesByBuilderId(builderId);
        return ResponseEntity.ok(enquiries);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Enquiry>> getEnquiriesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(enquiryService.getEnquiriesByUserId(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Enquiry>> getAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Enquiry updated = enquiryService.updateEnquiryStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
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
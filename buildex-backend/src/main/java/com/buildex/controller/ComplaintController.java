package com.buildex.controller;

import com.buildex.entity.Complaint;
import com.buildex.service.ComplaintService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody ComplaintRequest request) {
        Complaint complaint = complaintService.createComplaint(
                request.getPropertyId(),
                request.getUserId(),
                request.getIssue());
        return new ResponseEntity<>(complaint, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        complaintService.updateComplaintStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ComplaintRequest {
        private Long propertyId;
        private Long userId;
        private String issue;
    }
}

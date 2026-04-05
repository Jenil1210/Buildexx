package com.buildex.service;

import com.buildex.entity.Complaint;
import com.buildex.entity.Property;
import com.buildex.entity.User;
import com.buildex.repository.ComplaintRepository;
import com.buildex.repository.PropertyRepository;
import com.buildex.repository.UserRepository;
import com.buildex.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @org.springframework.transaction.annotation.Transactional
    public Complaint createComplaint(Long propertyId, Long userId, String issue) {
        if (propertyId == null) {
            throw new IllegalArgumentException("Property ID cannot be null");
        }
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Complaint complaint = Complaint.builder()
                .property(property)
                .user(user)
                .description(issue)
                .status("PENDING")
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);
        if (savedComplaint == null) {
            throw new RuntimeException("Failed to save complaint");
        }

        // Notify builder via email
        if (property != null && property.getBuilder() != null && property.getBuilder().getEmail() != null) {
            emailService.sendComplaintNotificationEmail(
                    property.getBuilder().getEmail(),
                    property.getBuilder().getCompanyName(),
                    property.getName(),
                    "Property Issue Reported",
                    issue);
        }

        if (savedComplaint.getProperty() != null) {
            org.hibernate.Hibernate.initialize(savedComplaint.getProperty());
            if (savedComplaint.getProperty().getBuilder() != null) {
                org.hibernate.Hibernate.initialize(savedComplaint.getProperty().getBuilder());
            }
        }
        if (savedComplaint.getUser() != null) {
            org.hibernate.Hibernate.initialize(savedComplaint.getUser());
        }

        return savedComplaint;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public void updateComplaintStatus(Long id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        complaint.setStatus(status);
        complaintRepository.save(complaint);
    }

    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
    }
}

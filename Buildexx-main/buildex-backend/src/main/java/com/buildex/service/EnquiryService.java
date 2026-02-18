package com.buildex.service;

import com.buildex.entity.Enquiry;
import com.buildex.repository.EnquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final EmailService emailService;
    private final com.buildex.repository.UserRepository userRepository;

    public EnquiryService(EnquiryRepository enquiryRepository, EmailService emailService,
            com.buildex.repository.UserRepository userRepository) {
        this.enquiryRepository = enquiryRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public Enquiry createEnquiry(Enquiry enquiry) {
        Enquiry savedEnquiry = enquiryRepository.save(enquiry);

        // Send emails if property and builder are present
        if (savedEnquiry.getProperty() != null && savedEnquiry.getProperty().getBuilder() != null) {
            com.buildex.entity.User builder = savedEnquiry.getProperty().getBuilder();
            String propertyName = savedEnquiry.getProperty().getName();

            if (savedEnquiry.getEnquiryType() == Enquiry.EnquiryType.VISIT) {
                // Visit Notification to Builder
                emailService.sendVisitScheduledEmail(
                        builder.getEmail(),
                        builder.getCompanyName(),
                        savedEnquiry.getName(),
                        savedEnquiry.getEmail(),
                        savedEnquiry.getPhone(),
                        propertyName,
                        "Scheduled Date (Check Message)", // Frontend sends date in message
                        savedEnquiry.getMessage());
                // Visit Confirmation to User
                emailService.sendVisitConfirmationEmail(
                        savedEnquiry.getEmail(),
                        savedEnquiry.getName(),
                        propertyName,
                        "Your scheduled slot");
            } else {
                // Enquiry Notification to Builder
                emailService.sendEnquiryReceivedEmail(
                        builder.getEmail(),
                        builder.getCompanyName(),
                        savedEnquiry.getName(),
                        savedEnquiry.getEmail(),
                        savedEnquiry.getPhone(),
                        propertyName,
                        savedEnquiry.getMessage());

                // Enquiry Confirmation to User
                emailService.sendEnquiryConfirmationEmail(
                        savedEnquiry.getEmail(),
                        savedEnquiry.getName(),
                        propertyName);
            }
        }

        if (savedEnquiry.getProperty() != null) {
            org.hibernate.Hibernate.initialize(savedEnquiry.getProperty());
            if (savedEnquiry.getProperty().getBuilder() != null) {
                org.hibernate.Hibernate.initialize(savedEnquiry.getProperty().getBuilder());
            }
        }

        return savedEnquiry;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Enquiry> getEnquiriesByPropertyId(Long propertyId) {
        return enquiryRepository.findByPropertyId(propertyId);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Enquiry> getEnquiriesByBuilderId(Long builderId) {
        return enquiryRepository.findByBuilderId(builderId);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Enquiry> getEnquiriesByUserId(Long userId) {
        com.buildex.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Enquiry> enquiries = enquiryRepository.findByEmail(user.getEmail());
        enquiries.forEach(e -> {
            if (e.getProperty() != null) {
                org.hibernate.Hibernate.initialize(e.getProperty());
            }
        });
        return enquiries;
    }

    public Optional<Enquiry> getEnquiryById(Long id) {
        return enquiryRepository.findById(id);
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public Enquiry updateEnquiryStatus(Long id, String status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));
        enquiry.setStatus(status.toUpperCase());
        Enquiry savedEnquiry = enquiryRepository.save(enquiry);
        if (savedEnquiry.getProperty() != null) {
            org.hibernate.Hibernate.initialize(savedEnquiry.getProperty());
            if (savedEnquiry.getProperty().getBuilder() != null) {
                org.hibernate.Hibernate.initialize(savedEnquiry.getProperty().getBuilder());
            }
        }
        return savedEnquiry;
    }

    public void deleteEnquiry(Long id) {
        if (!enquiryRepository.existsById(id)) {
            throw new RuntimeException("Enquiry not found with id: " + id);
        }
        enquiryRepository.deleteById(id);
    }
}
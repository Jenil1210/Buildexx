package com.buildex.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rent_requests")
public class RentRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "amenities", "galleryImages", "panoramaImages", "panorama_images", "virtualTours", "images", "payments", "hibernateLazyInitializer", "handler" })
    private Property property;
    
    @Column(name = "applicant_name", nullable = false)
    private String applicantName;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "monthly_rent")
    private BigDecimal monthlyRent;
    
    @Column(name = "deposit")
    private BigDecimal deposit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum Status {
        PENDING, APPROVED, REJECTED
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
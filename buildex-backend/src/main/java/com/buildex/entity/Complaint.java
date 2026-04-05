package com.buildex.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "amenities", "galleryImages", "panoramaImages", "panorama_images", "virtualTours", "images", "hibernateLazyInitializer", "handler" })
    private Property property;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"properties", "password"})
    private User user;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status; // e.g., "PENDING", "RESOLVED"

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

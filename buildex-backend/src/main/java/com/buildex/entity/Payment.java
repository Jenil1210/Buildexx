package com.buildex.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data; // Restored
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"properties", "password"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnoreProperties({ "amenities", "galleryImages", "panoramaImages", "panorama_images", "virtualTours", "images", "payments", "complaints", "enquiries", "hibernateLazyInitializer", "handler" })
    private Property property;

    @ManyToOne
    @JoinColumn(name = "builder_id")
    @JsonIgnoreProperties({"properties", "password"})
    private User builder; // Builder is now a User with role='builder'

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status;

    @Column(name = "amount")
    private BigDecimal amount; // The amount paid in this transaction (Booking Amount)

    @Column(name = "total_amount")
    private BigDecimal totalAmount; // The total price/rent of the property

    @Column(name = "remaining_amount")
    private BigDecimal remainingAmount; // Calculated as Total - Booking

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "rent_month")
    private String rentMonth; // e.g., "January 2026"

    @Column(name = "next_due_date")
    private java.time.LocalDate nextDueDate;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "payment_type")
    @Enumerated(EnumType.STRING)
    private PaymentType paymentType; // BUY, RENT (from Property Purpose)

    @Column(name = "currency")
    @Builder.Default
    private String currency = "INR";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }

    public enum PaymentType {
        BUY, RENT
    }
}

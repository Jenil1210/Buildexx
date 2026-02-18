package com.buildex.repository;

import com.buildex.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.property prop LEFT JOIN FETCH prop.builder LEFT JOIN FETCH p.builder")
    List<Payment> findAllWithDetails();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Payment p WHERE p.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    List<Payment> findByBuilderId(Long builderId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Check if a user has already booked a specific property
    // We assume only one successful booking per property per user is relevant for
    // the button disable logic
    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.user.id = :userId AND p.property.id = :propertyId AND p.status = :status")
    boolean existsByUserIdAndPropertyIdAndStatus(@Param("userId") Long userId, @Param("propertyId") Long propertyId,
            @Param("status") Payment.PaymentStatus status);
}

package com.buildex.controller;

import com.buildex.entity.Payment;
import com.buildex.service.EmailService;
import com.buildex.service.PaymentService;
import com.buildex.model.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasAnyRole('USER', 'BUILDER', 'ADMIN')")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal AuthenticatedUser principal) {
        try {
            Long userId = payload.get("userId");
            if (!principal.getRole().equalsIgnoreCase("admin") && !principal.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
            }
            Long propertyId = payload.get("propertyId");
            Payment payment = paymentService.createOrder(userId, propertyId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        try {
            String orderId = payload.get("razorpay_order_id");
            String paymentIdValue = payload.get("razorpay_payment_id");
            String signature = payload.get("razorpay_signature");

            Payment payment = paymentService.verifyPayment(orderId, paymentIdValue, signature);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<?> getUserPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/builder/{builderId}")
    @PreAuthorize("hasRole('ADMIN') or #builderId == authentication.principal.id")
    public ResponseEntity<?> getBuilderPayments(@PathVariable Long builderId) {
        return ResponseEntity.ok(paymentService.getBuilderPayments(builderId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'BUILDER', 'ADMIN')")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        Payment payment = paymentService.getPaymentById(id);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        if (!principal.getRole().equalsIgnoreCase("admin") &&
            !payment.getUser().getId().equals(principal.getId()) &&
            (payment.getProperty().getBuilder() == null || !payment.getProperty().getBuilder().getId().equals(principal.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
        }
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/check-booking")
    @PreAuthorize("hasAnyRole('USER', 'BUILDER', 'ADMIN')")
    public ResponseEntity<?> checkBookingStatus(@RequestParam Long userId, @RequestParam Long propertyId, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!principal.getRole().equalsIgnoreCase("admin") && !principal.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
        }
        boolean isBooked = paymentService.hasUserBookedProperty(userId, propertyId);
        return ResponseEntity.ok(Map.of("isBooked", isBooked));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.ok(Map.of("message", "Payment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

package com.buildex.controller;

import com.buildex.entity.Payment;
import com.buildex.service.EmailService;
import com.buildex.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> payload) {
        try {
            Long userId = payload.get("userId");
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
    public ResponseEntity<?> getUserPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/builder/{builderId}")
    public ResponseEntity<?> getBuilderPayments(@PathVariable Long builderId) {
        return ResponseEntity.ok(paymentService.getBuilderPayments(builderId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/check-booking")
    public ResponseEntity<?> checkBookingStatus(@RequestParam Long userId, @RequestParam Long propertyId) {
        boolean isBooked = paymentService.hasUserBookedProperty(userId, propertyId);
        return ResponseEntity.ok(Map.of("isBooked", isBooked));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.ok(Map.of("message", "Payment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

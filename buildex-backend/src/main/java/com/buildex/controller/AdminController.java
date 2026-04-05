package com.buildex.controller;

import com.buildex.entity.Complaint;
import com.buildex.entity.Payment;
import com.buildex.entity.Withdrawal;
import com.buildex.repository.ComplaintRepository;
import com.buildex.repository.PaymentRepository;
import com.buildex.repository.WithdrawalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ComplaintRepository complaintRepository;
    private final PaymentRepository paymentRepository;
    private final WithdrawalRepository withdrawalRepository;

    public AdminController(ComplaintRepository complaintRepository, PaymentRepository paymentRepository,
            WithdrawalRepository withdrawalRepository) {
        this.complaintRepository = complaintRepository;
        this.paymentRepository = paymentRepository;
        this.withdrawalRepository = withdrawalRepository;
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        return complaintRepository.findById(id)
                .map(complaint -> {
                    complaint.setStatus(status);
                    complaintRepository.save(complaint);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Complaint resolved"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAllWithDetails());
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<List<Withdrawal>> getAllWithdrawals() {
        return ResponseEntity.ok(withdrawalRepository.findAll());
    }

    @PatchMapping("/withdrawals/{id}/status")
    public ResponseEntity<?> updateWithdrawalStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        Double commission = body.get("commission") != null ? Double.valueOf(body.get("commission").toString()) : 0.0;
        Double payout = body.get("payout") != null ? Double.valueOf(body.get("payout").toString()) : 0.0;

        return withdrawalRepository.findById(id)
                .map(withdrawal -> {
                    withdrawal.setStatus(status);
                    withdrawal.setCommissionAmount(java.math.BigDecimal.valueOf(commission));
                    withdrawal.setPayoutAmount(java.math.BigDecimal.valueOf(payout));
                    withdrawalRepository.save(withdrawal);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Withdrawal status updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

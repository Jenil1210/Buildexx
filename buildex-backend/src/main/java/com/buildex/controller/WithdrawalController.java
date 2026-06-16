package com.buildex.controller;

import com.buildex.entity.User;
import com.buildex.entity.Withdrawal;
import com.buildex.repository.UserRepository;
import com.buildex.repository.WithdrawalRepository;
import com.buildex.model.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "*")
public class WithdrawalController {

    private final WithdrawalRepository withdrawalRepository;
    private final UserRepository userRepository;

    public WithdrawalController(WithdrawalRepository withdrawalRepository, UserRepository userRepository) {
        this.withdrawalRepository = withdrawalRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUILDER', 'ADMIN')")
    public ResponseEntity<?> createWithdrawalRequest(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal AuthenticatedUser principal) {
        try {
            Long builderId = Long.valueOf(payload.get("builderId").toString());
            if (!principal.getRole().equalsIgnoreCase("admin") && !principal.getId().equals(builderId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access Denied"));
            }

            Double amount = Double.valueOf(payload.get("amount").toString());

            User builder = userRepository.findById(builderId)
                    .orElseThrow(() -> new RuntimeException("Builder not found"));

            Withdrawal withdrawal = new Withdrawal();
            withdrawal.setBuilder(builder);
            withdrawal.setAmount(BigDecimal.valueOf(amount));
            withdrawal.setStatus("pending");

            // Initial values
            withdrawal.setCommissionAmount(BigDecimal.ZERO);
            withdrawal.setPayoutAmount(BigDecimal.ZERO);

            Withdrawal saved = withdrawalRepository.save(withdrawal);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/builder/{builderId}")
    @PreAuthorize("hasRole('ADMIN') or #builderId == authentication.principal.id")
    public ResponseEntity<List<Withdrawal>> getBuilderWithdrawals(@PathVariable Long builderId) {
        return ResponseEntity.ok(withdrawalRepository.findByBuilderId(builderId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Withdrawal>> getAllWithdrawals() {
        return ResponseEntity.ok(withdrawalRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateWithdrawalStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Double commission,
            @RequestParam(required = false) Double payout) {
        try {
            Withdrawal withdrawal = withdrawalRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Withdrawal not found"));

            withdrawal.setStatus(status);
            if (commission != null)
                withdrawal.setCommissionAmount(BigDecimal.valueOf(commission));
            if (payout != null)
                withdrawal.setPayoutAmount(BigDecimal.valueOf(payout));

            Withdrawal saved = withdrawalRepository.save(withdrawal);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

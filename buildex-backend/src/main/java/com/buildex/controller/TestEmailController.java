package com.buildex.controller;

import com.buildex.service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-email")
public class TestEmailController {

    private final EmailService emailService;

    public TestEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public String sendTestEmail(@RequestParam String to) {
        emailService.sendTestEmail(to);
        return "System Status Email sent to " + to;
    }
}

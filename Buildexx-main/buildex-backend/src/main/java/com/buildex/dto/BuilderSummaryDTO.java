package com.buildex.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuilderSummaryDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String companyName;
    private String reraNumber;
    private Boolean isVerified;
    private String profileIcon;
    private Long activeListings;
    private Double totalCommissionPaid;
    
    // Constructor matching the JPQL query signature
    public BuilderSummaryDTO(Long id, String username, String email, String fullName, String phone, String companyName,
            com.buildex.entity.User.VerificationStatus verificationStatus, String status, Long propertyCount) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phone;
        this.companyName = companyName;
        this.isVerified = verificationStatus == com.buildex.entity.User.VerificationStatus.VERIFIED;
        this.activeListings = propertyCount;
        this.status = status;
    }
    
    // Additional fields needed for JPQL mapping
    private String username;
    private String status;
}

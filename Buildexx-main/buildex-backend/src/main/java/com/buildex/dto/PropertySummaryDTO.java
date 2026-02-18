package com.buildex.dto;

import com.buildex.entity.Property.AvailabilityStatus;
import com.buildex.entity.Property.PropertyType;
import com.buildex.entity.Property.Purpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySummaryDTO {
    private Long id;
    private String title;
    private BigDecimal price;
    @com.fasterxml.jackson.annotation.JsonProperty("rent_amount")
    private BigDecimal rentAmount; // Include rent for rental properties
    private String city;
    @com.fasterxml.jackson.annotation.JsonProperty("locality")
    private String area; // Locality
    private String thumbnail; // First image only
    private PropertyType type;
    private Purpose purpose;
    private AvailabilityStatus availability;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer areaSqft;
    private String builderName; // Useful for display
    private Boolean isVerified; // Useful for badges
    private String status; // "approved", "pending", "rejected"
    private Double latitude;
    private Double longitude;
    @com.fasterxml.jackson.annotation.JsonProperty("legal_document_url")
    private String legalDocumentUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("panorama_image_url")
    private String panoramaImageUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("brochure_url")
    private String brochureUrl;
}

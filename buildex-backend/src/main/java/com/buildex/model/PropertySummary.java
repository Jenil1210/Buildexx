package com.buildex.model;

import java.math.BigDecimal;
import java.util.List;

public interface PropertySummary {
    Long getId();

    String getTitle();

    String getCity();

    String getArea();

    BigDecimal getPrice();

    BigDecimal getRentAmount();

    String getPropertyType();

    String getPurpose();

    String getAvailabilityStatus();

    List<String> getImageUrls(); // We might want to limit this in query or just fetch all keys
    // Helper to get just the first image could be done in default method if
    // supported or frontend

    // Default method to get the thumbnail (first image)
    default String getThumbnail() {
        List<String> images = getImageUrls();
        return (images != null && !images.isEmpty()) ? images.get(0) : null;
    }
}

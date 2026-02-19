package com.buildex.config;

import com.buildex.entity.User;
import com.buildex.entity.Property;
import com.buildex.repository.UserRepository;
import com.buildex.repository.PropertyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;

// @Component  // Temporarily disabled due to database connection issues
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public DataSeeder(UserRepository userRepository, PropertyRepository propertyRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Properties if none exist
        if (propertyRepository.count() == 0) {
            System.out.println("No properties found. Seeding sample property data...");
            seedData();
        } else {
            System.out.println("Properties already exist. Skipping heavy seeding to speed up startup.");
        }
    }

    private void seedData() {
        // Find an existing builder or create one
        User builder = userRepository.findAll().stream()
                .filter(u -> "builder".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .orElseGet(() -> {
                    System.out.println("No builder found. Creating sample builder...");
                    User newBuilder = new User();
                    newBuilder.setUsername("dvbhai");
                    newBuilder.setEmail("visodiyadhyey@gmail.com");
                    newBuilder.setPassword("123456");
                    newBuilder.setFullName("DVBhai");
                    newBuilder.setPhone("123456789");
                    newBuilder.setRole("builder");
                    newBuilder.setStatus("active");
                    newBuilder.setCompanyName("DV(Builder)");
                    newBuilder.setVerificationStatus(User.VerificationStatus.VERIFIED);
                    return userRepository.save(newBuilder);
                });

        System.out.println("Using Builder: " + builder.getCompanyName());

        // Create Property
        Property property = new Property();
        property.setTitle("Luxury 3BHK Apartment");
        property.setDescription("Beautiful 3BHK apartment with modern amenities in the heart of the city.");
        property.setPropertyType(Property.PropertyType.RESIDENTIAL);
        property.setPurpose(Property.Purpose.RENT);
        property.setRentAmount(new BigDecimal("25000.00"));
        property.setAreaSqft(1500);
        property.setCity("Mumbai");
        property.setArea("Bandra");
        property.setConstructionStatus(Property.ConstructionStatus.READY);
        property.setAvailabilityStatus(Property.AvailabilityStatus.AVAILABLE);
        property.setIsVerified(false); // Manual verification required by admin
        property.setBuilder(builder); // Link to builder

        // Set Images
        property.setGalleryImages(new ArrayList<>(Arrays.asList(
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80")));

        // Set Amenities
        property.setAmenities(new HashSet<>(Arrays.asList("Gym", "Parking", "Security", "Pool")));

        // Set 360 Images
        property.setPanoramaImages(new java.util.ArrayList<>(java.util.Arrays.asList(
                "https://pannellum.org/images/alma.jpg",
                "https://pannellum.org/images/jfk.jpg")));

        propertyRepository.save(property);
        System.out.println("Sample Property created: " + property.getTitle());
    }
}

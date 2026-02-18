package com.buildex.service;

import com.buildex.entity.Property;
import com.buildex.exception.ResourceNotFoundException;
import com.buildex.repository.PropertyRepository;
import com.buildex.repository.UserRepository;
import com.buildex.repository.ComplaintRepository;
import com.buildex.repository.EnquiryRepository;
import com.buildex.repository.RentRequestRepository;
import com.buildex.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.buildex.dto.PropertySummaryDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final EnquiryRepository enquiryRepository;
    private final RentRequestRepository rentRequestRepository;
    private final PaymentRepository paymentRepository;

    public PropertyService(PropertyRepository propertyRepository,
            UserRepository userRepository,
            ComplaintRepository complaintRepository,
            EnquiryRepository enquiryRepository,
            RentRequestRepository rentRequestRepository,
            PaymentRepository paymentRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.enquiryRepository = enquiryRepository;
        this.rentRequestRepository = rentRequestRepository;
        this.paymentRepository = paymentRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    @CacheEvict(value = { "properties_list", "properties_search" }, allEntries = true)
    public Property createProperty(Long userId, Property property) {
        return userRepository.findById(userId)
                .map(user -> {
                    // Start of Selection
                    if (!"builder".equalsIgnoreCase(user.getRole())) {
                        throw new IllegalArgumentException("User is not a builder");
                    }
                    property.setBuilder(user);
                    property.setIsVerified(false); // Force manual verification by admin
                    return propertyRepository.save(property);
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Cacheable(value = "property_details", key = "#id")
    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Cacheable(value = "property_details", key = "#id")
    public Optional<Property> getPropertyByIdEager(Long id) {
        Optional<Property> propertyOpt = propertyRepository.findByIdWithBuilder(id);
        
        propertyOpt.ifPresent(property -> {
            if (property.getGalleryImages() != null) property.getGalleryImages().size();
            if (property.getAmenities() != null) property.getAmenities().size();
            if (property.getPanoramaImages() != null) property.getPanoramaImages().size();
            if (property.getBuilder() != null) property.getBuilder().getEmail();
        });
        
        return propertyOpt;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PropertySummaryDTO> getAllPropertiesForAdmin() {
        return propertyRepository.findAllWithBuilder().stream()
                .map(this::convertToSummaryDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Property> getAllProperties() {
        // Default to fetching latest 20 properties for performance - ONLY VERIFIED
        return propertyRepository.findByIsVerifiedTrue(org.springframework.data.domain.PageRequest.of(0, 20,
                org.springframework.data.domain.Sort.by("createdAt").descending())).getContent();
    }

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "builder" })
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Cacheable(value = "properties_list", key = "{#page, #size}")
    public org.springframework.data.domain.Page<PropertySummaryDTO> getAllPropertiesSummaries(int page,
            int size) {
        return propertyRepository.findByIsVerifiedTrue(org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("createdAt").descending()))
                .map(this::convertToSummaryDTO);
    }

    private PropertySummaryDTO convertToSummaryDTO(Property property) {
        // Determine thumbnail WITHOUT accessing lazy-loaded galleryImages
        String thumbnail = property.getImageUrl();
        if (thumbnail == null || thumbnail.isEmpty()) {
            // Use native query to get first gallery image — avoids lazy loading
            thumbnail = propertyRepository.findThumbnail(property.getId());
        }

        return PropertySummaryDTO.builder()
                .id(property.getId())
                .title(property.getTitle())
                .price(property.getPrice())
                .rentAmount(property.getRentAmount())
                .city(property.getCity())
                .area(property.getArea()) // Map locality
                .thumbnail(thumbnail)
                .type(property.getPropertyType())
                .purpose(property.getPurpose())
                .availability(property.getAvailabilityStatus())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .areaSqft(property.getAreaSqft())
                .builderName(property.getBuilderName())
                .isVerified(property.getIsVerified())
                .status(property.getStatus())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .legalDocumentUrl(property.getLegalDocumentUrl())
                .panoramaImageUrl(property.getPanoramaImageUrl())
                .brochureUrl(property.getBrochureUrl())
                .build();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Cacheable(value = "properties_search", key = "{#purpose, #propertyType, #city, #area, #availabilityStatus, #search, #page, #size}")
    public org.springframework.data.domain.Page<PropertySummaryDTO> searchPropertiesSummariesPaginated(
            Property.Purpose purpose,
            Property.PropertyType propertyType,
            String city,
            String area,
            Property.AvailabilityStatus availabilityStatus,
            String search,
            int page, int size) {
        return propertyRepository.findByFiltersPaginated(purpose, propertyType, city, area, availabilityStatus, search,
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("createdAt").descending()))
                .map(this::convertToSummaryDTO);
    }

    public org.springframework.data.domain.Page<Property> getAllProperties(int page, int size) {
        return propertyRepository.findByIsVerifiedTrue(org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Property> getPropertiesByBuilderId(Long builderId) {
        List<Property> properties = propertyRepository.findByBuilder_Id(builderId);
        // Initialize lazy collections
        properties.forEach(p -> {
            if (p.getAmenities() != null) p.getAmenities().size();
            if (p.getGalleryImages() != null) p.getGalleryImages().size();
            if (p.getPanoramaImages() != null) p.getPanoramaImages().size();
            // Initialize User proxy (builder) - Access non-ID field to force load
            if (p.getBuilder() != null) p.getBuilder().getEmail();
        });
        return properties;
    }

    @org.springframework.transaction.annotation.Transactional
    @Caching(evict = {
            @CacheEvict(value = "property_details", key = "#id"),
            @CacheEvict(value = { "properties_list", "properties_search" }, allEntries = true)
    })
    public Optional<Property> updateProperty(Long id, Property updatedProperty) {
        return propertyRepository.findById(id).map(existingProperty -> {
            // Update basic fields
            existingProperty.setTitle(updatedProperty.getTitle());
            existingProperty.setDescription(updatedProperty.getDescription());
            existingProperty.setPropertyType(updatedProperty.getPropertyType());
            existingProperty.setPurpose(updatedProperty.getPurpose());
            existingProperty.setPrice(updatedProperty.getPrice());
            existingProperty.setRentAmount(updatedProperty.getRentAmount());
            existingProperty.setDepositAmount(updatedProperty.getDepositAmount());
            existingProperty.setAreaSqft(updatedProperty.getAreaSqft());
            existingProperty.setBedrooms(updatedProperty.getBedrooms());
            existingProperty.setBathrooms(updatedProperty.getBathrooms());
            existingProperty.setPossessionYear(updatedProperty.getPossessionYear());
            existingProperty.setConstructionStatus(updatedProperty.getConstructionStatus());
            existingProperty.setAvailabilityStatus(updatedProperty.getAvailabilityStatus());
            existingProperty.setCity(updatedProperty.getCity());
            existingProperty.setArea(updatedProperty.getArea());
            existingProperty.setGoogleMapLink(updatedProperty.getGoogleMapLink());
            existingProperty.setBrochureUrl(updatedProperty.getBrochureUrl());
            existingProperty.setVirtualTourLink(updatedProperty.getVirtualTourLink());
            existingProperty.setLegalDocumentUrl(updatedProperty.getLegalDocumentUrl());
            existingProperty.setLatitude(updatedProperty.getLatitude());
            existingProperty.setLongitude(updatedProperty.getLongitude());
            existingProperty.setImageUrl(updatedProperty.getImageUrl());
            existingProperty.setPanoramaImageUrl(updatedProperty.getPanoramaImageUrl());

            // Update collections (Selective replacement/merge if needed)
            if (updatedProperty.getAmenities() != null) {
                existingProperty.setAmenities(updatedProperty.getAmenities());
            }
            if (updatedProperty.getGalleryImages() != null) {
                existingProperty.setGalleryImages(updatedProperty.getGalleryImages());
            }
            if (updatedProperty.getPanoramaImages() != null) {
                existingProperty.setPanoramaImages(updatedProperty.getPanoramaImages());
            }

            Property saved = propertyRepository.save(existingProperty);
            
            // Initialize lazy collections
            if (saved.getAmenities() != null) saved.getAmenities().size();
            if (saved.getGalleryImages() != null) saved.getGalleryImages().size();
            if (saved.getPanoramaImages() != null) saved.getPanoramaImages().size();
            
            // Initialize User proxy (builder) - Access non-ID field to force load
            if (saved.getBuilder() != null) saved.getBuilder().getEmail();
            
            return saved;
        });
    }

    @Caching(evict = {
            @CacheEvict(value = "property_details", key = "#id"),
            @CacheEvict(value = { "properties_list", "properties_search" }, allEntries = true)
    })
    public Optional<Property> updateAvailabilityStatus(Long id, Property.AvailabilityStatus status) {
        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isPresent()) {
            Property property = propertyOpt.get();
            property.setAvailabilityStatus(status);
            return Optional.of(propertyRepository.save(property));
        }
        return Optional.empty();
    }

    @org.springframework.transaction.annotation.Transactional
    @Caching(evict = {
            @CacheEvict(value = "property_details", key = "#id"),
            @CacheEvict(value = { "properties_list", "properties_search" }, allEntries = true)
    })
    public void deleteProperty(Long id) {
        // Delete related entities first to avoid FK constraint violations
        // RentRequest uses direct ID mapping, so we must delete manually
        rentRequestRepository.deleteByPropertyId(id);

        // Manually delete other related entities to avoid FK issues
        paymentRepository.deleteByPropertyId(id);
        complaintRepository.deleteByPropertyId(id);
        enquiryRepository.deleteByPropertyId(id);

        propertyRepository.deleteById(id);
    }

    public List<Property> searchProperties(Property.Purpose purpose,
            Property.PropertyType propertyType,
            String city,
            String area,
            Property.AvailabilityStatus availabilityStatus) {
        return propertyRepository.findByFilters(purpose, propertyType, city, area, availabilityStatus, null);
    }

    public org.springframework.data.domain.Page<Property> searchProperties(Property.Purpose purpose,
            Property.PropertyType propertyType,
            String city,
            String area,
            Property.AvailabilityStatus availabilityStatus,
            int page, int size) {
        return propertyRepository.findByFiltersPaginated(purpose, propertyType, city, area, availabilityStatus, null,
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @org.springframework.transaction.annotation.Transactional
    @Caching(evict = {
            @CacheEvict(value = "property_details", key = "#id"),
            @CacheEvict(value = { "properties_list", "properties_search" }, allEntries = true)
    })
    public Optional<Property> verifyProperty(Long id, Boolean isVerified) {
        return propertyRepository.findById(id).map(property -> {
            property.setIsVerified(isVerified);
            Property saved = propertyRepository.save(property);
            
            // Initialize lazy collections to avoid LazyInitializationException during serialization
            if (saved.getAmenities() != null) saved.getAmenities().size();
            if (saved.getGalleryImages() != null) saved.getGalleryImages().size();
            if (saved.getPanoramaImages() != null) saved.getPanoramaImages().size();
            // Initialize User proxy (builder) - Access non-ID field to force load
            if (saved.getBuilder() != null) saved.getBuilder().getEmail();
            
            return saved;
        });
    }

    @Cacheable(value = "cities")
    public List<String> getAllCities() {
        return propertyRepository.findAllCities();
    }
}
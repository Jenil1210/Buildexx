package com.buildex.repository;

import com.buildex.entity.Property;
import com.buildex.entity.Property.AvailabilityStatus;
import com.buildex.entity.Property.Purpose;
import com.buildex.entity.Property.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
       List<Property> findByBuilder_Id(Long builderId);

       @Query(value = "SELECT p FROM Property p LEFT JOIN FETCH p.builder WHERE p.isVerified = true", countQuery = "SELECT COUNT(p) FROM Property p WHERE p.isVerified = true")
       org.springframework.data.domain.Page<Property> findByIsVerifiedTrue(
                     org.springframework.data.domain.Pageable pageable);

       @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "builder" })
       @Query("SELECT p FROM Property p")
       List<Property> findAllWithBuilder();

       List<Property> findByPurpose(Purpose purpose);

       List<Property> findByPropertyType(PropertyType propertyType);

       List<Property> findByCity(String city);

       List<Property> findByCityAndArea(String city, String area);

       List<Property> findByAvailabilityStatus(AvailabilityStatus availabilityStatus);

       @Query("SELECT p FROM Property p LEFT JOIN FETCH p.builder WHERE " +
                     "(:purpose IS NULL OR p.purpose = :purpose) AND " +
                     "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
                     "(:city IS NULL OR LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) AND " +
                     "(:area IS NULL OR LOWER(CAST(p.area AS string)) LIKE LOWER(CONCAT('%', CAST(:area AS string), '%'))) AND " +
                     "(:availabilityStatus IS NULL OR p.availabilityStatus = :availabilityStatus) AND " +
                     "(:search IS NULL OR (LOWER(CAST(p.title AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.builder.companyName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.builder.fullName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.area AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))) AND " +
                     "(p.isVerified = true)")
       List<Property> findByFilters(@Param("purpose") Purpose purpose,
                     @Param("propertyType") PropertyType propertyType,
                     @Param("city") String city,
                     @Param("area") String area,
                     @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
                     @Param("search") String search);

       @Query("SELECT p FROM Property p LEFT JOIN FETCH p.builder WHERE " +
                     "(:purpose IS NULL OR p.purpose = :purpose) AND " +
                     "(:propertyType IS NULL OR p.propertyType = :propertyType) AND " +
                     "(:city IS NULL OR LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) AND " +
                     "(:area IS NULL OR LOWER(CAST(p.area AS string)) LIKE LOWER(CONCAT('%', CAST(:area AS string), '%'))) AND " +
                     "(:availabilityStatus IS NULL OR p.availabilityStatus = :availabilityStatus) AND " +
                     "(:search IS NULL OR (LOWER(CAST(p.title AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.builder.companyName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.builder.fullName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                     "LOWER(CAST(p.area AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))) AND " +
                     "(p.isVerified = true)")
       org.springframework.data.domain.Page<Property> findByFiltersPaginated(@Param("purpose") Purpose purpose,
                     @Param("propertyType") PropertyType propertyType,
                     @Param("city") String city,
                     @Param("area") String area,
                     @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
                     @Param("search") String search,
                     org.springframework.data.domain.Pageable pageable);

       @Query("SELECT DISTINCT p.city FROM Property p WHERE p.city IS NOT NULL ORDER BY p.city")
       List<String> findAllCities();

       @Query("SELECT p FROM Property p LEFT JOIN FETCH p.builder WHERE p.id = :id")
       Optional<Property> findByIdWithBuilder(@Param("id") Long id);

       @Query(value = "SELECT COALESCE(p.image_url, (SELECT gallery_image_url FROM property_gallery_images WHERE property_id = p.id LIMIT 1)) FROM properties p WHERE p.id = :propertyId", nativeQuery = true)
       String findThumbnail(@Param("propertyId") Long propertyId);
}
package com.buildex.repository;

import com.buildex.entity.RentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentRequestRepository extends JpaRepository<RentRequest, Long> {
    List<RentRequest> findByPropertyId(Long propertyId);

    @Query("SELECT rr FROM RentRequest rr WHERE rr.property.id IN " +
            "(SELECT p.id FROM Property p WHERE p.builder.id = :builderId)")
    List<RentRequest> findByBuilderId(@Param("builderId") Long builderId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM RentRequest r WHERE r.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    java.util.Optional<RentRequest> findByPropertyIdAndEmail(Long propertyId, String email);
}
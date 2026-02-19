package com.buildex.repository;

import com.buildex.entity.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    List<Enquiry> findByPropertyId(Long propertyId);

    List<Enquiry> findByPropertyIdIn(List<Long> propertyIds);

    @Query("SELECT e FROM Enquiry e WHERE e.property.builder.id = :builderId")
    List<Enquiry> findByBuilderId(@Param("builderId") Long builderId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Enquiry e WHERE e.property.id = :propertyId")
    void deleteByPropertyId(Long propertyId);

    List<Enquiry> findByEmail(String email);
}
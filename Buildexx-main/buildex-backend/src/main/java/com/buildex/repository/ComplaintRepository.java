package com.buildex.repository;

import com.buildex.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByPropertyId(Long propertyId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Complaint c WHERE c.property.id = :propertyId")
    void deleteByPropertyId(Long propertyId);

    List<Complaint> findByStatus(String status);
}

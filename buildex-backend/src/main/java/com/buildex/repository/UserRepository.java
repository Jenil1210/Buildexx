package com.buildex.repository;

import com.buildex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import com.buildex.dto.BuilderSummaryDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    java.util.List<User> findAllByRole(String role);

    @Query("SELECT new com.buildex.dto.BuilderSummaryDTO(u.id, u.username, u.email, u.fullName, u.phone, u.companyName, u.verificationStatus, u.status, COUNT(p)) "
            +
            "FROM User u LEFT JOIN u.properties p " +
            "WHERE u.role = :role " +
            "GROUP BY u.id, u.username, u.email, u.fullName, u.phone, u.companyName, u.verificationStatus, u.status")
    java.util.List<BuilderSummaryDTO> findAllBuilderSummaries(@Param("role") String role);
}

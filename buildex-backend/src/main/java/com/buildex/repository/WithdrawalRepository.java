package com.buildex.repository;

import com.buildex.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    List<Withdrawal> findByBuilderId(Long builderId);

    List<Withdrawal> findByStatus(String status);
}

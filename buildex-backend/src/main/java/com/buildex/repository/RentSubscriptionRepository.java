package com.buildex.repository;

import com.buildex.entity.RentSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentSubscriptionRepository extends JpaRepository<RentSubscription, Long> {
    List<RentSubscription> findByUserId(Long userId);
    List<RentSubscription> findByBuilderId(Long builderId);
    Optional<RentSubscription> findByUserIdAndPropertyId(Long userId, Long propertyId);
}

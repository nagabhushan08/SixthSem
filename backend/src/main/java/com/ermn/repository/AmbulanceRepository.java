package com.ermn.repository;

import com.ermn.model.entity.Ambulance;
import com.ermn.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    Optional<Ambulance> findByDriver(User driver);
    List<Ambulance> findByIsAvailableTrueAndIsApprovedTrue();
    long countByIsAvailableTrueAndIsApprovedTrue();
    long countByIsApprovedFalse();
    
    @Query("SELECT a FROM Ambulance a WHERE a.isAvailable = true AND a.isApproved = true " +
           "AND a.currentLatitude IS NOT NULL AND a.currentLongitude IS NOT NULL")
    List<Ambulance> findAvailableApprovedAmbulancesWithLocation();
}

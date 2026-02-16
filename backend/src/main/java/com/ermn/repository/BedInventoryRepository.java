package com.ermn.repository;

import com.ermn.model.entity.BedInventory;
import com.ermn.model.entity.Hospital;
import com.ermn.model.enums.BedType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedInventoryRepository extends JpaRepository<BedInventory, Long> {
    List<BedInventory> findByHospital(Hospital hospital);
    Optional<BedInventory> findByHospitalAndBedType(Hospital hospital, BedType bedType);
    
    @Query("SELECT SUM(bi.totalCapacity) FROM BedInventory bi")
    Long getTotalCapacity();
    
    @Query("SELECT SUM(bi.availableCount) FROM BedInventory bi")
    Long getTotalAvailable();
    
    @Query("SELECT SUM(bi.totalCapacity - bi.availableCount) FROM BedInventory bi")
    Long getTotalOccupied();
}

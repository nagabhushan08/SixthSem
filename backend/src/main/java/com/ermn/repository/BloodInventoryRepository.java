package com.ermn.repository;

import com.ermn.model.entity.BloodBank;
import com.ermn.model.entity.BloodInventory;
import com.ermn.model.enums.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {
    List<BloodInventory> findByBloodBank(BloodBank bloodBank);
    Optional<BloodInventory> findByBloodBankAndBloodGroup(BloodBank bloodBank, BloodGroup bloodGroup);
    List<BloodInventory> findByIsEmergencyShortageTrue();
    
    @Query("SELECT bi FROM BloodInventory bi WHERE bi.bloodGroup = :bloodGroup " +
           "AND bi.quantityUnits > 0 ORDER BY bi.bloodBank.latitude, bi.bloodBank.longitude")
    List<BloodInventory> findByBloodGroup(@Param("bloodGroup") BloodGroup bloodGroup);
    
    @Query("SELECT COUNT(bi) FROM BloodInventory bi WHERE bi.isEmergencyShortage = true")
    long countEmergencyShortages();
}

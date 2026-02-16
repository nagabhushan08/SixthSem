package com.ermn.repository;

import com.ermn.model.entity.BloodBank;
import com.ermn.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {
    Optional<BloodBank> findByAdmin(User admin);
}

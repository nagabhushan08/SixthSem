package com.ermn.repository;

import com.ermn.model.entity.Hospital;
import com.ermn.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByAdmin(User admin);
}

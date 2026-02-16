package com.ermn.repository;

import com.ermn.model.entity.Booking;
import com.ermn.model.entity.User;
import com.ermn.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCitizen(User citizen);
    List<Booking> findByCitizenOrderByCreatedAtDesc(User citizen);
    Optional<Booking> findByIdAndCitizen(Long id, User citizen);
    
    @Query("SELECT b FROM Booking b WHERE b.ambulance.driver = :driver ORDER BY b.createdAt DESC")
    List<Booking> findByDriver(@Param("driver") User driver);
    
    List<Booking> findByStatus(BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.requestedAt >= :startDate")
    long countByStatusAndRequestedAtAfter(@Param("status") BookingStatus status, 
                                          @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(TIMESTAMPDIFF(SECOND, b.requestedAt, b.assignedAt)) FROM Booking b " +
           "WHERE b.status IN ('ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED') " +
           "AND b.assignedAt IS NOT NULL AND b.requestedAt >= :startDate")
    Double calculateAverageResponseTime(@Param("startDate") LocalDateTime startDate);
}

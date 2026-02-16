package com.ermn.model.entity;

import com.ermn.model.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_citizen_id", columnList = "citizen_id"),
    @Index(name = "idx_ambulance_id", columnList = "ambulance_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_requested_at", columnList = "requested_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id")
    private Ambulance ambulance;

    @Column(name = "pickup_latitude", precision = 10, scale = 8, nullable = false)
    private BigDecimal pickupLatitude;

    @Column(name = "pickup_longitude", precision = 11, scale = 8, nullable = false)
    private BigDecimal pickupLongitude;

    @Column(name = "destination_latitude", precision = 10, scale = 8)
    private BigDecimal destinationLatitude;

    @Column(name = "destination_longitude", precision = 11, scale = 8)
    private BigDecimal destinationLongitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.REQUESTED;

    @Column(name = "requested_at")
    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

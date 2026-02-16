package com.ermn.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ambulances", indexes = {
    @Index(name = "idx_is_available", columnList = "is_available"),
    @Index(name = "idx_is_approved", columnList = "is_approved"),
    @Index(name = "idx_location", columnList = "current_latitude,current_longitude")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", unique = true, nullable = false)
    private User driver;

    @Column(name = "vehicle_number", unique = true, nullable = false)
    private String vehicleNumber;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "current_latitude", precision = 10, scale = 8)
    private BigDecimal currentLatitude;

    @Column(name = "current_longitude", precision = 11, scale = 8)
    private BigDecimal currentLongitude;

    @Column(name = "last_updated_location")
    private LocalDateTime lastUpdatedLocation;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = false;

    @Version
    private Integer version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

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
@Table(name = "blood_banks", indexes = {
    @Index(name = "idx_location", columnList = "latitude,longitude"),
    @Index(name = "idx_admin_id", columnList = "admin_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(precision = 10, scale = 8, nullable = false)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8, nullable = false)
    private BigDecimal longitude;

    private String phone;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", unique = true, nullable = false)
    private User admin;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

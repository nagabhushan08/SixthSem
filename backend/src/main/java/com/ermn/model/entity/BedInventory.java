package com.ermn.model.entity;

import com.ermn.model.enums.BedType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bed_inventory", indexes = {
    @Index(name = "idx_hospital_bed_type", columnList = "hospital_id,bed_type")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_hospital_bed_type", columnNames = {"hospital_id", "bed_type"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false)
    private BedType bedType;

    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    @Column(name = "available_count", nullable = false)
    private Integer availableCount;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}

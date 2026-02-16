package com.ermn.model.entity;

import com.ermn.model.enums.BloodGroup;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blood_inventory", indexes = {
    @Index(name = "idx_blood_bank_group", columnList = "blood_bank_id,blood_group"),
    @Index(name = "idx_emergency_shortage", columnList = "is_emergency_shortage")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_blood_bank_group", columnNames = {"blood_bank_id", "blood_group"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blood_bank_id", nullable = false)
    private BloodBank bloodBank;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Column(name = "quantity_units", nullable = false)
    @Builder.Default
    private Integer quantityUnits = 0;

    @Column(name = "minimum_threshold", nullable = false)
    @Builder.Default
    private Integer minimumThreshold = 10;

    @Column(name = "is_emergency_shortage", nullable = false)
    @Builder.Default
    private Boolean isEmergencyShortage = false;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}

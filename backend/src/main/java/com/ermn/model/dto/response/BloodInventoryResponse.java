package com.ermn.model.dto.response;

import com.ermn.model.enums.BloodGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodInventoryResponse {
    private Long id;
    private BloodGroup bloodGroup;
    private Integer quantityUnits;
    private Integer minimumThreshold;
    private Boolean isEmergencyShortage;
    private LocalDateTime lastUpdated;
}

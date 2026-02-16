package com.ermn.model.dto.response;

import com.ermn.model.enums.BedType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedInventoryResponse {
    private Long id;
    private BedType bedType;
    private Integer totalCapacity;
    private Integer availableCount;
    private LocalDateTime lastUpdated;
}

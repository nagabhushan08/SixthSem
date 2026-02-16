package com.ermn.model.dto.request;

import com.ermn.model.enums.BedType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BedInventoryUpdateRequest {
    @NotNull(message = "Bed type is required")
    private BedType bedType;

    @NotNull(message = "Total capacity is required")
    @Min(value = 0, message = "Total capacity must be non-negative")
    private Integer totalCapacity;

    @NotNull(message = "Available count is required")
    @Min(value = 0, message = "Available count must be non-negative")
    private Integer availableCount;
}

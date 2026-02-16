package com.ermn.model.dto.request;

import com.ermn.model.enums.BloodGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BloodInventoryUpdateRequest {
    @NotNull(message = "Blood group is required")
    private BloodGroup bloodGroup;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantityUnits;

    @Min(value = 1, message = "Minimum threshold must be at least 1")
    private Integer minimumThreshold;
}

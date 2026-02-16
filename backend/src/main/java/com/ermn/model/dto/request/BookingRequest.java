package com.ermn.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookingRequest {
    @NotNull(message = "Pickup latitude is required")
    private BigDecimal pickupLatitude;

    @NotNull(message = "Pickup longitude is required")
    private BigDecimal pickupLongitude;

    private BigDecimal destinationLatitude;
    private BigDecimal destinationLongitude;
}

package com.ermn.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmbulanceResponse {
    private Long id;
    private String vehicleNumber;
    private Boolean isAvailable;
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;
    private LocalDateTime lastUpdatedLocation;
    private Boolean isApproved;
}

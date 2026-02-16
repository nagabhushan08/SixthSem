package com.ermn.model.dto.response;

import com.ermn.model.enums.BookingStatus;
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
public class BookingResponse {
    private Long id;
    private UserResponse citizen;
    private AmbulanceResponse ambulance;
    private BigDecimal pickupLatitude;
    private BigDecimal pickupLongitude;
    private BigDecimal destinationLatitude;
    private BigDecimal destinationLongitude;
    private BookingStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}

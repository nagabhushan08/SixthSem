package com.ermn.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private Long totalBookingsToday;
    private Long totalBookingsWeek;
    private Long totalBookingsMonth;
    private Long activeAmbulances;
    private Double averageResponseTimeSeconds;
    private Double bedOccupancyPercentage;
    private Long bloodShortageAlerts;
    private Long pendingAmbulanceApprovals;
}

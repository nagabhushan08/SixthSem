package com.ermn.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalResponse {
    private Long id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private Double distanceKm;
    private List<BedInventoryResponse> bedInventories;
    private LocalDateTime createdAt;
}

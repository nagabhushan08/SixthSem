package com.ermn.websocket;

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
public class TrackingMessage {
    private Long bookingId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime timestamp;
    private Double speed;
    private Double heading;
}

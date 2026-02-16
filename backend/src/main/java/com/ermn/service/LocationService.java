package com.ermn.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class LocationService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double deltaLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double deltaLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    public BigDecimal roundDistance(double distance) {
        return BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
    }
}

package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.LocationUpdateRequest;
import com.ermn.model.dto.response.AmbulanceResponse;
import com.ermn.model.entity.Ambulance;
import com.ermn.model.entity.User;
import com.ermn.repository.AmbulanceRepository;
import com.ermn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final UserRepository userRepository;

    public AmbulanceService(AmbulanceRepository ambulanceRepository, UserRepository userRepository) {
        this.ambulanceRepository = ambulanceRepository;
        this.userRepository = userRepository;
    }

    public AmbulanceResponse getAmbulanceByDriver(String userEmail) {
        User driver = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Ambulance ambulance = ambulanceRepository.findByDriver(driver)
                .orElseThrow(() -> new CustomException("Ambulance not found for this driver"));

        return mapToAmbulanceResponse(ambulance);
    }

    @Transactional
    public AmbulanceResponse toggleAvailability(Long ambulanceId, String userEmail) {
        User driver = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new CustomException("Ambulance not found"));

        if (!ambulance.getDriver().getId().equals(driver.getId())) {
            throw new CustomException("Unauthorized to modify this ambulance");
        }

        ambulance.setIsAvailable(!ambulance.getIsAvailable());
        ambulance = ambulanceRepository.save(ambulance);

        return mapToAmbulanceResponse(ambulance);
    }

    @Transactional
    public AmbulanceResponse updateLocation(Long ambulanceId, LocationUpdateRequest request, String userEmail) {
        User driver = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new CustomException("Ambulance not found"));

        if (!ambulance.getDriver().getId().equals(driver.getId())) {
            throw new CustomException("Unauthorized to update location");
        }

        ambulance.setCurrentLatitude(request.getLatitude());
        ambulance.setCurrentLongitude(request.getLongitude());
        ambulance.setLastUpdatedLocation(LocalDateTime.now());
        ambulance = ambulanceRepository.save(ambulance);

        return mapToAmbulanceResponse(ambulance);
    }

    public List<AmbulanceResponse> getAllAvailableAmbulances() {
        return ambulanceRepository.findAvailableApprovedAmbulancesWithLocation().stream()
                .map(this::mapToAmbulanceResponse)
                .collect(Collectors.toList());
    }

    public List<AmbulanceResponse> getPendingApprovals() {
        return ambulanceRepository.findAll().stream()
                .filter(ambulance -> !ambulance.getIsApproved())
                .map(this::mapToAmbulanceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbulanceResponse approveAmbulance(Long ambulanceId) {
        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new CustomException("Ambulance not found"));

        ambulance.setIsApproved(true);
        ambulance = ambulanceRepository.save(ambulance);

        return mapToAmbulanceResponse(ambulance);
    }

    private AmbulanceResponse mapToAmbulanceResponse(Ambulance ambulance) {
        return AmbulanceResponse.builder()
                .id(ambulance.getId())
                .vehicleNumber(ambulance.getVehicleNumber())
                .isAvailable(ambulance.getIsAvailable())
                .currentLatitude(ambulance.getCurrentLatitude())
                .currentLongitude(ambulance.getCurrentLongitude())
                .lastUpdatedLocation(ambulance.getLastUpdatedLocation())
                .isApproved(ambulance.getIsApproved())
                .build();
    }
}

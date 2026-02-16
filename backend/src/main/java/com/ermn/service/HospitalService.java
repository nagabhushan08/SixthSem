package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.BedInventoryUpdateRequest;
import com.ermn.model.dto.response.BedInventoryResponse;
import com.ermn.model.dto.response.HospitalResponse;
import com.ermn.model.entity.BedInventory;
import com.ermn.model.entity.Hospital;
import com.ermn.model.entity.User;
import com.ermn.repository.BedInventoryRepository;
import com.ermn.repository.HospitalRepository;
import com.ermn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final BedInventoryRepository bedInventoryRepository;
    private final UserRepository userRepository;
    private final LocationService locationService;

    public HospitalService(HospitalRepository hospitalRepository, BedInventoryRepository bedInventoryRepository,
                          UserRepository userRepository, LocationService locationService) {
        this.hospitalRepository = hospitalRepository;
        this.bedInventoryRepository = bedInventoryRepository;
        this.userRepository = userRepository;
        this.locationService = locationService;
    }

    public List<HospitalResponse> getAllHospitals(BigDecimal userLat, BigDecimal userLon) {
        return hospitalRepository.findAll().stream()
                .map(hospital -> mapToHospitalResponse(hospital, userLat, userLon))
                .sorted((h1, h2) -> {
                    if (h1.getDistanceKm() == null) return 1;
                    if (h2.getDistanceKm() == null) return -1;
                    return Double.compare(h1.getDistanceKm(), h2.getDistanceKm());
                })
                .collect(Collectors.toList());
    }

    public HospitalResponse getHospital(Long id, BigDecimal userLat, BigDecimal userLon) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new CustomException("Hospital not found"));
        return mapToHospitalResponse(hospital, userLat, userLon);
    }

    public HospitalResponse getMyHospital(String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));
        Hospital hospital = hospitalRepository.findByAdmin(admin)
                .orElseThrow(() -> new CustomException("No hospital assigned to your account"));
        return mapToHospitalResponse(hospital, null, null);
    }

    public List<BedInventoryResponse> getBedInventory(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new CustomException("Hospital not found"));
        return bedInventoryRepository.findByHospital(hospital).stream()
                .map(this::mapToBedInventoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BedInventoryResponse updateBedInventory(Long hospitalId, BedInventoryUpdateRequest request, String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new CustomException("Hospital not found"));

        if (!hospital.getAdmin().getId().equals(admin.getId())) {
            throw new CustomException("Unauthorized to update this hospital's inventory");
        }

        BedInventory bedInventory = bedInventoryRepository
                .findByHospitalAndBedType(hospital, request.getBedType())
                .orElse(BedInventory.builder()
                        .hospital(hospital)
                        .bedType(request.getBedType())
                        .build());

        bedInventory.setTotalCapacity(request.getTotalCapacity());
        bedInventory.setAvailableCount(request.getAvailableCount());
        bedInventory = bedInventoryRepository.save(bedInventory);

        return mapToBedInventoryResponse(bedInventory);
    }

    private HospitalResponse mapToHospitalResponse(Hospital hospital, BigDecimal userLat, BigDecimal userLon) {
        Double distance = null;
        if (userLat != null && userLon != null) {
            distance = locationService.calculateDistance(
                    userLat, userLon, hospital.getLatitude(), hospital.getLongitude());
        }

        List<BedInventoryResponse> bedInventories = bedInventoryRepository
                .findByHospital(hospital).stream()
                .map(this::mapToBedInventoryResponse)
                .collect(Collectors.toList());

        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .address(hospital.getAddress())
                .latitude(hospital.getLatitude())
                .longitude(hospital.getLongitude())
                .phone(hospital.getPhone())
                .distanceKm(distance)
                .bedInventories(bedInventories)
                .createdAt(hospital.getCreatedAt())
                .build();
    }

    private BedInventoryResponse mapToBedInventoryResponse(BedInventory bedInventory) {
        return BedInventoryResponse.builder()
                .id(bedInventory.getId())
                .bedType(bedInventory.getBedType())
                .totalCapacity(bedInventory.getTotalCapacity())
                .availableCount(bedInventory.getAvailableCount())
                .lastUpdated(bedInventory.getLastUpdated())
                .build();
    }
}

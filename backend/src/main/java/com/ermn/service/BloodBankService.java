package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.BloodInventoryUpdateRequest;
import com.ermn.model.dto.response.BloodBankResponse;
import com.ermn.model.dto.response.BloodInventoryResponse;
import com.ermn.model.entity.BloodBank;
import com.ermn.model.entity.BloodInventory;
import com.ermn.model.entity.User;
import com.ermn.model.enums.BloodGroup;
import com.ermn.repository.BloodBankRepository;
import com.ermn.repository.BloodInventoryRepository;
import com.ermn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BloodBankService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final UserRepository userRepository;
    private final LocationService locationService;
    private final NotificationService notificationService;

    public BloodBankService(BloodBankRepository bloodBankRepository,
                           BloodInventoryRepository bloodInventoryRepository,
                           UserRepository userRepository, LocationService locationService,
                           NotificationService notificationService) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.userRepository = userRepository;
        this.locationService = locationService;
        this.notificationService = notificationService;
    }

    public List<BloodBankResponse> getAllBloodBanks(BigDecimal userLat, BigDecimal userLon) {
        return bloodBankRepository.findAll().stream()
                .map(bloodBank -> mapToBloodBankResponse(bloodBank, userLat, userLon))
                .sorted((b1, b2) -> {
                    if (b1.getDistanceKm() == null) return 1;
                    if (b2.getDistanceKm() == null) return -1;
                    return Double.compare(b1.getDistanceKm(), b2.getDistanceKm());
                })
                .collect(Collectors.toList());
    }

    public List<BloodBankResponse> searchBloodBanks(BloodGroup bloodGroup, BigDecimal userLat, BigDecimal userLon) {
        List<BloodInventory> inventories = bloodInventoryRepository.findByBloodGroup(bloodGroup);
        return inventories.stream()
                .map(inventory -> mapToBloodBankResponse(inventory.getBloodBank(), userLat, userLon))
                .distinct()
                .sorted((b1, b2) -> {
                    if (b1.getDistanceKm() == null) return 1;
                    if (b2.getDistanceKm() == null) return -1;
                    return Double.compare(b1.getDistanceKm(), b2.getDistanceKm());
                })
                .collect(Collectors.toList());
    }

    public BloodBankResponse getMyBloodBank(String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));
        BloodBank bloodBank = bloodBankRepository.findByAdmin(admin)
                .orElseThrow(() -> new CustomException("No blood bank assigned to your account"));
        return mapToBloodBankResponse(bloodBank, null, null);
    }

    public List<BloodInventoryResponse> getBloodInventory(Long bloodBankId) {
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new CustomException("Blood bank not found"));
        return bloodInventoryRepository.findByBloodBank(bloodBank).stream()
                .map(this::mapToBloodInventoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BloodInventoryResponse updateBloodInventory(Long bloodBankId, BloodInventoryUpdateRequest request, String userEmail) {
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new CustomException("Blood bank not found"));

        if (!bloodBank.getAdmin().getId().equals(admin.getId())) {
            throw new CustomException("Unauthorized to update this blood bank's inventory");
        }

        BloodInventory inventory = bloodInventoryRepository
                .findByBloodBankAndBloodGroup(bloodBank, request.getBloodGroup())
                .orElse(BloodInventory.builder()
                        .bloodBank(bloodBank)
                        .bloodGroup(request.getBloodGroup())
                        .minimumThreshold(request.getMinimumThreshold() != null ? request.getMinimumThreshold() : 10)
                        .build());

        inventory.setQuantityUnits(request.getQuantityUnits());
        if (request.getMinimumThreshold() != null) {
            inventory.setMinimumThreshold(request.getMinimumThreshold());
        }

        // Check for emergency shortage
        boolean isShortage = inventory.getQuantityUnits() < inventory.getMinimumThreshold();
        inventory.setIsEmergencyShortage(isShortage);
        inventory = bloodInventoryRepository.save(inventory);

        // Notify super admin if emergency shortage
        if (isShortage) {
            notificationService.createBloodShortageNotification(bloodBank, request.getBloodGroup());
        }

        return mapToBloodInventoryResponse(inventory);
    }

    public List<BloodInventoryResponse> getEmergencyShortages() {
        return bloodInventoryRepository.findByIsEmergencyShortageTrue().stream()
                .map(this::mapToBloodInventoryResponse)
                .collect(Collectors.toList());
    }

    private BloodBankResponse mapToBloodBankResponse(BloodBank bloodBank, BigDecimal userLat, BigDecimal userLon) {
        Double distance = null;
        if (userLat != null && userLon != null) {
            distance = locationService.calculateDistance(
                    userLat, userLon, bloodBank.getLatitude(), bloodBank.getLongitude());
        }

        List<BloodInventoryResponse> inventories = bloodInventoryRepository
                .findByBloodBank(bloodBank).stream()
                .map(this::mapToBloodInventoryResponse)
                .collect(Collectors.toList());

        return BloodBankResponse.builder()
                .id(bloodBank.getId())
                .name(bloodBank.getName())
                .address(bloodBank.getAddress())
                .latitude(bloodBank.getLatitude())
                .longitude(bloodBank.getLongitude())
                .phone(bloodBank.getPhone())
                .distanceKm(distance)
                .inventories(inventories)
                .createdAt(bloodBank.getCreatedAt())
                .build();
    }

    private BloodInventoryResponse mapToBloodInventoryResponse(BloodInventory inventory) {
        return BloodInventoryResponse.builder()
                .id(inventory.getId())
                .bloodGroup(inventory.getBloodGroup())
                .quantityUnits(inventory.getQuantityUnits())
                .minimumThreshold(inventory.getMinimumThreshold())
                .isEmergencyShortage(inventory.getIsEmergencyShortage())
                .lastUpdated(inventory.getLastUpdated())
                .build();
    }
}

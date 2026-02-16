package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.CreateBloodBankRequest;
import com.ermn.model.dto.request.CreateHospitalRequest;
import com.ermn.model.dto.response.AdminDashboardResponse;
import com.ermn.model.dto.response.AmbulanceResponse;
import com.ermn.model.dto.response.BloodBankResponse;
import com.ermn.model.dto.response.HospitalResponse;
import com.ermn.model.dto.response.UserResponse;
import com.ermn.model.entity.BloodBank;
import com.ermn.model.entity.Hospital;
import com.ermn.model.entity.User;
import com.ermn.model.enums.BookingStatus;
import com.ermn.model.enums.Role;
import com.ermn.repository.AmbulanceRepository;
import com.ermn.repository.BedInventoryRepository;
import com.ermn.repository.BloodBankRepository;
import com.ermn.repository.BloodInventoryRepository;
import com.ermn.repository.BookingRepository;
import com.ermn.repository.HospitalRepository;
import com.ermn.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final BookingRepository bookingRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final BedInventoryRepository bedInventoryRepository;
    private final BloodInventoryRepository bloodInventoryRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final HospitalService hospitalService;
    private final BloodBankService bloodBankService;

    public AdminService(BookingRepository bookingRepository, AmbulanceRepository ambulanceRepository,
                      BedInventoryRepository bedInventoryRepository,
                      BloodInventoryRepository bloodInventoryRepository,
                      UserRepository userRepository,
                      HospitalRepository hospitalRepository,
                      BloodBankRepository bloodBankRepository,
                      HospitalService hospitalService,
                      BloodBankService bloodBankService) {
        this.bookingRepository = bookingRepository;
        this.ambulanceRepository = ambulanceRepository;
        this.bedInventoryRepository = bedInventoryRepository;
        this.bloodInventoryRepository = bloodInventoryRepository;
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.hospitalService = hospitalService;
        this.bloodBankService = bloodBankService;
    }

    public AdminDashboardResponse getDashboardMetrics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = todayStart.minusDays(7);
        LocalDateTime monthStart = todayStart.minusMonths(1);

        long bookingsToday = bookingRepository.countByStatusAndRequestedAtAfter(
                BookingStatus.REQUESTED, todayStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ASSIGNED, todayStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.EN_ROUTE, todayStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ARRIVED, todayStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.COMPLETED, todayStart);

        long bookingsWeek = bookingRepository.countByStatusAndRequestedAtAfter(
                BookingStatus.REQUESTED, weekStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ASSIGNED, weekStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.EN_ROUTE, weekStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ARRIVED, weekStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.COMPLETED, weekStart);

        long bookingsMonth = bookingRepository.countByStatusAndRequestedAtAfter(
                BookingStatus.REQUESTED, monthStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ASSIGNED, monthStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.EN_ROUTE, monthStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.ARRIVED, monthStart) +
                bookingRepository.countByStatusAndRequestedAtAfter(BookingStatus.COMPLETED, monthStart);

        long activeAmbulances = ambulanceRepository.countByIsAvailableTrueAndIsApprovedTrue();
        long pendingApprovals = ambulanceRepository.countByIsApprovedFalse();

        Double avgResponseTime = bookingRepository.calculateAverageResponseTime(monthStart);
        if (avgResponseTime == null) avgResponseTime = 0.0;

        Long totalCapacity = bedInventoryRepository.getTotalCapacity();
        Long totalOccupied = bedInventoryRepository.getTotalOccupied();
        double bedOccupancy = 0.0;
        if (totalCapacity != null && totalCapacity > 0) {
            bedOccupancy = (totalOccupied != null ? totalOccupied.doubleValue() : 0.0) / totalCapacity.doubleValue() * 100;
        }

        long bloodShortages = bloodInventoryRepository.countEmergencyShortages();

        return AdminDashboardResponse.builder()
                .totalBookingsToday(bookingsToday)
                .totalBookingsWeek(bookingsWeek)
                .totalBookingsMonth(bookingsMonth)
                .activeAmbulances(activeAmbulances)
                .averageResponseTimeSeconds(avgResponseTime)
                .bedOccupancyPercentage(bedOccupancy)
                .bloodShortageAlerts(bloodShortages)
                .pendingAmbulanceApprovals(pendingApprovals)
                .build();
    }

    public List<AmbulanceResponse> getPendingAmbulances() {
        return ambulanceRepository.findAll().stream()
                .filter(ambulance -> !ambulance.getIsApproved())
                .map(ambulance -> AmbulanceResponse.builder()
                        .id(ambulance.getId())
                        .vehicleNumber(ambulance.getVehicleNumber())
                        .isAvailable(ambulance.getIsAvailable())
                        .currentLatitude(ambulance.getCurrentLatitude())
                        .currentLongitude(ambulance.getCurrentLongitude())
                        .lastUpdatedLocation(ambulance.getLastUpdatedLocation())
                        .isApproved(ambulance.getIsApproved())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbulanceResponse approveAmbulance(Long ambulanceId) {
        return ambulanceRepository.findById(ambulanceId)
                .map(ambulance -> {
                    ambulance.setIsApproved(true);
                    ambulance = ambulanceRepository.save(ambulance);
                    return AmbulanceResponse.builder()
                            .id(ambulance.getId())
                            .vehicleNumber(ambulance.getVehicleNumber())
                            .isAvailable(ambulance.getIsAvailable())
                            .currentLatitude(ambulance.getCurrentLatitude())
                            .currentLongitude(ambulance.getCurrentLongitude())
                            .lastUpdatedLocation(ambulance.getLastUpdatedLocation())
                            .isApproved(ambulance.getIsApproved())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Ambulance not found"));
    }

    public Page<UserResponse> getAllUsers(Pageable pageable, String roleFilter) {
        if (roleFilter != null && !roleFilter.isBlank()) {
            Role role;
            try {
                role = Role.valueOf(roleFilter);
            } catch (IllegalArgumentException e) {
                return userRepository.findAll(pageable)
                        .map(this::mapToUserResponse);
            }
            return userRepository.findByRole(role, pageable)
                    .map(this::mapToUserResponse);
        }
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(isActive);
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Transactional
    public HospitalResponse createHospital(CreateHospitalRequest request) {
        User admin = userRepository.findById(request.getAdminUserId())
                .orElseThrow(() -> new CustomException("User not found"));
        if (admin.getRole() != Role.HOSPITAL_ADMIN) {
            throw new CustomException("User must have role HOSPITAL_ADMIN");
        }
        if (hospitalRepository.findByAdmin(admin).isPresent()) {
            throw new CustomException("This user is already assigned to a hospital");
        }
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .admin(admin)
                .build();
        hospital = hospitalRepository.save(hospital);
        return hospitalService.getHospital(hospital.getId(), null, null);
    }

    @Transactional
    public BloodBankResponse createBloodBank(CreateBloodBankRequest request) {
        User admin = userRepository.findById(request.getAdminUserId())
                .orElseThrow(() -> new CustomException("User not found"));
        if (admin.getRole() != Role.BLOOD_BANK_ADMIN) {
            throw new CustomException("User must have role BLOOD_BANK_ADMIN");
        }
        if (bloodBankRepository.findByAdmin(admin).isPresent()) {
            throw new CustomException("This user is already assigned to a blood bank");
        }
        BloodBank bloodBank = BloodBank.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .admin(admin)
                .build();
        bloodBank = bloodBankRepository.save(bloodBank);
        return bloodBankService.getMyBloodBank(admin.getEmail());
    }
}

package com.ermn.service;

import com.ermn.exception.CustomException;
import com.ermn.model.dto.request.BookingRequest;
import com.ermn.model.dto.response.AmbulanceResponse;
import com.ermn.model.dto.response.BookingResponse;
import com.ermn.model.entity.Ambulance;
import com.ermn.model.entity.Booking;
import com.ermn.model.entity.User;
import com.ermn.model.enums.BookingStatus;
import com.ermn.repository.AmbulanceRepository;
import com.ermn.repository.BookingRepository;
import com.ermn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final UserRepository userRepository;
    private final LocationService locationService;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, AmbulanceRepository ambulanceRepository,
                         UserRepository userRepository, LocationService locationService,
                         NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.ambulanceRepository = ambulanceRepository;
        this.userRepository = userRepository;
        this.locationService = locationService;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User citizen = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        // Find nearest available ambulance
        Ambulance nearestAmbulance = findNearestAmbulance(
                request.getPickupLatitude(), request.getPickupLongitude());

        Booking booking = Booking.builder()
                .citizen(citizen)
                .ambulance(nearestAmbulance)
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .destinationLatitude(request.getDestinationLatitude())
                .destinationLongitude(request.getDestinationLongitude())
                .status(nearestAmbulance != null ? BookingStatus.ASSIGNED : BookingStatus.REQUESTED)
                .requestedAt(LocalDateTime.now())
                .assignedAt(nearestAmbulance != null ? LocalDateTime.now() : null)
                .build();

        booking = bookingRepository.save(booking);

        if (nearestAmbulance != null) {
            nearestAmbulance.setIsAvailable(false);
            ambulanceRepository.save(nearestAmbulance);
            notificationService.createNotification(citizen.getId(),
                    "Ambulance Assigned", "An ambulance has been assigned to your request",
                    com.ermn.model.enums.NotificationType.BOOKING_UPDATE);
        }

        return mapToBookingResponse(booking);
    }

    private Ambulance findNearestAmbulance(BigDecimal pickupLat, BigDecimal pickupLon) {
        List<Ambulance> availableAmbulances = ambulanceRepository
                .findAvailableApprovedAmbulancesWithLocation();

        if (availableAmbulances.isEmpty()) {
            return null;
        }

        return availableAmbulances.stream()
                .min(Comparator.comparingDouble(ambulance ->
                        locationService.calculateDistance(
                                pickupLat, pickupLon,
                                ambulance.getCurrentLatitude(), ambulance.getCurrentLongitude())))
                .orElse(null);
    }

    public BookingResponse getBooking(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("Booking not found"));

        // Check authorization
        if (!booking.getCitizen().getId().equals(user.getId()) &&
            (booking.getAmbulance() == null || !booking.getAmbulance().getDriver().getId().equals(user.getId()))) {
            throw new CustomException("Unauthorized access to booking");
        }

        return mapToBookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        return bookingRepository.findByCitizenOrderByCreatedAtDesc(user).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("Booking not found"));

        if (!booking.getCitizen().getId().equals(user.getId())) {
            throw new CustomException("Unauthorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new CustomException("Cannot cancel a completed or already cancelled booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (booking.getAmbulance() != null) {
            booking.getAmbulance().setIsAvailable(true);
            ambulanceRepository.save(booking.getAmbulance());
        }

        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("Booking not found"));

        if (booking.getAmbulance() == null || !booking.getAmbulance().getDriver().getId().equals(user.getId())) {
            throw new CustomException("Unauthorized to update this booking");
        }

        booking.setStatus(status);
        if (status == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
            if (booking.getAmbulance() != null) {
                booking.getAmbulance().setIsAvailable(true);
                ambulanceRepository.save(booking.getAmbulance());
            }
        }

        booking = bookingRepository.save(booking);
        notificationService.createNotification(booking.getCitizen().getId(),
                "Booking Status Updated", "Your booking status has been updated to " + status,
                com.ermn.model.enums.NotificationType.BOOKING_UPDATE);

        return mapToBookingResponse(booking);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        AmbulanceResponse ambulanceResponse = null;
        if (booking.getAmbulance() != null) {
            ambulanceResponse = AmbulanceResponse.builder()
                    .id(booking.getAmbulance().getId())
                    .vehicleNumber(booking.getAmbulance().getVehicleNumber())
                    .isAvailable(booking.getAmbulance().getIsAvailable())
                    .currentLatitude(booking.getAmbulance().getCurrentLatitude())
                    .currentLongitude(booking.getAmbulance().getCurrentLongitude())
                    .lastUpdatedLocation(booking.getAmbulance().getLastUpdatedLocation())
                    .isApproved(booking.getAmbulance().getIsApproved())
                    .build();
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .citizen(mapToUserResponse(booking.getCitizen()))
                .ambulance(ambulanceResponse)
                .pickupLatitude(booking.getPickupLatitude())
                .pickupLongitude(booking.getPickupLongitude())
                .destinationLatitude(booking.getDestinationLatitude())
                .destinationLongitude(booking.getDestinationLongitude())
                .status(booking.getStatus())
                .requestedAt(booking.getRequestedAt())
                .assignedAt(booking.getAssignedAt())
                .completedAt(booking.getCompletedAt())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private com.ermn.model.dto.response.UserResponse mapToUserResponse(User user) {
        return com.ermn.model.dto.response.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

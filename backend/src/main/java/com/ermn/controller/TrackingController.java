package com.ermn.controller;

import com.ermn.model.dto.request.LocationUpdateRequest;
import com.ermn.model.entity.Ambulance;
import com.ermn.model.entity.Booking;
import com.ermn.repository.AmbulanceRepository;
import com.ermn.repository.BookingRepository;
import com.ermn.websocket.TrackingMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class TrackingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;
    private final AmbulanceRepository ambulanceRepository;

    public TrackingController(SimpMessagingTemplate messagingTemplate,
                            BookingRepository bookingRepository,
                            AmbulanceRepository ambulanceRepository) {
        this.messagingTemplate = messagingTemplate;
        this.bookingRepository = bookingRepository;
        this.ambulanceRepository = ambulanceRepository;
    }

    @MessageMapping("/tracking/update")
    @SendTo("/topic/tracking/{bookingId}")
    public TrackingMessage handleLocationUpdate(TrackingMessage message) {
        // Update ambulance location
        Booking booking = bookingRepository.findById(message.getBookingId())
                .orElse(null);

        if (booking != null && booking.getAmbulance() != null) {
            Ambulance ambulance = booking.getAmbulance();
            ambulance.setCurrentLatitude(message.getLatitude());
            ambulance.setCurrentLongitude(message.getLongitude());
            ambulance.setLastUpdatedLocation(LocalDateTime.now());
            ambulanceRepository.save(ambulance);
        }

        // Broadcast to all subscribers of this booking
        messagingTemplate.convertAndSend("/topic/tracking/" + message.getBookingId(), message);
        return message;
    }

    public void broadcastLocationUpdate(Long bookingId, LocationUpdateRequest request) {
        TrackingMessage message = TrackingMessage.builder()
                .bookingId(bookingId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/tracking/" + bookingId, message);
    }
}

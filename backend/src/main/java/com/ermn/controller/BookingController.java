package com.ermn.controller;

import com.ermn.model.dto.request.BookingRequest;
import com.ermn.model.dto.response.BookingResponse;
import com.ermn.model.enums.BookingStatus;
import com.ermn.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.createBooking(request, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBooking(id, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getUserBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getUserBookings(authentication.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, authentication.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, authentication.getName()));
    }
}

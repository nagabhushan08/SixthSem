package com.ermn.controller;

import com.ermn.model.dto.request.LocationUpdateRequest;
import com.ermn.model.dto.response.AmbulanceResponse;
import com.ermn.service.AmbulanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulances")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    public AmbulanceController(AmbulanceService ambulanceService) {
        this.ambulanceService = ambulanceService;
    }

    @GetMapping("/my-ambulance")
    public ResponseEntity<AmbulanceResponse> getMyAmbulance(Authentication authentication) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceByDriver(authentication.getName()));
    }

    @GetMapping("/available")
    public ResponseEntity<List<AmbulanceResponse>> getAvailableAmbulances() {
        return ResponseEntity.ok(ambulanceService.getAllAvailableAmbulances());
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<AmbulanceResponse> toggleAvailability(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ambulanceService.toggleAvailability(id, authentication.getName()));
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<AmbulanceResponse> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ambulanceService.updateLocation(id, request, authentication.getName()));
    }
}

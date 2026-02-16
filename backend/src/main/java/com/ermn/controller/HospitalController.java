package com.ermn.controller;

import com.ermn.model.dto.request.BedInventoryUpdateRequest;
import com.ermn.model.dto.response.BedInventoryResponse;
import com.ermn.model.dto.response.HospitalResponse;
import com.ermn.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<List<HospitalResponse>> getAllHospitals(
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude) {
        return ResponseEntity.ok(hospitalService.getAllHospitals(latitude, longitude));
    }

    @GetMapping("/my-hospital")
    public ResponseEntity<HospitalResponse> getMyHospital(Authentication authentication) {
        return ResponseEntity.ok(hospitalService.getMyHospital(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getHospital(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude) {
        return ResponseEntity.ok(hospitalService.getHospital(id, latitude, longitude));
    }

    @GetMapping("/{id}/beds")
    public ResponseEntity<List<BedInventoryResponse>> getBedInventory(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getBedInventory(id));
    }

    @PutMapping("/{id}/beds")
    public ResponseEntity<BedInventoryResponse> updateBedInventory(
            @PathVariable Long id,
            @Valid @RequestBody BedInventoryUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(hospitalService.updateBedInventory(id, request, authentication.getName()));
    }
}

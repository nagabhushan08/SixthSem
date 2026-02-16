package com.ermn.controller;

import com.ermn.model.dto.request.BloodInventoryUpdateRequest;
import com.ermn.model.dto.response.BloodBankResponse;
import com.ermn.model.dto.response.BloodInventoryResponse;
import com.ermn.model.enums.BloodGroup;
import com.ermn.service.BloodBankService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/blood-banks")
public class BloodBankController {

    private final BloodBankService bloodBankService;

    public BloodBankController(BloodBankService bloodBankService) {
        this.bloodBankService = bloodBankService;
    }

    @GetMapping
    public ResponseEntity<List<BloodBankResponse>> getAllBloodBanks(
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude) {
        return ResponseEntity.ok(bloodBankService.getAllBloodBanks(latitude, longitude));
    }

    @GetMapping("/my-blood-bank")
    public ResponseEntity<BloodBankResponse> getMyBloodBank(Authentication authentication) {
        return ResponseEntity.ok(bloodBankService.getMyBloodBank(authentication.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BloodBankResponse>> searchBloodBanks(
            @RequestParam BloodGroup bloodGroup,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude) {
        return ResponseEntity.ok(bloodBankService.searchBloodBanks(bloodGroup, latitude, longitude));
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<BloodInventoryResponse>> getBloodInventory(@PathVariable Long id) {
        return ResponseEntity.ok(bloodBankService.getBloodInventory(id));
    }

    @PutMapping("/{id}/inventory")
    public ResponseEntity<BloodInventoryResponse> updateBloodInventory(
            @PathVariable Long id,
            @Valid @RequestBody BloodInventoryUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bloodBankService.updateBloodInventory(id, request, authentication.getName()));
    }

    @GetMapping("/shortage")
    public ResponseEntity<List<BloodInventoryResponse>> getEmergencyShortages() {
        return ResponseEntity.ok(bloodBankService.getEmergencyShortages());
    }
}

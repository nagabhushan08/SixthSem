package com.ermn.controller;

import com.ermn.model.dto.request.CreateBloodBankRequest;
import com.ermn.model.dto.request.CreateHospitalRequest;
import com.ermn.model.dto.response.AdminDashboardResponse;
import com.ermn.model.dto.response.AmbulanceResponse;
import com.ermn.model.dto.response.BloodBankResponse;
import com.ermn.model.dto.response.HospitalResponse;
import com.ermn.model.dto.response.UserResponse;
import com.ermn.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/ambulances/pending")
    public ResponseEntity<List<AmbulanceResponse>> getPendingAmbulances() {
        return ResponseEntity.ok(adminService.getPendingAmbulances());
    }

    @PutMapping("/ambulances/{id}/approve")
    public ResponseEntity<AmbulanceResponse> approveAmbulance(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveAmbulance(id));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            Pageable pageable,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable, role));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, isActive));
    }

    @PostMapping("/hospitals")
    public ResponseEntity<HospitalResponse> createHospital(@Valid @RequestBody CreateHospitalRequest request) {
        return ResponseEntity.ok(adminService.createHospital(request));
    }

    @PostMapping("/blood-banks")
    public ResponseEntity<BloodBankResponse> createBloodBank(@Valid @RequestBody CreateBloodBankRequest request) {
        return ResponseEntity.ok(adminService.createBloodBank(request));
    }
}

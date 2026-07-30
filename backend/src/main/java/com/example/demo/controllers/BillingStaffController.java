package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.BillingStaffDto;
import com.example.demo.services.BillingStaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/billing-staff")
public class BillingStaffController {

    private final BillingStaffService service;

    public BillingStaffController(BillingStaffService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<BillingStaffDto> create(
            @Valid @RequestBody BillingStaffDto dto) {

        return ResponseEntity.ok(service.createStaff(dto));
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingStaffDto> getById(@PathVariable Long id) {

        return ResponseEntity.ok(service.getById(id));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<BillingStaffDto>> getAll() {

        return ResponseEntity.ok(service.getAll());
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<BillingStaffDto> update(
            @PathVariable Long id,
            @Valid @RequestBody BillingStaffDto dto) {

        return ResponseEntity.ok(service.updateStaff(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        service.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
    
    @GetMapping("/me")
    public ResponseEntity<BillingStaffDto> getLoggedInStaff(Authentication authentication) {
    	System.out.println("AUTH NAME = " + authentication.getName());
        String username = authentication.getName();
        return ResponseEntity.ok(service.getByUsername(username));
    }
}
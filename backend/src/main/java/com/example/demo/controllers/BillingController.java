package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.BillRequestDTO;
import com.example.demo.dto.BillResponseDTO;
import com.example.demo.services.BillingService;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired private BillingService billingService;

    // 🔥 Frontend isi raaste (URL) ko dhoond raha hai
    @PostMapping("/generate/{visitId}")
    public ResponseEntity<BillResponseDTO> generateBill(@PathVariable Long visitId) {
        // Hum getBillByVisitId method ko hi use karenge kyunki wo 
        // naya bill create bhi karta hai aur purana return bhi
        return ResponseEntity.ok(billingService.getBillByVisitId(visitId));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<BillResponseDTO> getBill(@PathVariable Long visitId) {
        return ResponseEntity.ok(billingService.getBillByVisitId(visitId));
    }

    @PostMapping("/pay/{visitId}")
    public ResponseEntity<BillResponseDTO> payBill(
            @PathVariable Long visitId, 
            @RequestParam String mode,
            @RequestBody BillRequestDTO request) { // 👈 Ye add kiya
        return ResponseEntity.ok(billingService.processPayment(visitId, mode, request));
    }
}
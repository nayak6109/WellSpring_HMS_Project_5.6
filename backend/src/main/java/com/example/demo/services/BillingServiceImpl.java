package com.example.demo.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Exceptions.ResourceNotFoundException;
import com.example.demo.dto.*;
import com.example.demo.entities.*;
import com.example.demo.model.PaymentMode;
import com.example.demo.payment.PaymentStrategy;
import com.example.demo.payment.PaymentStrategyFactory;
import com.example.demo.repository.*;

@Service
public class BillingServiceImpl implements BillingService {

    @Autowired private VisitRepository visitRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private MedicineRepository medicineRepository;
    @Autowired private PaymentStrategyFactory paymentStrategyFactory;
    

    @Override
    @Transactional
    public BillResponseDTO getBillByVisitId(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
            .orElseThrow(() -> new ResourceNotFoundException("Visit ID nahi mila."));

        double medTotal = visit.getMedicines().stream()
                .mapToDouble(m -> m.getMedicine().getPrice().doubleValue() * m.getDays())
                .sum();
        
        double labTotal = visit.getLabTests().stream()
                .mapToDouble(l -> l.getLabTest().getPrice())
                .sum();

        Bill bill = billRepository.findByVisitId(visitId).orElse(new Bill());
        bill.setVisit(visit);
        bill.setPharmacyTotal(medTotal);
        bill.setLabTotal(labTotal);
        bill.setGrandTotal(medTotal + labTotal);
        
        if (bill.getId() == null) {
            bill.setPaid(false);
        }

        // initial fetch pe visit ka poora data dikhayenge
        return mapToDTO(billRepository.save(bill), visit, null, null);
    }

    @Override
    @Transactional
    public BillResponseDTO processPayment(Long visitId, String paymentMode, BillRequestDTO request) {
        Bill bill = billRepository.findByVisitId(visitId)
            .orElseThrow(() -> new ResourceNotFoundException("Pehle Bill generate karein."));

        if (bill.isPaid()) {
            throw new IllegalStateException("Ye Bill pehle hi PAID ho chuka hai!");
        }

        double newMedTotal = 0;
        List<MedicineDto> paidMeds = new ArrayList<>();

        for (MedicineDto medReq : request.getMedicines()) {
            Medicine med = medicineRepository.findById(medReq.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

            if (med.getQuantity() < medReq.getQuantity()) {
                throw new RuntimeException("Stock khatam! " + med.getMedicineName() + " sirf " + med.getQuantity() + " bachi hai.");
            }

            med.setQuantity(med.getQuantity() - medReq.getQuantity());
            medicineRepository.save(med);
            
            double subTotal = med.getPrice().doubleValue() * medReq.getQuantity();
            newMedTotal += subTotal;

            // List for DTO
            paidMeds.add(medReq);
        }

        double newLabTotal = request.getLabTests().stream()
                .mapToDouble(l -> l.getPrice().doubleValue())
                .sum();

        // Database mein sahi calculations save ho rahi hain
        bill.setPharmacyTotal(newMedTotal);
        bill.setLabTotal(newLabTotal);
        bill.setGrandTotal(newMedTotal + newLabTotal);
        
        PaymentStrategy strategy =
                paymentStrategyFactory
                        .getStrategy(paymentMode);

        strategy.processPayment(bill);
        
        bill.setPaid(true);
        bill.setPaymentMode(
        	    PaymentMode.valueOf(paymentMode.toUpperCase())
        	);    
        Bill savedBill = billRepository.save(bill);
        
        // Final response mein sirf paid items bhej rahe hain
        return mapToDTO(savedBill, bill.getVisit(), paidMeds, request.getLabTests());
    }

    /* ================= UPDATED mapToDTO ================= */
    private BillResponseDTO mapToDTO(Bill bill, Visit visit, List<MedicineDto> paidMeds, List<LabTestDto> paidTests) {
        BillResponseDTO dto = new BillResponseDTO();
        dto.setBillId(bill.getId());
        dto.setVisitId(visit.getId());
     // ✅ YE DO LINES ADD KARO (Data yahan se jayega)
        dto.setPatientId(visit.getPatient().getId()); 
        dto.setDepartment(visit.getDepartment());  
        dto.setPatientName(visit.getPatient().getName());
        dto.setDoctorName(visit.getDoctor().getName());
        dto.setGrandTotal(bill.getGrandTotal()); // Database wala correct total
        dto.setPaid(bill.isPaid());
        
        
        // AGAR PAID HAI: Toh wahi dikhao jo request mein aaya tha
        if (bill.isPaid() && paidMeds != null) {
            dto.setMedicines(paidMeds);
            dto.setLabTests(paidTests);
        } 
        // AGAR UNPAID HAI (First Fetch): Toh Visit ka sara data dikhao
        else {
            if (visit.getMedicines() != null) {
                dto.setMedicines(visit.getMedicines().stream()
                    .map(vm -> {
                        MedicineDto mDto = new MedicineDto();
                        mDto.setId(vm.getMedicine().getId());
                        mDto.setMedicineName(vm.getMedicine().getMedicineName());
                        mDto.setPrice(vm.getMedicine().getPrice());
                        mDto.setQuantity(vm.getDays()); 
                        return mDto;
                    }).collect(Collectors.toList()));
            }
            if (visit.getLabTests() != null) {
                dto.setLabTests(visit.getLabTests().stream().map(vl -> {
                    LabTestDto lDto = new LabTestDto();
                    lDto.setId(vl.getLabTest().getId());
                    lDto.setTestName(vl.getLabTest().getName());
                    lDto.setPrice(BigDecimal.valueOf(vl.getLabTest().getPrice()));
                    return lDto;
                }).collect(Collectors.toList()));
            }
        }
        
        return dto;
    }
}
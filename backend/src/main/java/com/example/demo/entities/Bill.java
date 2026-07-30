package com.example.demo.entities;

import java.time.LocalDateTime;

import com.example.demo.model.PaymentMode;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Bill {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @OneToOne
        @JoinColumn(name = "visit_id")
        private Visit visit;
        private Double pharmacyTotal;
        private Double labTotal;
        private Double grandTotal;
        @Enumerated(EnumType.STRING)
        private PaymentMode paymentMode; // CASH, CARD, UPI
        private boolean isPaid;
        private LocalDateTime createdAt = LocalDateTime.now();
        
   		public Bill() {
			super();
			// TODO Auto-generated constructor stub
		}

		public Bill(Long id, Visit visit, Double pharmacyTotal, Double labTotal, Double grandTotal,
				PaymentMode paymentMode, boolean isPaid, LocalDateTime createdAt) {
			super();
			this.id = id;
			this.visit = visit;
			this.pharmacyTotal = pharmacyTotal;
			this.labTotal = labTotal;
			this.grandTotal = grandTotal;
			this.paymentMode = paymentMode;
			this.isPaid = isPaid;
			this.createdAt = createdAt;
		}

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public Visit getVisit() {
			return visit;
		}

		public void setVisit(Visit visit) {
			this.visit = visit;
		}

		public Double getPharmacyTotal() {
			return pharmacyTotal;
		}

		public void setPharmacyTotal(Double pharmacyTotal) {
			this.pharmacyTotal = pharmacyTotal;
		}

		public Double getLabTotal() {
			return labTotal;
		}

		public void setLabTotal(Double labTotal) {
			this.labTotal = labTotal;
		}

		public Double getGrandTotal() {
			return grandTotal;
		}

		public void setGrandTotal(Double grandTotal) {
			this.grandTotal = grandTotal;
		}

		public PaymentMode getPaymentMode() {
			return paymentMode;
		}

		public void setPaymentMode(PaymentMode paymentMode) {
			this.paymentMode = paymentMode;
		}

		public boolean isPaid() {
			return isPaid;
		}

		public void setPaid(boolean isPaid) {
			this.isPaid = isPaid;
		}

		public LocalDateTime getCreatedAt() {
			return createdAt;
		}

		public void setCreatedAt(LocalDateTime createdAt) {
			this.createdAt = createdAt;
		}
   		
   	
 
}
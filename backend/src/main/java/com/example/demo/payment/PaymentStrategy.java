package com.example.demo.payment;

import com.example.demo.entities.Bill;

public interface PaymentStrategy {

    void processPayment(Bill bill);

    String getPaymentMode();
}
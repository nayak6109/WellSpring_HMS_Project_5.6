package com.example.demo.payment;

import org.springframework.stereotype.Component;

import com.example.demo.entities.Bill;

@Component
public class CashPaymentStrategy
        implements PaymentStrategy {

    @Override
    public void processPayment(Bill bill) {

        System.out.println(
                "Cash Payment Success : "
                        + bill.getGrandTotal());
    }

    @Override
    public String getPaymentMode() {

        return "CASH";
    }
}
package com.example.demo.payment;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class PaymentStrategyFactory {

    private final List<PaymentStrategy>
            strategies;

    public PaymentStrategyFactory(
            List<PaymentStrategy> strategies) {

        this.strategies = strategies;
    }

    public PaymentStrategy getStrategy(
            String paymentMode) {

        return strategies.stream()
                .filter(strategy ->
                        strategy.getPaymentMode()
                                .equalsIgnoreCase(paymentMode))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid Payment Mode"));
    }
}
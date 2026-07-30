package com.example.demo.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Doctor ko User id se fetch karne ke liye
    Optional<Doctor> findByUserId(Long userId);
    
    // 🔥 YE ADD KARNA HI SOLUTION HAI
    Optional<Doctor> findByUserUsername(String username);

    // Available doctors list
    @Query("SELECT d FROM Doctor d JOIN FETCH d.user JOIN FETCH d.department")
    List<Doctor> findByAvailableTrue();
}

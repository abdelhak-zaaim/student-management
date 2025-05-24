package com.student.management.repository;

import com.student.management.domain.Payment;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Payment entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Find all payments for a specific student
    java.util.List<Payment> findByStudentId(Long studentId);
}

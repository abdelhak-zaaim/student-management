package com.student.management.service;

import com.student.management.domain.Payment;
import com.student.management.repository.PaymentRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.student.management.domain.Payment}.
 */
@Service
@Transactional
public class PaymentService {

    private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Save a payment.
     *
     * @param payment the entity to save.
     * @return the persisted entity.
     */
    public Payment save(Payment payment) {
        LOG.debug("Request to save Payment : {}", payment);
        return paymentRepository.save(payment);
    }

    /**
     * Update a payment.
     *
     * @param payment the entity to save.
     * @return the persisted entity.
     */
    public Payment update(Payment payment) {
        LOG.debug("Request to update Payment : {}", payment);
        return paymentRepository.save(payment);
    }

    /**
     * Partially update a payment.
     *
     * @param payment the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Payment> partialUpdate(Payment payment) {
        LOG.debug("Request to partially update Payment : {}", payment);

        return paymentRepository
            .findById(payment.getId())
            .map(existingPayment -> {
                if (payment.getAmount() != null) {
                    existingPayment.setAmount(payment.getAmount());
                }
                if (payment.getStatus() != null) {
                    existingPayment.setStatus(payment.getStatus());
                }
                if (payment.getDate() != null) {
                    existingPayment.setDate(payment.getDate());
                }

                return existingPayment;
            })
            .map(paymentRepository::save);
    }

    /**
     * Get all the payments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Payment> findAll(Pageable pageable) {
        LOG.debug("Request to get all Payments");
        return paymentRepository.findAll(pageable);
    }

    /**
     * Get all payments for a specific student.
     *
     * @param studentId the id of the student.
     * @return the list of payments.
     */
    @Transactional(readOnly = true)
    public java.util.List<Payment> findByStudentId(Long studentId) {
        LOG.debug("Request to get all Payments for Student : {}", studentId);
        return paymentRepository.findByStudentId(studentId);
    }

    /**
     * Get one payment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Payment> findOne(Long id) {
        LOG.debug("Request to get Payment : {}", id);
        return paymentRepository.findById(id);
    }

    /**
     * Delete the payment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Payment : {}", id);
        paymentRepository.deleteById(id);
    }
}

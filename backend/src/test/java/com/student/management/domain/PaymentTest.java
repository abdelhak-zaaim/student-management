package com.student.management.domain;

import static com.student.management.domain.PaymentTestSamples.*;
import static com.student.management.domain.StudentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.student.management.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PaymentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Payment.class);
        Payment payment1 = getPaymentSample1();
        Payment payment2 = new Payment();
        assertThat(payment1).isNotEqualTo(payment2);

        payment2.setId(payment1.getId());
        assertThat(payment1).isEqualTo(payment2);

        payment2 = getPaymentSample2();
        assertThat(payment1).isNotEqualTo(payment2);
    }

    @Test
    void studentTest() {
        Payment payment = getPaymentRandomSampleGenerator();
        Student studentBack = getStudentRandomSampleGenerator();

        payment.setStudent(studentBack);
        assertThat(payment.getStudent()).isEqualTo(studentBack);

        payment.student(null);
        assertThat(payment.getStudent()).isNull();
    }
}

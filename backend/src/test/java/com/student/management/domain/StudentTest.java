package com.student.management.domain;

import static com.student.management.domain.PaymentTestSamples.*;
import static com.student.management.domain.StudentGroupTestSamples.*;
import static com.student.management.domain.StudentTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.student.management.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class StudentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Student.class);
        Student student1 = getStudentSample1();
        Student student2 = new Student();
        assertThat(student1).isNotEqualTo(student2);

        student2.setId(student1.getId());
        assertThat(student1).isEqualTo(student2);

        student2 = getStudentSample2();
        assertThat(student1).isNotEqualTo(student2);
    }

    @Test
    void paymentsTest() {
        Student student = getStudentRandomSampleGenerator();
        Payment paymentBack = getPaymentRandomSampleGenerator();

        student.addPayments(paymentBack);
        assertThat(student.getPayments()).containsOnly(paymentBack);
        assertThat(paymentBack.getStudent()).isEqualTo(student);

        student.removePayments(paymentBack);
        assertThat(student.getPayments()).doesNotContain(paymentBack);
        assertThat(paymentBack.getStudent()).isNull();

        student.payments(new HashSet<>(Set.of(paymentBack)));
        assertThat(student.getPayments()).containsOnly(paymentBack);
        assertThat(paymentBack.getStudent()).isEqualTo(student);

        student.setPayments(new HashSet<>());
        assertThat(student.getPayments()).doesNotContain(paymentBack);
        assertThat(paymentBack.getStudent()).isNull();
    }

    @Test
    void studentGroupTest() {
        Student student = getStudentRandomSampleGenerator();
        StudentGroup studentGroupBack = getStudentGroupRandomSampleGenerator();

        student.setStudentGroup(studentGroupBack);
        assertThat(student.getStudentGroup()).isEqualTo(studentGroupBack);

        student.studentGroup(null);
        assertThat(student.getStudentGroup()).isNull();
    }
}

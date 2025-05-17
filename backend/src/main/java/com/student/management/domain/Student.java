package com.student.management.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Student.
 */
@Entity
@Table(name = "student")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Student implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Size(max = 10, min = 10)
    @Column(name = "phone", length = 10)
    private String phone;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "student")
    @JsonIgnoreProperties(value = { "student" }, allowSetters = true)
    private Set<Payment> payments = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "students", "subjects" }, allowSetters = true)
    private StudentGroup studentGroup;



    

    public Long getId() {
        return this.id;
    }

    public Student id(Long id) {
        this.setId(id);
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Student user(User user) {
        this.setUser(user);
        return this;
    }

    public Set<Payment> getPayments() {
        return this.payments;
    }

    public void setPayments(Set<Payment> payments) {
        if (this.payments != null) {
            this.payments.forEach(i -> i.setStudent(null));
        }
        if (payments != null) {
            payments.forEach(i -> i.setStudent(this));
        }
        this.payments = payments;
    }

    public Student payments(Set<Payment> payments) {
        this.setPayments(payments);
        return this;
    }

    public Student addPayments(Payment payment) {
        this.payments.add(payment);
        payment.setStudent(this);
        return this;
    }

    public Student removePayments(Payment payment) {
        this.payments.remove(payment);
        payment.setStudent(null);
        return this;
    }

    public StudentGroup getStudentGroup() {
        return this.studentGroup;
    }

    public void setStudentGroup(StudentGroup studentGroup) {
        this.studentGroup = studentGroup;
    }

    public Student studentGroup(StudentGroup studentGroup) {
        this.setStudentGroup(studentGroup);
        return this;
    }

    

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Student)) {
            return false;
        }
        return getId() != null && getId().equals(((Student) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Student{" +
            "id=" + getId() +
            "}";
    }
}

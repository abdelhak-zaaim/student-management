package com.student.management.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A StudentGroup.
 */
@Entity
@Table(name = "student_group")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StudentGroup implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "studentGroup")
    @JsonIgnoreProperties(value = { "user", "payments", "studentGroup" }, allowSetters = true)
    private Set<Student> students = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_student_group__subjects",
        joinColumns = @JoinColumn(name = "student_group_id"),
        inverseJoinColumns = @JoinColumn(name = "subjects_id")
    )
    @JsonIgnoreProperties(value = { "professors", "studentGroups" }, allowSetters = true)
    private Set<Subject> subjects = new HashSet<>();

    

    public Long getId() {
        return this.id;
    }

    public StudentGroup id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public StudentGroup name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public StudentGroup description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Student> getStudents() {
        return this.students;
    }

    public void setStudents(Set<Student> students) {
        if (this.students != null) {
            this.students.forEach(i -> i.setStudentGroup(null));
        }
        if (students != null) {
            students.forEach(i -> i.setStudentGroup(this));
        }
        this.students = students;
    }

    public StudentGroup students(Set<Student> students) {
        this.setStudents(students);
        return this;
    }

    public StudentGroup addStudents(Student student) {
        this.students.add(student);
        student.setStudentGroup(this);
        return this;
    }

    public StudentGroup removeStudents(Student student) {
        this.students.remove(student);
        student.setStudentGroup(null);
        return this;
    }

    public Set<Subject> getSubjects() {
        return this.subjects;
    }

    public void setSubjects(Set<Subject> subjects) {
        this.subjects = subjects;
    }

    public StudentGroup subjects(Set<Subject> subjects) {
        this.setSubjects(subjects);
        return this;
    }

    public StudentGroup addSubjects(Subject subject) {
        this.subjects.add(subject);
        return this;
    }

    public StudentGroup removeSubjects(Subject subject) {
        this.subjects.remove(subject);
        return this;
    }

    

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StudentGroup)) {
            return false;
        }
        return getId() != null && getId().equals(((StudentGroup) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StudentGroup{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}

package com.student.management.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A Subject.
 */
@Entity
@Table(name = "subject")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Subject implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_subject__professors",
        joinColumns = @JoinColumn(name = "subject_id"),
        inverseJoinColumns = @JoinColumn(name = "professors_id")
    )
    @JsonIgnoreProperties(value = { "user", "subjects" }, allowSetters = true)
    private Set<Professor> professors = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "subjects")
    @JsonIgnoreProperties(value = { "students", "subjects" }, allowSetters = true)
    private Set<StudentGroup> studentGroups = new HashSet<>();

    public Long getId() {
        return this.id;
    }

    public Subject id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Subject name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Subject description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Professor> getProfessors() {
        return this.professors;
    }

    public void setProfessors(Set<Professor> professors) {
        this.professors = professors;
    }

    public Subject professors(Set<Professor> professors) {
        this.setProfessors(professors);
        return this;
    }

    public Subject addProfessors(Professor professor) {
        this.professors.add(professor);
        return this;
    }

    public Subject removeProfessors(Professor professor) {
        this.professors.remove(professor);
        return this;
    }

    public Set<StudentGroup> getStudentGroups() {
        return this.studentGroups;
    }

    public void setStudentGroups(Set<StudentGroup> studentGroups) {
        if (this.studentGroups != null) {
            this.studentGroups.forEach(i -> i.removeSubjects(this));
        }
        if (studentGroups != null) {
            studentGroups.forEach(i -> i.addSubjects(this));
        }
        this.studentGroups = studentGroups;
    }

    public Subject studentGroups(Set<StudentGroup> studentGroups) {
        this.setStudentGroups(studentGroups);
        return this;
    }

    public Subject addStudentGroup(StudentGroup studentGroup) {
        this.studentGroups.add(studentGroup);
        studentGroup.getSubjects().add(this);
        return this;
    }

    public Subject removeStudentGroup(StudentGroup studentGroup) {
        this.studentGroups.remove(studentGroup);
        studentGroup.getSubjects().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Subject)) {
            return false;
        }
        return getId() != null && getId().equals(((Subject) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Subject{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}

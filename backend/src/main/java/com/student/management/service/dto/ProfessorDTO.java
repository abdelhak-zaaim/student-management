package com.student.management.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.student.management.domain.CourseAssignment;
import com.student.management.domain.Professor;
import com.student.management.domain.User;

import java.util.List;
import java.util.Objects;

/**
 * DTO class for representing a professor with embedded course assignments.
 */
public class ProfessorDTO {
    private Long id;
    private User user;
    private List<CourseAssignment> courseAssignments;

    public ProfessorDTO(Professor professor, List<CourseAssignment> courseAssignments) {
        this.id = professor.getId();
        this.user = professor.getUser();
        this.courseAssignments = courseAssignments;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @JsonProperty("courseAssignments")
    public List<CourseAssignment> getCourseAssignments() {
        return courseAssignments;
    }

    public void setCourseAssignments(List<CourseAssignment> courseAssignments) {
        this.courseAssignments = courseAssignments;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProfessorDTO that = (ProfessorDTO) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

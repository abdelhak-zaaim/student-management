package com.student.management.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.student.management.domain.CourseAssignment;
import com.student.management.domain.Professor;

import java.util.List;

/**
 * DTO class for representing a professor with their course assignments.
 */
public class ProfessorWithAssignmentsDTO {
    private Professor professor;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private List<CourseAssignment> courseAssignments;

    public ProfessorWithAssignmentsDTO(Professor professor, List<CourseAssignment> courseAssignments) {
        this.professor = professor;
        this.courseAssignments = courseAssignments;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public List<CourseAssignment> getCourseAssignments() {
        return courseAssignments;
    }

    public void setCourseAssignments(List<CourseAssignment> courseAssignments) {
        this.courseAssignments = courseAssignments;
    }
}

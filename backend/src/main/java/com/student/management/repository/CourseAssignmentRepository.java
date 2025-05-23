package com.student.management.repository;


import com.student.management.domain.CourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Long> {
    List<CourseAssignment> findByStudentGroupId(Long studentGroupId);
    List<CourseAssignment> findBySubjectId(Long subjectId);
    List<CourseAssignment> findByProfessorId(Long professorId);
}
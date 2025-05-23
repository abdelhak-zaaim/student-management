package com.student.management.service;


import com.student.management.domain.CourseAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface CourseAssignmentService {
    CourseAssignment save(CourseAssignment courseAssignment);
    Optional<CourseAssignment> partialUpdate(CourseAssignment courseAssignment);
    List<CourseAssignment> findAll();
    Page<CourseAssignment> findAll(Pageable pageable);
    Optional<CourseAssignment> findOne(Long id);
    void delete(Long id);
    List<CourseAssignment> findByStudentGroupId(Long studentGroupId);
    List<CourseAssignment> findBySubjectId(Long subjectId);
    List<CourseAssignment> findByProfessorId(Long professorId);
}